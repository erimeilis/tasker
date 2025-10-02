import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useCreateTask, useTags } from '@/api/taskApi'
import { TaskStatus, TaskPriority } from '@/types/task'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/TagInput'
import { IconPlus } from '@tabler/icons-react'

export function CreateTaskForm() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/' })
  const createTaskMutation = useCreateTask()
  const { data: existingTags } = useTags()

  const isOpen = searchParams.create === true

  const setIsOpen = (open: boolean) => {
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, create: open || undefined }),
    })
  }

  useEffect(() => {
    if (!isOpen) {
      void form.reset()
    }
  }, [isOpen])

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      dueDate: '',
      tags: [] as string[],
    },
    onSubmit: async ({ value }) => {
      try {
        await createTaskMutation.mutateAsync({
          ...value,
          dueDate: value.dueDate || undefined,
          tags: value.tags.length > 0 ? value.tags : undefined,
        })
        setIsOpen(false)
        form.reset()
      } catch (error) {
        console.error('Failed to create task:', error)
      }
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg cursor-pointer">
          <IconPlus className="h-5 w-5 mr-2" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Title is required'
                  : value.length < 3
                    ? 'Title must be at least 3 characters'
                    : undefined,
              onSubmit: ({ value }) =>
                !value ? 'Title is required' : undefined,
            }}
            children={(field) => (
              <div>
                <Label htmlFor="title" className="text-base">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors?.length > 0}
                  className="mt-2"
                  autoFocus
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          />

          <form.Field
            name="description"
            children={(field) => (
              <div>
                <Label htmlFor="description" className="text-base">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description (optional)"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                  className="mt-2 resize-none"
                />
              </div>
            )}
          />

          <div>
            <div className="grid grid-cols-3 gap-4 mb-2">
              <Label htmlFor="status" className="text-base">
                Status
              </Label>
              <Label htmlFor="priority" className="text-base">
                Priority
              </Label>
              <Label htmlFor="dueDate" className="text-base">
                Due Date
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <form.Field
                name="status"
                children={(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as TaskStatus)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskStatus.PENDING}>
                        Pending
                      </SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>
                        In Progress
                      </SelectItem>
                      <SelectItem value={TaskStatus.COMPLETED}>
                        Completed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <form.Field
                name="priority"
                children={(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as TaskPriority)
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                      <SelectItem value={TaskPriority.MEDIUM}>
                        Medium
                      </SelectItem>
                      <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <form.Field
                name="dueDate"
                children={(field) => (
                  <DatePicker
                    id="dueDate"
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value)}
                    placeholder="Select due date"
                  />
                )}
              />
            </div>
          </div>

          <form.Field
            name="tags"
            children={(field) => (
              <div>
                <Label htmlFor="tags" className="text-base">
                  Tags
                </Label>
                <TagInput
                  tags={field.state.value}
                  onChange={(tags) => field.handleChange(tags)}
                  existingTags={existingTags?.map((t) => t.name) || []}
                />
              </div>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createTaskMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="cursor-pointer"
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
