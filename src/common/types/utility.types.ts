/**
 * Advanced TypeScript Utility Types for Type Safety
 */

// Branded types for type-safe IDs
export type Brand<K, T> = K & { __brand: T }
export type TaskId = Brand<string, 'TaskId'>
export type TagId = Brand<string, 'TagId'>

// Utility type for paginated responses
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Utility type for API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

// Utility type for query filters
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like'

export interface QueryFilter<T> {
  field: keyof T
  operator: FilterOperator
  value: unknown
}

// Utility type for sorting
export type SortDirection = 'ASC' | 'DESC'

export interface SortOptions<T> {
  field: keyof T
  direction: SortDirection
}

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Deep readonly type
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Require at least one property
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

// Require only one property
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

// Nullable utility
export type Nullable<T> = T | null

// Optional utility
export type Optional<T> = T | undefined

// Maybe type (null or undefined)
export type Maybe<T> = T | null | undefined

// Non-nullable fields
export type NonNullableFields<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}

// Mutable type (opposite of Readonly)
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

// Extract properties of a certain type
export type ExtractPropertiesOfType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

// Exclude properties of a certain type
export type ExcludePropertiesOfType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}

// Function type utilities
export type AsyncFunction<T extends unknown[] = unknown[], R = unknown> = (
  ...args: T
) => Promise<R>

export type VoidFunction<T extends unknown[] = unknown[]> = (...args: T) => void

// Generic repository interface
export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>
  findAll(options?: {
    skip?: number
    take?: number
    where?: Partial<T>
  }): Promise<T[]>
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: ID, data: Partial<T>): Promise<T>
  delete(id: ID): Promise<void>
  count(where?: Partial<T>): Promise<number>
}

// Type-safe event emitter types
export interface TypedEventEmitter<EventMap extends Record<string, unknown>> {
  on<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): this
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean
  off<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): this
}

// Validation result type
export interface ValidationResult<T = unknown> {
  isValid: boolean
  errors?: Array<{
    field: string
    message: string
    constraint: string
  }>
  data?: T
}
