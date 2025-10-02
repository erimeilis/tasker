import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TaskList } from '@/components/TaskList'
import { TaskStats } from '@/components/TaskStats'
import { CreateTaskForm } from '@/components/CreateTaskForm'
import { useWebSocket } from '@/hooks/useWebSocket'

const taskSearchSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  create: z.boolean().optional(),
})

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: taskSearchSchema,
})

function Index() {
  // Enable real-time updates via WebSocket
  useWebSocket()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <CreateTaskForm />
      </div>

      <TaskStats />

      <div>
        <h3 className="text-2xl font-semibold mb-6 tracking-tight">Tasks</h3>
        <TaskList />
      </div>
    </div>
  )
}
