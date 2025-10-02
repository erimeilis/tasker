import { Test, TestingModule } from '@nestjs/testing'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { QueryTaskDto } from './dto/query-task.dto'
import { TaskStatus, TaskPriority } from './task.entity'
import { Task } from './task.entity'
import { Tag } from './entities/tag.entity'

describe('TaskController', () => {
  let controller: TaskController
  let service: TaskService

  const mockTask: Task = {
    id: '123',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2025-12-31'),
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTag: Tag = {
    id: '1',
    name: 'urgent',
    color: '#ff0000',
    tasks: [],
    createdAt: new Date(),
  }

  const mockPaginatedResult = {
    data: [mockTask],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockTask),
            findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
            findOne: jest.fn().mockResolvedValue(mockTask),
            update: jest.fn().mockResolvedValue(mockTask),
            remove: jest.fn().mockResolvedValue(undefined),
            getAllTags: jest.fn().mockResolvedValue([mockTag]),
          },
        },
      ],
    }).compile()

    controller = module.get<TaskController>(TaskController)
    service = module.get<TaskService>(TaskService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
      }

      const result = await controller.create(createTaskDto)

      expect(service.create).toHaveBeenCalledWith(createTaskDto)
      expect(result).toEqual(mockTask)
    })

    it('should create a task with tags', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        tags: ['urgent', 'important'],
      }

      const result = await controller.create(createTaskDto)

      expect(service.create).toHaveBeenCalledWith(createTaskDto)
      expect(result).toEqual(mockTask)
    })

    it('should create a task with due date', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dueDate: '2025-12-31',
      }

      const result = await controller.create(createTaskDto)

      expect(service.create).toHaveBeenCalledWith(createTaskDto)
      expect(result).toEqual(mockTask)
    })
  })

  describe('findAll', () => {
    it('should return all tasks with default params', async () => {
      const queryDto: QueryTaskDto = {}

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should return tasks filtered by status', async () => {
      const queryDto: QueryTaskDto = {
        status: TaskStatus.COMPLETED,
      }

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should return tasks filtered by priority', async () => {
      const queryDto: QueryTaskDto = {
        priority: TaskPriority.HIGH,
      }

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should return tasks with search query', async () => {
      const queryDto: QueryTaskDto = {
        search: 'test query',
      }

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should return tasks filtered by tags', async () => {
      const queryDto: QueryTaskDto = {
        tags: 'urgent,important',
      }

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should return paginated tasks', async () => {
      const queryDto: QueryTaskDto = {
        page: 2,
        limit: 5,
      }

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should return tasks with custom sorting', async () => {
      const queryDto: QueryTaskDto = {
        sortBy: 'title',
        sortOrder: 'ASC',
      }

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should handle combined filters', async () => {
      const queryDto: QueryTaskDto = {
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        search: 'urgent',
        tags: 'important',
        page: 1,
        limit: 20,
        sortBy: 'dueDate',
        sortOrder: 'ASC',
      }

      const result = await controller.findAll(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual(mockPaginatedResult)
    })
  })

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const result = await controller.findOne('123')

      expect(service.findOne).toHaveBeenCalledWith('123')
      expect(result).toEqual(mockTask)
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.COMPLETED,
      }

      const result = await controller.update('123', updateTaskDto)

      expect(service.update).toHaveBeenCalledWith('123', updateTaskDto)
      expect(result).toEqual(mockTask)
    })

    it('should update task status', async () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
      }

      const result = await controller.update('123', updateTaskDto)

      expect(service.update).toHaveBeenCalledWith('123', updateTaskDto)
      expect(result).toEqual(mockTask)
    })

    it('should update task priority', async () => {
      const updateTaskDto: UpdateTaskDto = {
        priority: TaskPriority.HIGH,
      }

      const result = await controller.update('123', updateTaskDto)

      expect(service.update).toHaveBeenCalledWith('123', updateTaskDto)
      expect(result).toEqual(mockTask)
    })

    it('should update task tags', async () => {
      const updateTaskDto: UpdateTaskDto = {
        tags: ['new-tag', 'another-tag'],
      }

      const result = await controller.update('123', updateTaskDto)

      expect(service.update).toHaveBeenCalledWith('123', updateTaskDto)
      expect(result).toEqual(mockTask)
    })

    it('should update task due date', async () => {
      const updateTaskDto: UpdateTaskDto = {
        dueDate: '2026-01-01',
      }

      const result = await controller.update('123', updateTaskDto)

      expect(service.update).toHaveBeenCalledWith('123', updateTaskDto)
      expect(result).toEqual(mockTask)
    })

    it('should clear task description', async () => {
      const updateTaskDto: UpdateTaskDto = {
        description: '',
      }

      const result = await controller.update('123', updateTaskDto)

      expect(service.update).toHaveBeenCalledWith('123', updateTaskDto)
      expect(result).toEqual(mockTask)
    })
  })

  describe('remove', () => {
    it('should remove a task', async () => {
      await controller.remove('123')

      expect(service.remove).toHaveBeenCalledWith('123')
    })
  })

  describe('getAllTags', () => {
    it('should return all tags', async () => {
      const result = await controller.getAllTags()

      expect(service.getAllTags).toHaveBeenCalled()
      expect(result).toEqual([mockTag])
    })

    it('should return empty array when no tags exist', async () => {
      jest.spyOn(service, 'getAllTags').mockResolvedValue([])

      const result = await controller.getAllTags()

      expect(service.getAllTags).toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })
})
