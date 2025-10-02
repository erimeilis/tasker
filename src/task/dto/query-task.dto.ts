import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { TaskStatus, TaskPriority } from '../task.entity'

export class QueryTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  tags?: string // Comma-separated tag names

  @IsOptional()
  @IsString()
  sortBy?: string // e.g., 'createdAt', 'dueDate', 'title', 'priority'

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC'

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number
}
