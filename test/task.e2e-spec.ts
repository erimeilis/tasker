import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { TaskStatus, TaskPriority } from '../src/task/task.entity'

describe('TaskController (e2e)', () => {
  let app: INestApplication
  let createdTaskId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    await app.init()
  })

  afterAll(async () => {
    // Clean up created tasks
    if (createdTaskId) {
      await request(app.getHttpServer()).delete(`/tasks/${createdTaskId}`)
    }
    await app.close()
  })

  describe('/tasks (POST)', () => {
    it('should create a new task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'E2E Test Task',
          description: 'This is a test task',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body.title).toBe('E2E Test Task')
          expect(res.body.status).toBe(TaskStatus.PENDING)
          expect(res.body.priority).toBe(TaskPriority.MEDIUM)
          createdTaskId = res.body.id
        })
    })

    it('should create a task with tags', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Task with Tags',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          tags: ['e2e-test', 'urgent'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.tags).toHaveLength(2)
          expect(res.body.tags[0]).toHaveProperty('name')
          expect(res.body.tags[0]).toHaveProperty('id')
        })
    })

    it('should create a task with due date', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Task with Due Date',
          status: TaskStatus.PENDING,
          priority: TaskPriority.LOW,
          dueDate: '2025-12-31',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.dueDate).toBeDefined()
        })
    })

    it('should fail to create task without required fields', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          description: 'No title',
        })
        .expect(400)
    })

    it('should fail to create task with invalid status', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Invalid Status Task',
          status: 'INVALID_STATUS',
          priority: TaskPriority.MEDIUM,
        })
        .expect(400)
    })

    it('should fail to create task with invalid priority', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Invalid Priority Task',
          status: TaskStatus.PENDING,
          priority: 'INVALID_PRIORITY',
        })
        .expect(400)
    })
  })

  describe('/tasks (GET)', () => {
    it('should return all tasks', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data')
          expect(res.body).toHaveProperty('total')
          expect(res.body).toHaveProperty('page')
          expect(res.body).toHaveProperty('limit')
          expect(res.body).toHaveProperty('totalPages')
          expect(Array.isArray(res.body.data)).toBe(true)
        })
    })

    it('should filter tasks by status', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ status: TaskStatus.PENDING })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThanOrEqual(0)
          if (res.body.data.length > 0) {
            expect(res.body.data[0].status).toBe(TaskStatus.PENDING)
          }
        })
    })

    it('should filter tasks by priority', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ priority: TaskPriority.HIGH })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThanOrEqual(0)
          if (res.body.data.length > 0) {
            expect(res.body.data[0].priority).toBe(TaskPriority.HIGH)
          }
        })
    })

    it('should search tasks', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ search: 'E2E' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThanOrEqual(0)
        })
    })

    it('should filter tasks by tags', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ tags: 'e2e-test' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThanOrEqual(0)
        })
    })

    it('should paginate tasks', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ page: 1, limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1)
          expect(res.body.limit).toBe(5)
          expect(res.body.data.length).toBeLessThanOrEqual(5)
        })
    })

    it('should sort tasks by title ascending', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({ sortBy: 'title', sortOrder: 'ASC' })
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 1) {
            expect(res.body.data[0].title.localeCompare(res.body.data[1].title)).toBeLessThanOrEqual(0)
          }
        })
    })

    it('should handle combined filters', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .query({
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          search: 'test',
          page: 1,
          limit: 10,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data')
          expect(res.body.page).toBe(1)
          expect(res.body.limit).toBe(10)
        })
    })
  })

  describe('/tasks/:id (GET)', () => {
    it('should return a task by id', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTaskId)
          expect(res.body.title).toBe('E2E Test Task')
        })
    })

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/tasks/non-existent-id')
        .expect(404)
    })
  })

  describe('/tasks/:id (PATCH)', () => {
    it('should update a task title', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({
          title: 'Updated E2E Test Task',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated E2E Test Task')
        })
    })

    it('should update task status', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({
          status: TaskStatus.IN_PROGRESS,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(TaskStatus.IN_PROGRESS)
        })
    })

    it('should update task priority', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({
          priority: TaskPriority.HIGH,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.priority).toBe(TaskPriority.HIGH)
        })
    })

    it('should update task tags', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({
          tags: ['updated-tag'],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.tags).toHaveLength(1)
          expect(res.body.tags[0].name).toBe('updated-tag')
        })
    })

    it('should update task due date', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({
          dueDate: '2026-01-01',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.dueDate).toBeDefined()
        })
    })

    it('should fail to update with invalid status', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400)
    })

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .patch('/tasks/non-existent-id')
        .send({
          title: 'Updated Title',
        })
        .expect(404)
    })
  })

  describe('/tasks/tags (GET)', () => {
    it('should return all tags', () => {
      return request(app.getHttpServer())
        .get('/tasks/tags')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true)
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id')
            expect(res.body[0]).toHaveProperty('name')
            expect(res.body[0]).toHaveProperty('color')
          }
        })
    })
  })

  describe('/tasks/:id (DELETE)', () => {
    it('should create and delete a task', async () => {
      // Create a task to delete
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Task to Delete',
          status: TaskStatus.PENDING,
          priority: TaskPriority.LOW,
        })
        .expect(201)

      const taskId = createResponse.body.id

      // Delete the task
      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(200)

      // Verify task is deleted
      await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404)
    })

    it('should return 404 when deleting non-existent task', () => {
      return request(app.getHttpServer())
        .delete('/tasks/non-existent-id')
        .expect(404)
    })
  })

  describe('Complete Task Workflow', () => {
    it('should complete full CRUD workflow', async () => {
      // Create
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Workflow Test Task',
          description: 'Testing complete workflow',
          status: TaskStatus.PENDING,
          priority: TaskPriority.MEDIUM,
          tags: ['workflow', 'test'],
        })
        .expect(201)

      const taskId = createResponse.body.id
      expect(createResponse.body.tags).toHaveLength(2)

      // Read
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Workflow Test Task')
        })

      // Update
      await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .send({
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.HIGH,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(TaskStatus.COMPLETED)
          expect(res.body.priority).toBe(TaskPriority.HIGH)
        })

      // List with filter
      await request(app.getHttpServer())
        .get('/tasks')
        .query({ status: TaskStatus.COMPLETED })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.some((task: any) => task.id === taskId)).toBe(
            true,
          )
        })

      // Delete
      await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(200)

      // Verify deletion
      await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404)
    })
  })
})
