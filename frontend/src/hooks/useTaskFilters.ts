import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { TaskStatus, TaskPriority, TaskFilters } from '@/types/task'

export function useTaskFilters() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/' })

  // Local search state for instant feedback
  const [localSearch, setLocalSearch] = useState(searchParams.search || '')
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Sync URL search param to local state
  useEffect(() => {
    setLocalSearch(searchParams.search || '')
  }, [searchParams.search])

  const filters: TaskFilters = {
    search: localSearch,
    status: searchParams.status as TaskStatus | undefined,
    priority: searchParams.priority as TaskPriority | undefined,
    tags: searchParams.tags,
  }

  const updateFilter = useCallback(
    (key: keyof Omit<TaskFilters, 'search'>, value: string | undefined) => {
      void navigate({
        to: '/',
        search: (prev) => ({
          ...prev,
          [key]: value,
          page: 1, // Reset to page 1 when filtering
        }),
      })
    },
    [navigate]
  )

  const updateSearch = useCallback(
    (value: string) => {
      setLocalSearch(value)

      // Debounce search updates to URL
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        void navigate({
          to: '/',
          search: (prev) => ({
            ...prev,
            search: value || undefined,
            page: 1,
          }),
        })
      }, 300)
    },
    [navigate]
  )

  const clearFilters = useCallback(() => {
    setLocalSearch('')
    void navigate({
      to: '/',
      search: (prev) => ({
        ...prev,
        search: undefined,
        status: undefined,
        priority: undefined,
        tags: undefined,
        page: 1,
      }),
    })
  }, [navigate])

  const clearSearch = useCallback(() => {
    setLocalSearch('')
    void navigate({
      to: '/',
      search: (prev) => ({
        ...prev,
        search: undefined,
        page: 1,
      }),
    })
  }, [navigate])

  const hasActiveFilters =
    localSearch || filters.status || filters.priority || filters.tags

  return {
    filters,
    localSearch,
    updateFilter,
    updateSearch,
    clearFilters,
    clearSearch,
    hasActiveFilters,
  }
}
