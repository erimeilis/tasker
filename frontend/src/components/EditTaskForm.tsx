import { useEffect, useState } from 'react'
import { useUpdateTask, useTags } from '@/api/taskApi'
import { Task, TaskStatus, TaskPriority } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/TagInput'

interface EditTaskFormProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

export function EditTaskForm({ task, isOpen, onClose }: EditTaskFormProps) {
  const updateTaskMutation = useUpdateTask()
  const { data: existingTags } = useTags()

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || TaskStatus.PENDING,
    priority: task?.priority || TaskPriority.MEDIUM,
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : '',
    tags: task?.tags?.map((t) => t.name) || [],
  })

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        tags: task.tags?.map((t) => t.name) || [],
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !formData.title.trim()) return

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      })
      onClose()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="edit-title" className="text-base">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="edit-description" className="text-base">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter task description (optional)"
              rows={3}
              className="mt-2 resize-none"
            />
          </div>

          <div>
            <div className="grid grid-cols-3 gap-4 mb-2">
              <Label htmlFor="edit-status" className="text-base">
                Status
              </Label>
              <Label htmlFor="edit-priority" className="text-base">
                Priority
              </Label>
              <Label htmlFor="edit-dueDate" className="text-base">
                Due Date
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as TaskStatus,
                  }))
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: value as TaskPriority,
                  }))
                }
              >
                <SelectTrigger id="edit-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>

              <DatePicker
                id="edit-dueDate"
                value={formData.dueDate}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, dueDate: value }))
                }
                placeholder="Select due date"
              />
            </div>
          </div>

          <div>
            <Label className="text-base">Tags</Label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              existingTags={existingTags?.map((t) => t.name) || []}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateTaskMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateTaskMutation.isPending}
              className="cursor-pointer"
            >
              {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
