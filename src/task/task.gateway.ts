import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Task } from './task.entity'

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  handleConnection(client: Socket) {
    console.log(`[WebSocket] Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`)
  }

  // Emit task created event
  emitTaskCreated(task: Task) {
    this.server.emit('task:created', task)
    console.log(`[WebSocket] Emitted task:created for task ${task.id}`)
  }

  // Emit task updated event
  emitTaskUpdated(task: Task) {
    this.server.emit('task:updated', task)
    console.log(`[WebSocket] Emitted task:updated for task ${task.id}`)
  }

  // Emit task deleted event
  emitTaskDeleted(taskId: string) {
    this.server.emit('task:deleted', { id: taskId })
    console.log(`[WebSocket] Emitted task:deleted for task ${taskId}`)
  }
}
