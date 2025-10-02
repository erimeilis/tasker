import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm'
import { Task } from '../task.entity'

@Entity('app_tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 50, unique: true })
  name!: string

  @Column({ length: 7, default: '#3b82f6' })
  color!: string

  @ManyToMany(() => Task, (task) => task.tags)
  tasks!: Task[]

  @CreateDateColumn()
  createdAt!: Date
}
