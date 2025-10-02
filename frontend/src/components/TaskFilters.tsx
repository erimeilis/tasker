import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { IconSearch, IconX } from '@tabler/icons-react'
import { TaskStatus, TaskPriority } from '@/types/task'
import { useTaskFilters } from '@/hooks/useTaskFilters'
import { useTags } from '@/api/taskApi'

export function TaskFilters() {
  const {
    filters,
    localSearch,
    updateFilter,
    updateSearch,
    clearFilters,
    clearSearch,
    hasActiveFilters,
  } = useTaskFilters()

  const { data: existingTags } = useTags()

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium mb-2">
            Search
          </Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              value={localSearch}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="pl-10 pr-10"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <IconX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status-filter" className="text-sm font-medium mb-2">
              Status
            </Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                updateFilter('status', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger id="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="priority-filter"
              className="text-sm font-medium mb-2"
            >
              Priority
            </Label>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                updateFilter('priority', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger id="priority-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags-filter" className="text-sm font-medium mb-2">
              Tags
            </Label>
            <Select
              value={filters.tags || 'all'}
              onValueChange={(value) =>
                updateFilter('tags', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger id="tags-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {existingTags?.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {localSearch && (
              <Badge variant="secondary" className="gap-1">
                Search: {localSearch}
                <button
                  onClick={clearSearch}
                  className="ml-1 hover:text-foreground"
                  aria-label="Clear search filter"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                {filters.status.replace('_', ' ')}
                <button
                  onClick={() => updateFilter('status', undefined)}
                  className="ml-1 hover:text-foreground"
                  aria-label="Clear status filter"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.priority && (
              <Badge variant="secondary" className="gap-1">
                {filters.priority}
                <button
                  onClick={() => updateFilter('priority', undefined)}
                  className="ml-1 hover:text-foreground"
                  aria-label="Clear priority filter"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.tags && (
              <Badge variant="secondary" className="gap-1">
                {filters.tags}
                <button
                  onClick={() => updateFilter('tags', undefined)}
                  className="ml-1 hover:text-foreground"
                  aria-label="Clear tag filter"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
