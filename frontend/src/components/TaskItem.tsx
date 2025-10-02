import { useNavigate } from '@tanstack/react-router'
import { Task, TaskStatus, TaskPriority } from '@/types/task'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  IconCheck,
  IconCircle,
  IconClock,
  IconTrash,
  IconEdit,
  IconTag,
  IconCalendar,
} from '@tabler/icons-react'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (task: Task) => Promise<void>
}

const statusIcons = {
  [TaskStatus.PENDING]: IconCircle,
  [TaskStatus.IN_PROGRESS]: IconClock,
  [TaskStatus.COMPLETED]: IconCheck,
} as const

const statusVariants = {
  [TaskStatus.PENDING]: 'secondary',
  [TaskStatus.IN_PROGRESS]: 'default',
  [TaskStatus.COMPLETED]: 'outline',
} as const

const priorityVariants = {
  [TaskPriority.LOW]: 'secondary',
  [TaskPriority.MEDIUM]: 'default',
  [TaskPriority.HIGH]: 'destructive',
} as const

export function TaskItem({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskItemProps) {
  const navigate = useNavigate()
  const StatusIcon = statusIcons[task.status]
  const isCompleted = task.status === TaskStatus.COMPLETED

  const handleFilterByStatus = (status: TaskStatus) => {
    void navigate({
      to: '/',
      search: { status },
    })
  }

  const handleFilterByPriority = (priority: TaskPriority) => {
    void navigate({
      to: '/',
      search: { priority },
    })
  }

  const handleFilterByTag = (tagName: string) => {
    void navigate({
      to: '/',
      search: { tags: tagName },
    })
  }

  return (
    <Card className="group hover:border-primary/50 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Status Toggle Icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      onToggleComplete(task).catch((err: unknown) => {
                        console.error('Toggle error:', err)
                      })
                    }}
                    className="mt-1 flex-shrink-0 hover:scale-110 transition-transform text-muted-foreground hover:text-foreground"
                    aria-label={
                      isCompleted ? 'Mark as incomplete' : 'Mark as complete'
                    }
                  >
                    <StatusIcon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <CardTitle
                className={`text-base font-medium mb-2 ${
                  isCompleted
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground'
                }`}
              >
                {task.title}
              </CardTitle>

              {task.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 items-center">
                <Badge
                  variant={statusVariants[task.status]}
                  className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleFilterByStatus(task.status)}
                >
                  {task.status.replace('_', ' ')}
                </Badge>

                <Badge
                  variant={priorityVariants[task.priority]}
                  className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleFilterByPriority(task.priority)}
                >
                  {task.priority}
                </Badge>

                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconCalendar className="h-3 w-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1 items-center">
                    <IconTag className="h-3 w-3 text-muted-foreground" />
                    {task.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleFilterByTag(tag.name)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(task)}
                    className="h-8 w-8 cursor-pointer"
                    aria-label="Edit task"
                  >
                    <IconEdit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit task</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(task.id)}
                    className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                    aria-label="Delete task"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete task</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
