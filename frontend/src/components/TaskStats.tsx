import { useNavigate } from '@tanstack/react-router'
import { useTaskStats } from '@/api/taskApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskStatus } from '@/types/task'

export function TaskStats() {
  const navigate = useNavigate()
  const { data: stats, isLoading, error } = useTaskStats()

  const handleStatusClick = (status?: TaskStatus) => {
    void navigate({
      to: '/',
      search: { status },
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array<undefined>(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load task statistics</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const byStatus = stats.byStatus as unknown as Record<string, number>

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      color: 'text-primary',
      status: undefined,
    },
    {
      title: 'Pending',
      value: byStatus.pending || 0,
      color: 'text-yellow-600',
      status: TaskStatus.PENDING,
    },
    {
      title: 'In Progress',
      value: byStatus.in_progress || 0,
      color: 'text-blue-600',
      status: TaskStatus.IN_PROGRESS,
    },
    {
      title: 'Completed',
      value: byStatus.completed || 0,
      color: 'text-green-600',
      status: TaskStatus.COMPLETED,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card
          key={stat.title}
          className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
          onClick={() => handleStatusClick(stat.status)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
