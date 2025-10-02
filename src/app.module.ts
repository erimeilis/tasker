import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TaskModule } from './task/task.module'
import { Task } from './task/task.entity'
import { Tag } from './task/entities/tag.entity'
import { DataSource } from 'typeorm'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'tasker',
      entities: [Task, Tag],
      synchronize: process.env.NODE_ENV !== 'production', // Don't use in production
      logging: process.env.NODE_ENV === 'development',
    }),
    TaskModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'DATA_SOURCE',
      useFactory: async () => {
        const dataSource = new DataSource({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_DATABASE || 'tasker',
          entities: [Task, Tag],
          synchronize: process.env.NODE_ENV !== 'production',
          logging: process.env.NODE_ENV === 'development',
        })
        await dataSource.initialize()
        return dataSource
      },
    },
  ],
})
export class AppModule {}
