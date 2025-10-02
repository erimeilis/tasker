import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { PaginationState } from '@/types/task'

interface UsePaginationProps {
  total: number
  defaultLimit?: number
}

export function usePagination({
  total,
  defaultLimit = 10,
}: UsePaginationProps) {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/' })

  const currentPage = searchParams.page || 1
  const limit = searchParams.limit || defaultLimit
  const totalPages = Math.ceil(total / limit)

  const pagination: PaginationState = {
    page: currentPage,
    limit,
    totalPages,
    total,
  }

  const setPage = useCallback(
    (page: number) => {
      void navigate({
        to: '/',
        search: (prev) => ({
          ...prev,
          page,
        }),
      })
    },
    [navigate]
  )

  const setLimit = useCallback(
    (newLimit: number) => {
      void navigate({
        to: '/',
        search: (prev) => ({
          ...prev,
          limit: newLimit,
          page: 1, // Reset to first page when changing limit
        }),
      })
    },
    [navigate]
  )

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1)
    }
  }, [currentPage, totalPages, setPage])

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setPage(currentPage - 1)
    }
  }, [currentPage, setPage])

  const canGoNext = currentPage < totalPages
  const canGoPrevious = currentPage > 1

  return {
    pagination,
    setPage,
    setLimit,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
  }
}
