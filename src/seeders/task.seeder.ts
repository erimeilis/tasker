import { DataSource } from 'typeorm'
import { Task, TaskStatus, TaskPriority } from '../task/task.entity'

export const seedTasks = async (dataSource: DataSource): Promise<void> => {
  const taskRepository = dataSource.getRepository(Task)

  const demoTasks = [
    {
      title: 'Set up project structure',
      description:
        'Create the initial folder structure and configure the development environment',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2025-10-05'),
    },
    {
      title: 'Implement user authentication',
      description: 'Add login, registration, and JWT token management',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2025-10-10'),
    },
    {
      title: 'Design database schema',
      description: 'Create entity relationships and database migrations',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date('2025-09-28'),
    },
    {
      title: 'Create API endpoints',
      description: 'Implement RESTful API endpoints for task management',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2025-10-02'),
    },
    {
      title: 'Build responsive UI',
      description: 'Create a modern, responsive user interface with React',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date('2025-10-15'),
    },
    {
      title: 'Add unit tests',
      description: 'Write comprehensive unit tests for all components',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date('2025-10-20'),
    },
    {
      title: 'Configure CI/CD pipeline',
      description: 'Set up automated testing and deployment pipeline',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      dueDate: new Date('2025-10-25'),
    },
    {
      title: 'Write documentation',
      description: 'Create comprehensive API and user documentation',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      dueDate: new Date('2025-10-30'),
    },
  ]

  for (const taskData of demoTasks) {
    const task = taskRepository.create(taskData)
    await taskRepository.save(task)
  }

  console.log('✅ Seeded demo tasks successfully')
}
