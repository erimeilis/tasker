import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  MaxLength,
} from 'class-validator'
import { TaskStatus, TaskPriority } from '../task.entity'

export class CreateTaskDto {
  @IsString()
  @MaxLength(100)
  title!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}
