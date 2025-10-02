import React from 'react'
import { useTasks, useUpdateTask, useDeleteTask } from '@/api/taskApi'
import { Task, TaskStatus, TaskQueryParams } from '@/types/task'
import { Card, CardContent } from '@/components/ui/card'
import { EditTaskForm } from '@/components/EditTaskForm'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { TaskFilters } from '@/components/TaskFilters'
import { TaskPagination } from '@/components/TaskPagination'
import { TaskItem } from '@/components/TaskItem'
import { useTaskFilters } from '@/hooks/useTaskFilters'
import { useSearch } from '@tanstack/react-router'

export function TaskList() {
  const searchParams = useSearch({ from: '/' })
  const { filters, localSearch } = useTaskFilters()
  const deleteTaskMutation = useDeleteTask()
  const updateTaskMutation = useUpdateTask()

  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(
    null
  )

  // Build query params
  const queryParams: TaskQueryParams = {
    page: searchParams.page || 1,
    limit: searchParams.limit || 10,
    search: localSearch || undefined,
    status: filters.status,
    priority: filters.priority,
    tags: filters.tags,
    sortBy: (searchParams.sortBy as string) || 'createdAt',
    sortOrder: searchParams.sortOrder || 'DESC',
  }

  const { data, isLoading, error } = useTasks(queryParams)

  const handleToggleComplete = async (task: Task) => {
    const newStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.PENDING
        : TaskStatus.COMPLETED

    await updateTaskMutation.mutateAsync({
      id: task.id,
      status: newStatus,
    })
  }

  const handleDelete = async () => {
    if (deletingTaskId) {
      await deleteTaskMutation.mutateAsync(deletingTaskId)
      setDeletingTaskId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TaskFilters />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading tasks...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <TaskFilters />
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">
            Error loading tasks: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TaskFilters />

      {/* Task List */}
      {data && data.data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={setDeletingTaskId}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No tasks found. Create one to get started!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && <TaskPagination total={data.total} />}

      {/* Modals */}
      <EditTaskForm
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={() => void handleDelete()}
        isDeleting={deleteTaskMutation.isPending}
        taskTitle=""
      />
    </div>
  )
}
