import type { DebugCallback } from './debug'

export type Type = string

export interface SystemFields {
  _type: Type
  id?: string | number | null
  _id?: string | number | null
}

export interface DataFields {
  [fieldName: string]: DataField
}

export type Graph = SystemFields & DataFields

export type DataField = Scalar | Graph | undefined | Scalar[] | Graph[]

export type Entity = undefined | null | Graph | string

export type LinkKey = string

export interface ScalarObject {
  constructor?: Function
  [key: string]: any
}

export type Scalar = Primitive | ScalarObject
export type Primitive = null | number | boolean | string
export type KeyGenerator = (data: Graph) => string | null
export type ResolverResult = DataField | (DataFields & { __typename?: string }) | null | undefined
export type ResolveInfo = unknown

export type Resolver<TParent = Graph, TResult = ResolverResult> = (
  parent: TParent,
  state: GraphState,
  info: ResolveInfo
) => TResult

export interface KeyingConfig {
  [typename: string]: KeyGenerator
}

export type ResolverConfig = {
  [typeName: string]:
    | {
        [fieldName: string]: Resolver | undefined
      }
    | undefined
}

export type AnyObject = Record<PropertyKey, unknown>

export type DataSetter<T = any> = T | ((prev: T) => T)

export type Dispatch<T> = (value: T) => void

export type MutateField = (
  graph: Graph | Graph[] | null,
  parentFieldKey?: LinkKey,
  options?: MutateOptions
) => (LinkKey | LinkKey[] | null | null[])[] | LinkKey

export interface MutateInternal {
  hasChange?: boolean
  path: string[]
  unlinks?: Map<LinkKey, LinkKey[]>
  visitors: Map<LinkKey, LinkKey[]>
  isPartialGraph?: boolean
  updatedFields?: string[]
}

export interface MutateOptions {
  replace?: true | 'deep' | ((graph: Graph) => boolean)
  overrideMutateMethod?: GraphState['mutate']
  parent?: Entity
  prevValue?: unknown
  dedup?: boolean
  internal?: MutateInternal
}

export interface SubscribeOptions<TResult = any> {
  signal?: AbortSignal
  updateSelector?: SubscribeCallback<TResult>['updateSelector']
}

export type Plugin = <TState extends GraphState>(state: TState) => TState | void

export type SkipGraphPredictor = (dataField: DataField) => boolean

export type CacheListener = (link: LinkKey, prevValue?: Graph | null) => void

export interface CreateStateOptions<TEntity extends SystemFields = SystemFields, TType extends LinkKey = LinkKey> {
  _type?: TType
  _id?: string
  initialState?: Omit<ResolveEntityByType<TEntity, { _type: TType }>, keyof SystemFields>
  plugins?: Plugin[]
  keys?: KeyingConfig
  resolvers?: ResolverConfig
  skip?: SkipGraphPredictor[]
}

export interface ResolveOptions {
  deep?: boolean
  safe?: boolean
}

type NeverToUnknown<T> = [T] extends [never] ? unknown : T

export type ResolveEntityByType<
  TEntity extends SystemFields,
  TInput extends Entity,
> = TInput extends `${infer TType}:${string}`
  ? NeverToUnknown<Extract<TEntity, { _type: TType }>>
  : TInput extends SystemFields
    ? NeverToUnknown<Extract<TEntity, { _type: TInput['_type'] }>>
    : unknown

export type GetStateEntity<T> = T extends GraphState<infer TEntity> ? TEntity : never

export type GetStateEntityType<T> = GetStateEntity<T>['_type']

export type StateDataSetter<TEntity extends SystemFields, TInput extends Entity> = DataSetter<
  Partial<Omit<ResolveEntityByType<TEntity, TInput>, keyof SystemFields>>
>

export type SubscribeCallback<T = any> = {
  callback: (nextValue: Graph | null, prevValue?: Graph | null) => void
  updateSelector?: (nextValue: T, prevValue?: T, updatedFields?: string[]) => boolean
}

export interface GraphState<TEntity extends SystemFields = SystemFields, TRootType extends LinkKey = LinkKey>
  extends Graph {
  _type: TRootType
  key: `${TRootType}:${string}`
  resolve<const TInput extends Entity>(
    input: TInput,
    options?: ResolveOptions
  ): ResolveEntityByType<TEntity, TInput> | null
  mutate<const TInput extends Graph | null>(
    graph: TInput & Partial<ResolveEntityByType<TEntity, TInput>>,
    options?: MutateOptions
  ): string | null
  mutate<TInput extends string>(
    key: TInput,
    data: StateDataSetter<TEntity, TInput>,
    options?: MutateOptions
  ): string | null
  invalidate(field: Entity): void
  subscribe<TData = unknown>(callback: (data: TData) => void, options?: SubscribeOptions): () => void
  subscribe<TInput extends Graph | string, TResult extends ResolveEntityByType<TEntity, TInput>>(
    input: TInput,
    callback: (next: TResult, prev: TResult) => void,
    options?: SubscribeOptions<TResult>
  ): () => void
  inspectFields(type: string): string[]
  resolveParents(field: Entity): unknown[]
  keyOfEntity(entity: Entity): LinkKey | null
  entityOfKey(key: LinkKey): Graph | null
  getArgumentsForMutate(
    field: string | Graph,
    args: Parameters<GraphState<TEntity>['mutate']>
  ): {
    graphKey: string | null
    options?: MutateOptions
    data: DataSetter
  }
  onDebugEvent(callback: DebugCallback): void
  types: Map<Type, Set<LinkKey>>
}
