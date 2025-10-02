import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm'
import { Tag } from './entities/tag.entity'

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('tasks')
@Index(['status', 'priority'])
@Index(['createdAt'])
@Index(['dueDate'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 100 })
  @Index('idx_task_title')
  title!: string

  @Column({ type: 'text', nullable: true })
  description!: string

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority

  @Column({ type: 'timestamp', nullable: true })
  dueDate!: Date

  @ManyToMany(() => Tag, (tag) => tag.tasks, { eager: true })
  @JoinTable({
    name: 'tasks_tags_relation',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
