import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { Task } from '../types/task'

export function useWebSocket() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    // Handle connection
    socket.on('connect', () => {
      console.log('[WebSocket] Connected to server')
    })

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server')
    })

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error)
    })

    // Handle task created
    socket.on('task:created', (task: Task) => {
      console.log('[WebSocket] Task created:', task.id)
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
    })

    // Handle task updated
    socket.on('task:updated', (task: Task) => {
      console.log('[WebSocket] Task updated:', task.id)
      // Invalidate specific task and list queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', task.id] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
    })

    // Handle task deleted
    socket.on('task:deleted', ({ id }: { id: string }) => {
      console.log('[WebSocket] Task deleted:', id)
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
    })

    // Cleanup on unmount
    return () => {
      console.log('[WebSocket] Cleaning up connection')
      socket.disconnect()
    }
  }, [queryClient])

  return socketRef.current
}
