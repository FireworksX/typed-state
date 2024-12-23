import type {
  DataField,
  Graph,
  CreateStateOptions,
  GraphState,
  SetOptions,
  Entity,
  ResolveOptions,
  ResolveEntityByType,
  SystemFields,
  LinkKey,
  SubscribeCallback,
  SubscribeOptions,
} from 'src'
import { isPartialKey } from 'src'
import { isObject } from 'src'
import { isLinkKey, isGraph } from 'src'
import { shallowEqual } from './utils/checker'
import { createCache } from './cache'
import { joinKeys } from './utils/joinKeys'
import { isPartOfGraph } from './utils/isPartOfGraph'
import { uniqueLinks } from './utils/unique'
import { isDev } from './utils/isDev'
import { isPrimitive, isValue } from '@graph-state/checkers'
import { createPluginsStore } from './plugins'
import { debug } from './helpers/help'

let ID = 0
const DEEP_LIMIT = 100
const STATE_TYPE = 'State'
const EACH_UPDATED = '$EACH:ROOT$'

export const createState = <TEntity extends SystemFields = SystemFields, TRootType extends LinkKey = LinkKey>(
  options?: CreateStateOptions<TEntity, TRootType>
): GraphState<TEntity, TRootType> => {
  const id = options?._id ?? `${ID++}`
  const type = options?._type ?? (STATE_TYPE as TRootType)
  const keys = options?.keys ?? {}
  const stateKey = `${type}:${id}` as const
  const skipPredictors = options?.skip ?? []
  const cache = createCache()
  const subscribers = new Map<string, SubscribeCallback[]>()
  let deepIndex = 0

  const isSkipped = (entity: DataField) => {
    return skipPredictors.some(predictor => predictor(entity))
  }

  const resolve = <TInput extends Entity>(
    input?: TInput,
    options?: ResolveOptions
  ): ResolveEntityByType<TEntity, TInput> | null => {
    const isDeep = options?.deep ?? false
    const isSafe = options?.safe ?? false
    const inputKey = isValue(input) ? keyOfEntity(input) : null
    let value = inputKey ? (cache.readLink(inputKey) as any) : null

    if (isSkipped(value)) return value

    if (isObject(value) || Array.isArray(value)) {
      value = Object.entries(value).reduce((acc, [key, value]) => {
        let resultValue = value

        if (!isSkipped(resultValue)) {
          if (Array.isArray(value)) {
            resultValue = value.map(v => {
              if (isLinkKey(v) && !isSafe && !cache.hasLink(v)) {
                return null
              }

              return isPartOfGraph(v, inputKey) || isDeep ? safeResolve(v, options) : v
            })

            if (!isSafe) {
              resultValue = resultValue.filter(isValue)
            }
          } else {
            if (isLinkKey(value) && !isSafe && !cache.hasLink(value)) {
              resultValue = null
            } else if (isPartOfGraph(keyOfEntity(value as any), inputKey) || isDeep) {
              resultValue = safeResolve(value, options)
            }
          }
        }

        acc[key] = resultValue
        return acc
      }, {} as Graph)
    }

    return value ? { ...value } : isSafe ? input : null
  }

  const safeResolve = (input?: Entity, options?: ResolveOptions) => resolve(input, options) ?? input

  const unlinkGraph = (entity: Entity) => {
    const graphKey = keyOfEntity(entity)

    if (graphKey) {
      const deps = cache.getChildren(graphKey) || []
      deps.forEach(depLink => {
        if (!isPartialKey(depLink)) {
          cache.removeRefs(graphKey, depLink)
        }
      })
    }
  }

  const mutateField = (input: DataField, parentFieldKey?: string, options?: SetOptions): DataField => {
    if (((!input || isPrimitive(input)) && !isLinkKey(input)) || isSkipped(input)) {
      return input
    }

    if (Array.isArray(input)) {
      return input.map((item, index) => {
        const indexKey = parentFieldKey ? joinKeys(parentFieldKey, `${index}`) : undefined
        return mutateField(item, indexKey, options)
      })
    }

    const entityKey = isLinkKey(input) ? input : isGraph(input) ? keyOfEntity(input) : null
    const childKey = entityKey ?? parentFieldKey
    const mutateMethod = options?.overrideMutateMethod || mutate
    return mutateMethod(childKey as any, input, options)
  }

  const mutate = (entity: Entity, ...args: any[]) => {
    const { graphKey: entityGraphKey, options, data: rawData } = getArgumentsForMutate(entity, ...args)
    const data = isLinkKey(rawData) ? entityOfKey(rawData) : rawData
    const graphKey = entityGraphKey ?? stateKey
    const parentKey = options?.parent
    const prevGraph: any = resolve(graphKey ?? '')
    const internal = options?.internal || { hasChange: false }
    let graphData: Graph = {
      ...data,
      ...entityOfKey(graphKey),
    }
    const isTopLevelGraph = !options?.parent
    const isReplace = options?.replace
      ? typeof options?.replace === 'function'
        ? options.replace(graphData)
        : options?.replace === 'deep'
          ? true
          : isTopLevelGraph || isPartialKey(graphKey)
      : false

    if (isSkipped(data)) {
      cache.writeLink(graphKey, data, parentKey)
      return graphKey
    }

    if (!isReplace && isObject(prevGraph) && isObject(graphData)) {
      graphData = {
        ...prevGraph,
        ...graphData,
      } as any
    }

    if (isReplace) {
      unlinkGraph(graphKey)
    }

    const nextGraph = Object.entries(graphData).reduce((acc, [key, value]) => {
      const fieldKey = joinKeys(graphKey, key)
      let fieldValue = value
      const prevValue = prevGraph?.[key]

      if (!isSkipped(fieldValue)) {
        if (isObject(fieldValue) || Array.isArray(fieldValue) || isLinkKey(fieldValue)) {
          fieldValue = mutateField(fieldValue, fieldKey, {
            ...options,
            parent: graphKey,
            internal,
          })
        }

        if (!isReplace && Array.isArray(fieldValue) && Array.isArray(prevValue)) {
          fieldValue = [...prevValue, ...fieldValue]
        }

        if (Array.isArray(fieldValue) && options?.dedup !== false) {
          fieldValue = uniqueLinks(...fieldValue)
        }
      }

      internal.hasChange =
        internal.hasChange || !shallowEqual(prevValue, fieldKey === fieldValue ? safeResolve(fieldValue) : fieldValue)

      if (!isReplace && isLinkKey(prevValue) && prevValue !== fieldValue) {
        cache.removeRefs(graphKey, prevValue)
        debug(
          `Garbage Collector remove link ${prevValue} from ${graphKey}.
Prev value: ${prevValue} (${typeof prevValue}).
Next value: ${fieldValue} (${typeof fieldValue}).
GraphKey: ${graphKey}.
FieldKey: ${fieldKey}.
`
        )
      }

      acc[key] = fieldValue

      return acc
    }, {} as Graph)

    cache.writeLink(graphKey, nextGraph, parentKey)

    /**
     * When complete nested updates, call GB
     */
    if (!parentKey) {
      cache.runGarbageCollector()
    }

    /**
     * Notify after remove garbage
     */
    if (internal.hasChange) {
      notify(graphKey, prevGraph)
    }

    return graphKey
  }

  const invalidate = (entity: Entity) => {
    const key = keyOfEntity(entity)

    if (key) {
      const parents = cache.getParents(key) || []
      cache.invalidate(key)

      parents.forEach(parentKey => {
        const prevParent = cache.readLink(parentKey)
        const freshParent = resolve(parentKey, { safe: false })

        cache.writeLink(parentKey, freshParent)
        notify(parentKey, prevParent)
      })
    }
  }

  const notify = (entity: Entity, prevState: Graph | null | undefined) => {
    if (deepIndex > DEEP_LIMIT) {
      throw new Error('Too deep notify.')
    }

    const key = keyOfEntity(entity)

    if (key) {
      deepIndex++
      const subs = subscribers.get(key) || []
      const deps = cache.getChildren(key) || []
      const nextResult = resolve(key) as Graph

      subscribers.get(EACH_UPDATED)?.forEach(cb => {
        cb(nextResult, prevState)
      })

      subs.forEach(cb => {
        cb(nextResult, prevState)
      })
      deps.forEach(dep => notify(dep, prevState))
    }

    deepIndex = 0
  }

  const subscribe = <TInput extends Entity | string = string>(...args: any[]) => {
    const input: TInput = typeof args[0] === 'function' ? EACH_UPDATED : args[0]
    const callback = typeof args[0] === 'function' ? args[0] : args[1]
    const options: SubscribeOptions | undefined = typeof args[0] === 'function' ? args[1] : args[2]
    const key = keyOfEntity(input)

    if (key) {
      if (subscribers.has(key)) {
        subscribers.set(key, [...Array.from(subscribers.get(key) || []), callback])
      } else {
        subscribers.set(key, [callback])
      }

      cache.onRemoveLink((link, prevValue) => {
        if (link === key) {
          notify(key, prevValue)
        }
      })
    }

    const unsubscribe = () => {
      if (key) {
        const subIndex = (subscribers.get(key) || []).findIndex(sub => sub === callback)

        if (subIndex !== -1) {
          const nextSubscribers = subscribers.get(key) || []
          nextSubscribers.splice(subIndex, 1)

          subscribers.set(key, nextSubscribers)
        }
      }
    }

    if (options?.signal) {
      options.signal.addEventListener('abort', unsubscribe, { once: true })
    }

    return unsubscribe
  }

  const inspectFields = (graphType: Graph['_type']) => [...(cache.types.get(graphType) ?? [])]

  const resolveParents = (field: Entity) => {
    const key = (typeof field === 'string' ? field : keyOfEntity(field)) || ''
    const refs = cache.getParents(key) ?? []
    return refs.map(ref => resolve(ref))
  }

  const keyOfEntity = (entity: Entity) => {
    if (typeof entity === 'string') {
      return entityOfKey(entity) ? entity : null
    }
    if (!entity?._type) {
      return null
    }

    let entityId: string | null = null

    if (entity._type in keys) {
      entityId = keys[entity._type]?.(entity) ?? null
    } else if (isValue(entity.id) || isValue(entity._id)) {
      entityId = `${entity.id ?? entity._id}`
    }

    return !entityId ? entityId : `${entity._type}:${entityId}`
  }

  const entityOfKey = (entity?: Entity) => {
    if (isObject(entity) && (entity as any)?._type && keyOfEntity(entity)) {
      return entity as any as Graph
    }
    if (!entity || typeof entity !== 'string') return null

    const [typeName, ...restTypes] = entity.split(':')
    if (!typeName || restTypes.length < 1) return null

    return {
      _type: typeName,
      _id: restTypes.join(':'),
    }
  }

  const getArgumentsForMutate = (entity: string | Entity, ...args: any[]) => {
    let data = typeof entity === 'string' ? args[0] : entity
    if (typeof data === 'function') {
      data = data(resolve(entity))
    } else if (isLinkKey(data)) {
      data = entityOfKey(data)
    }

    return {
      graphKey: typeof entity === 'string' ? entity : keyOfEntity(entity),
      options: typeof entity === 'string' ? args[1] : (args[0] as SetOptions | undefined),
      data,
    }
  }

  if (options?.initialState) {
    mutate(options.initialState as any, { replace: true })
  }

  const graphState: GraphState<TEntity, TRootType> = {
    _type: type,
    _id: id,
    key: stateKey,
    mutate,
    subscribe,
    resolve,
    safeResolve,
    resolveParents,
    inspectFields,
    invalidate,
    keyOfEntity,
    entityOfKey,
    getArgumentsForMutate,
    types: cache.types,
    cache,
    subscribers: isDev ? subscribers : undefined,
    onRemoveLink: cache.onRemoveLink,
  }

  const pluginsStore = createPluginsStore(graphState, options?.plugins)

  return pluginsStore.runPlugins()
}
