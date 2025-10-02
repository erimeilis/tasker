import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, queryKeys } from './client'
import {
  Task,
  Tag,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStats,
  PaginatedResponse,
  TaskQueryParams,
} from '../types/task'

// Get all tasks with pagination and filters
export const useTasks = (params: TaskQueryParams = {}) => {
  return useQuery({
    queryKey: [...queryKeys.tasks, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()

      if (params.status) searchParams.append('status', params.status)
      if (params.priority) searchParams.append('priority', params.priority)
      if (params.search) searchParams.append('search', params.search)
      if (params.tags) searchParams.append('tags', params.tags)
      if (params.sortBy) searchParams.append('sortBy', params.sortBy)
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())

      const queryString = searchParams.toString()
      const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`

      return apiClient.get<PaginatedResponse<Task>>(endpoint)
    },
  })
}

// Get single task
export const useTask = (id: string) => {
  return useQuery({
    queryKey: queryKeys.task(id),
    queryFn: () => apiClient.get<Task>(`/tasks/${id}`),
    enabled: !!id,
  })
}

// Get task statistics
export const useTaskStats = () => {
  return useQuery({
    queryKey: queryKeys.taskStats,
    queryFn: () => apiClient.get<TaskStats>('/tasks/statistics'),
  })
}

// Get all tags
export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.get<Tag[]>('/tasks/tags'),
  })
}

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (task: CreateTaskRequest) =>
      apiClient.post<Task>('/tasks', task),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
      void queryClient.invalidateQueries({ queryKey: queryKeys.taskStats })
      void queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...updates }: UpdateTaskRequest) =>
      apiClient.patch<Task>(`/tasks/${id}`, updates),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(data.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.taskStats })
      void queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
      void queryClient.invalidateQueries({ queryKey: queryKeys.taskStats })
    },
  })
}
