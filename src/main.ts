import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AppModule } from './app.module'
import { seedTasks } from './seeders/task.seeder'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  // Run database migrations and seed data in development
  if (process.env.NODE_ENV === 'development') {
    const dataSource = app.get<DataSource>('DATA_SOURCE')
    if (dataSource) {
      try {
        // Run migrations
        await dataSource.runMigrations()
        console.log('✅ Database migrations completed')

        // Seed demo data
        await seedTasks(dataSource)
      } catch (error) {
        console.error('❌ Database setup failed:', error)
      }
    }
  }

  await app.listen(process.env.PORT ?? 3000)
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`
  )
}

void bootstrap()
