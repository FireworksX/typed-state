import { useCallback, useRef } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import type {
  ResolveOptions,
  Dispatch,
  Entity,
  GraphState,
  GetStateEntity,
  ResolveEntityByType,
  StateDataSetter,
} from '@graph-state/core'

interface GraphOptions extends ResolveOptions {}

export type StateResolve<TState extends GraphState, TEntity extends Entity> = ResolveEntityByType<
  GetStateEntity<TState>,
  TEntity
>

export const useGraph = <TState extends GraphState, const TEntity extends Entity>(
  graphState: TState,
  field: TEntity = graphState.key as TEntity,
  options?: GraphOptions
): [StateResolve<TState, TEntity>, Dispatch<StateDataSetter<GetStateEntity<TState>, TEntity>>] => {
  const nextValue = useRef<StateResolve<TState, TEntity>>(
    graphState.resolve(field, options) as any as StateResolve<TState, TEntity>
  )
  const fieldKey = graphState.keyOfEntity(field) ?? field

  const subscribe = useCallback(
    (onChange: any) => {
      if (fieldKey) {
        nextValue.current = graphState.resolve(fieldKey, options) as any as StateResolve<TState, TEntity>
        onChange()

        return graphState.subscribe(fieldKey, (data: any) => {
          nextValue.current = data
          return onChange()
        })
      }

      return () => undefined
    },
    [graphState, fieldKey]
  )

  const updateState = useCallback(
    value => {
      const key: any = typeof field === 'string' ? field : graphState.keyOfEntity(field)

      if (field && key) {
        graphState.mutate(key, value)
      }
    },
    [graphState, field]
  )

  const get = () => nextValue.current

  return [useSyncExternalStore(subscribe, get, get), updateState]
}
