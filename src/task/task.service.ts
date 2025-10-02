import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task, TaskStatus, TaskPriority } from './task.entity'
import { Tag } from './entities/tag.entity'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { QueryTaskDto } from './dto/query-task.dto'
import { TaskGateway } from './task.gateway'

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly taskGateway: TaskGateway
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { tags: tagNames, ...taskData } = createTaskDto

    // Handle tags
    let tags: Tag[] = []
    if (tagNames && tagNames.length > 0) {
      tags = await this.findOrCreateTags(tagNames)
    }

    const task = this.taskRepository.create({
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      tags,
    })

    const savedTask = await this.taskRepository.save(task)

    // Emit WebSocket event
    this.taskGateway.emitTaskCreated(savedTask)

    return savedTask
  }

  async findAll(queryDto: QueryTaskDto): Promise<PaginatedResult<Task>> {
    const {
      status,
      priority,
      search,
      tags: tagNames,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = queryDto

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tag')

    // Apply filters
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status })
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority })
    }

    // Apply search (title or description)
    if (search && search.trim()) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }
      )
    }

    // Apply tag filter
    if (tagNames && tagNames.trim()) {
      const tagArray = tagNames.split(',').map((t) => t.trim())
      queryBuilder
        .innerJoin('task.tags', 'filterTag')
        .andWhere('filterTag.name IN (:...tags)', { tags: tagArray })
    }

    // Apply sorting
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'dueDate',
      'title',
      'priority',
      'status',
    ]
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC'
    queryBuilder.orderBy(`task.${sortField}`, order)

    // Apply pagination
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    const [data, total] = await queryBuilder.getManyAndCount()

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['tags'],
    })
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`)
    }
    return task
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id)
    const { tags: tagNames, ...taskData } = updateTaskDto

    // Handle tags update
    if (tagNames !== undefined) {
      if (tagNames.length > 0) {
        task.tags = await this.findOrCreateTags(tagNames)
      } else {
        task.tags = []
      }
    }

    Object.assign(task, {
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : task.dueDate,
    })

    await this.taskRepository.save(task)
    const updatedTask = await this.findOne(id)

    // Emit WebSocket event
    this.taskGateway.emitTaskUpdated(updatedTask)

    return updatedTask
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id)
    await this.taskRepository.remove(task)

    // Emit WebSocket event
    this.taskGateway.emitTaskDeleted(id)
  }

  async getStatistics() {
    const tasks = await this.taskRepository.find()

    const totalTasks = tasks.length

    const byStatus = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
    }

    const byPriority = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
    }

    tasks.forEach((task) => {
      byStatus[task.status]++
      byPriority[task.priority]++
    })

    return {
      totalTasks,
      byStatus,
      byPriority,
    }
  }

  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { name: 'ASC' },
    })
  }

  private async findOrCreateTags(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = []

    for (const name of tagNames) {
      const trimmedName = name.trim()
      if (!trimmedName) continue

      let tag = await this.tagRepository.findOne({
        where: { name: trimmedName },
      })

      if (!tag) {
        tag = this.tagRepository.create({ name: trimmedName })
        tag = await this.tagRepository.save(tag)
      }

      tags.push(tag)
    }

    return tags
  }
}
