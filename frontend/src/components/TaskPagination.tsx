import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { usePagination } from '@/hooks/usePagination'

interface TaskPaginationProps {
  total: number
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50, 100] as const

export function TaskPagination({ total }: TaskPaginationProps) {
  const {
    pagination,
    setPage,
    setLimit,
    previousPage,
    nextPage,
    canGoPrevious,
    canGoNext,
  } = usePagination({ total })

  const getPageNumbers = (): number[] => {
    const pages: number[] = []
    const maxVisible = 5
    const { page, totalPages } = pagination

    if (totalPages <= 0) return pages

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Smart pagination with ellipsis
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Per Page Selector */}
          <div className="flex items-center gap-2">
            <Label htmlFor="per-page" className="text-sm whitespace-nowrap">
              Per page:
            </Label>
            <Select
              value={String(pagination.limit)}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger id="per-page" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Navigation - Only show if more than 1 page */}
          {pagination.totalPages > 1 ? (
            <>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousPage}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 cursor-pointer"
                  aria-label="Previous page"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>

                {pageNumbers.map((pageNum, idx, arr) => {
                  const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1

                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={
                          pageNum === pagination.page ? 'default' : 'outline'
                        }
                        size="icon"
                        onClick={() => setPage(pageNum)}
                        className="h-8 w-8 cursor-pointer"
                        aria-label={`Page ${pageNum}`}
                        aria-current={
                          pageNum === pagination.page ? 'page' : undefined
                        }
                      >
                        {pageNum}
                      </Button>
                    </React.Fragment>
                  )
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextPage}
                  disabled={!canGoNext}
                  className="h-8 w-8 cursor-pointer"
                  aria-label="Next page"
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground whitespace-nowrap">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {pagination.total} {pagination.total === 1 ? 'task' : 'tasks'}{' '}
              total
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
