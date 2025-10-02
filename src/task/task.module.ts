import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { TaskGateway } from './task.gateway'
import { Task } from './task.entity'
import { Tag } from './entities/tag.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Task, Tag])],
  controllers: [TaskController],
  providers: [TaskService, TaskGateway],
  exports: [TaskService],
})
export class TaskModule {}
