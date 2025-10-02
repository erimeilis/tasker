export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  tags?: string[]
}

export interface UpdateTaskRequest {
  id: string
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  tags?: string[]
}

export interface TaskStats {
  totalTasks: number
  byStatus: {
    pending: number
    in_progress: number
    completed: number
  }
  byPriority: {
    low: number
    medium: number
    high: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TaskQueryParams {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  tags?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  page?: number
  limit?: number
}

export interface TaskFilters {
  search: string
  status?: TaskStatus
  priority?: TaskPriority
  tags?: string
}

export interface PaginationState {
  page: number
  limit: number
  totalPages: number
  total: number
}
