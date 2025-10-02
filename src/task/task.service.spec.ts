import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { TaskService } from './task.service'
import { TaskGateway } from './task.gateway'
import { Task } from './task.entity'
import { Tag } from './entities/tag.entity'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { QueryTaskDto } from './dto/query-task.dto'
import { TaskStatus, TaskPriority } from './task.entity'
import { NotFoundException } from '@nestjs/common'

describe('TaskService', () => {
  let service: TaskService
  let taskRepository: Repository<Task>
  let tagRepository: Repository<Tag>
  let queryBuilder: SelectQueryBuilder<Task>

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

  beforeEach(async () => {
    // Mock QueryBuilder
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
    } as unknown as SelectQueryBuilder<Task>

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn().mockReturnValue(mockTask),
            save: jest.fn().mockResolvedValue(mockTask),
            findOne: jest.fn().mockResolvedValue(mockTask),
            remove: jest.fn().mockResolvedValue(mockTask),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockReturnValue(mockTag),
            save: jest.fn().mockResolvedValue(mockTag),
            find: jest.fn().mockResolvedValue([mockTag]),
          },
        },
        {
          provide: TaskGateway,
          useValue: {
            emitTaskCreated: jest.fn(),
            emitTaskUpdated: jest.fn(),
            emitTaskDeleted: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<TaskService>(TaskService)
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task))
    tagRepository = module.get<Repository<Tag>>(getRepositoryToken(Tag))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a task without tags', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
      }

      const result = await service.create(createTaskDto)

      expect(taskRepository.create).toHaveBeenCalledWith({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        priority: createTaskDto.priority,
        tags: [],
      })
      expect(taskRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockTask)
    })

    it('should create a task with tags', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        tags: ['urgent', 'important'],
      }

      jest.spyOn(tagRepository, 'findOne').mockResolvedValue(null)

      const result = await service.create(createTaskDto)

      expect(tagRepository.findOne).toHaveBeenCalled()
      expect(tagRepository.create).toHaveBeenCalled()
      expect(tagRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockTask)
    })

    it('should reuse existing tags', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        tags: ['urgent'],
      }

      jest.spyOn(tagRepository, 'findOne').mockResolvedValue(mockTag)

      await service.create(createTaskDto)

      expect(tagRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'urgent' },
      })
      expect(tagRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('should return paginated tasks with default params', async () => {
      const queryDto: QueryTaskDto = {}

      const result = await service.findAll(queryDto)

      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'task.tags',
        'tag',
      )
      expect(result).toEqual({
        data: [mockTask],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    })

    it('should filter by status', async () => {
      const queryDto: QueryTaskDto = {
        status: TaskStatus.COMPLETED,
      }

      await service.findAll(queryDto)

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: TaskStatus.COMPLETED },
      )
    })

    it('should filter by priority', async () => {
      const queryDto: QueryTaskDto = {
        priority: TaskPriority.HIGH,
      }

      await service.findAll(queryDto)

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'task.priority = :priority',
        { priority: TaskPriority.HIGH },
      )
    })

    it('should search by title and description', async () => {
      const queryDto: QueryTaskDto = {
        search: 'test',
      }

      await service.findAll(queryDto)

      expect(queryBuilder.andWhere).toHaveBeenCalled()
    })

    it('should filter by tags', async () => {
      const queryDto: QueryTaskDto = {
        tags: 'urgent,important',
      }

      await service.findAll(queryDto)

      expect(queryBuilder.andWhere).toHaveBeenCalled()
    })

    it('should apply custom sorting', async () => {
      const queryDto: QueryTaskDto = {
        sortBy: 'title',
        sortOrder: 'ASC',
      }

      await service.findAll(queryDto)

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('task.title', 'ASC')
    })

    it('should apply pagination', async () => {
      const queryDto: QueryTaskDto = {
        page: 2,
        limit: 5,
      }

      await service.findAll(queryDto)

      expect(queryBuilder.skip).toHaveBeenCalledWith(5)
      expect(queryBuilder.take).toHaveBeenCalledWith(5)
    })

    it('should reject invalid sortBy fields', async () => {
      const queryDto: QueryTaskDto = {
        sortBy: 'invalid_field',
      }

      await service.findAll(queryDto)

      // Should use default sorting instead
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'task.createdAt',
        'DESC',
      )
    })
  })

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const result = await service.findOne('123')

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['tags'],
      })
      expect(result).toEqual(mockTask)
    })

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null)

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('update', () => {
    it('should update a task without tags', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.COMPLETED,
      }

      const result = await service.update('123', updateTaskDto)

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['tags'],
      })
      expect(taskRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockTask)
    })

    it('should update a task with tags', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        tags: ['new-tag'],
      }

      jest.spyOn(tagRepository, 'findOne').mockResolvedValue(null)

      await service.update('123', updateTaskDto)

      expect(tagRepository.findOne).toHaveBeenCalled()
      expect(tagRepository.create).toHaveBeenCalled()
      expect(tagRepository.save).toHaveBeenCalled()
    })

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null)

      await expect(
        service.update('nonexistent', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should remove a task', async () => {
      await service.remove('123')

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['tags'],
      })
      expect(taskRepository.remove).toHaveBeenCalledWith(mockTask)
    })

    it('should throw NotFoundException if task not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null)

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getAllTags', () => {
    it('should return all tags', async () => {
      const result = await service.getAllTags()

      expect(tagRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      })
      expect(result).toEqual([mockTag])
    })
  })

  describe('findOrCreateTags', () => {
    it('should return empty array for empty tags', async () => {
      const result = await service['findOrCreateTags']([])

      expect(result).toEqual([])
    })

    it('should create new tags', async () => {
      jest.spyOn(tagRepository, 'findOne').mockResolvedValue(null)

      const result = await service['findOrCreateTags'](['urgent'])

      expect(tagRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'urgent' },
      })
      expect(tagRepository.create).toHaveBeenCalledWith({ name: 'urgent' })
      expect(tagRepository.save).toHaveBeenCalled()
      expect(result).toEqual([mockTag])
    })

    it('should reuse existing tags', async () => {
      jest.spyOn(tagRepository, 'findOne').mockResolvedValue(mockTag)

      const result = await service['findOrCreateTags'](['urgent'])

      expect(tagRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'urgent' },
      })
      expect(tagRepository.create).not.toHaveBeenCalled()
      expect(result).toEqual([mockTag])
    })

    it('should handle mix of new and existing tags', async () => {
      jest
        .spyOn(tagRepository, 'findOne')
        .mockResolvedValueOnce(mockTag)
        .mockResolvedValueOnce(null)

      const newTag = {
        ...mockTag,
        id: '2',
        name: 'important',
        createdAt: new Date(),
      }
      jest.spyOn(tagRepository, 'save').mockResolvedValue(newTag)

      const result = await service['findOrCreateTags'](['urgent', 'important'])

      expect(tagRepository.findOne).toHaveBeenCalledTimes(2)
      expect(tagRepository.create).toHaveBeenCalledTimes(1)
      expect(result).toHaveLength(2)
    })
  })
})
