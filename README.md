# Tasker - Task Management API

A comprehensive task management REST API built with NestJS, TypeScript, and PostgreSQL. Features full CRUD operations, data validation, statistics, and Docker containerization.

## Features

- ✅ **TypeScript** - Full type safety with TypeScript
- ✅ **PostgreSQL Database** - Robust data persistence with TypeORM
- ✅ **Docker Containerization** - Easy deployment with Docker & Docker Compose
- ✅ **RESTful API** - Complete CRUD operations for tasks
- ✅ **Data Validation** - Input validation with class-validator
- ✅ **Error Handling** - Proper HTTP status codes and error messages
- ✅ **CORS Support** - Cross-origin resource sharing enabled
- ✅ **Request Logging** - Comprehensive logging for debugging
- ✅ **Statistics Endpoint** - Task analytics by status and priority

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: class-validator & class-transformer
- **Containerization**: Docker & Docker Compose

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tasker
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the API**
   - API: http://localhost:3000
   - Database: localhost:5432

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start PostgreSQL database**
   ```bash
   # Using Docker
   docker run --name postgres-tasker -e POSTGRES_PASSWORD=password -e POSTGRES_DB=tasker -p 5432:5432 -d postgres:15-alpine

   # Or install PostgreSQL locally
   ```

4. **Run the application**
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

### Task Model

```json
{
  "id": "string (UUID)",
  "title": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "status": "enum: pending|in_progress|completed",
  "priority": "enum: low|medium|high",
  "dueDate": "ISO date string (optional)",
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Endpoints

#### Create Task
```http
POST /tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-12-31T23:59:59.000Z"
}
```

#### Get All Tasks
```http
GET /tasks
```

#### Get Task by ID
```http
GET /tasks/:id
```

#### Update Task
```http
PATCH /tasks/:id
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "medium"
}
```

#### Delete Task
```http
DELETE /tasks/:id
```

#### Get Task Statistics
```http
GET /tasks/statistics
```

Response:
```json
{
  "totalTasks": 15,
  "byStatus": {
    "pending": 5,
    "in_progress": 3,
    "completed": 7
  },
  "byPriority": {
    "low": 4,
    "medium": 8,
    "high": 3
  }
}
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=tasker

# Application Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
```

## Development

### Available Scripts

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Run linter
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── app.controller.ts      # Default NestJS controller
├── app.module.ts          # Root application module
├── app.service.ts         # Default NestJS service
├── main.ts               # Application entry point
└── task/                 # Task management module
    ├── dto/              # Data Transfer Objects
    │   ├── create-task.dto.ts
    │   └── update-task.dto.ts
    ├── task.controller.ts # Task API endpoints
    ├── task.entity.ts    # Database entity
    ├── task.module.ts    # Task module configuration
    └── task.service.ts   # Business logic
```

## Docker

### Build and Run

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f api
```

### Docker Services

- **api**: NestJS application (port 3000)
- **postgres**: PostgreSQL database (port 5432)

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## Deployment

### Production Considerations

1. **Database**: Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. **Environment Variables**: Set production values for all environment variables
3. **Security**: Configure proper CORS origins and database credentials
4. **Monitoring**: Add logging and monitoring solutions
5. **SSL**: Enable HTTPS in production

### Docker Production Build

```bash
# Build production image
docker build -t tasker-api .

# Run production container
docker run -p 3000:3000 --env-file .env tasker-api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.
