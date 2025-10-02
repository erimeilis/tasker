import { createLazyFileRoute } from '@tanstack/react-router'
import { TaskList } from '@/components/TaskList'
import { TaskStats } from '@/components/TaskStats'
import { CreateTaskForm } from '@/components/CreateTaskForm'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <CreateTaskForm />
      </div>

      <TaskStats />

      <div>
        <h3 className="text-2xl font-semibold mb-4">Tasks</h3>
        <TaskList />
      </div>
    </div>
  )
}
