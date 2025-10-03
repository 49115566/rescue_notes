import { Server } from 'socket.io';
import { Note } from '../types/index';

export class WebSocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Emit note created event to user's room
  noteCreated(userId: string, note: Note) {
    this.io.to(`user:${userId}`).emit('note-sync', {
      type: 'create',
      note
    });
    console.log(`Emitted note created for user ${userId}:`, note.id);
  }

  // Emit note updated event to user's room
  noteUpdated(userId: string, note: Note) {
    this.io.to(`user:${userId}`).emit('note-sync', {
      type: 'update',
      note
    });
    console.log(`Emitted note updated for user ${userId}:`, note.id);
  }

  // Emit note deleted event to user's room
  noteDeleted(userId: string, noteId: string) {
    this.io.to(`user:${userId}`).emit('note-sync', {
      type: 'delete',
      noteId
    });
    console.log(`Emitted note deleted for user ${userId}:`, noteId);
  }

  // Emit storage type changed event to user's room
  noteStorageChanged(userId: string, note: Note, oldNoteId?: string) {
    this.io.to(`user:${userId}`).emit('note-sync', {
      type: 'storage-changed',
      note,
      oldNoteId
    });
    console.log(`Emitted note storage changed for user ${userId}:`, note.id);
  }

  // Get connected clients count for a user
  getUserConnections(userId: string): number {
    const room = this.io.sockets.adapter.rooms.get(`user:${userId}`);
    return room ? room.size : 0;
  }

  // Broadcast system message to all connected clients
  broadcastSystemMessage(message: string) {
    this.io.emit('system-message', { message, timestamp: new Date().toISOString() });
  }
}

export let webSocketService: WebSocketService;

export function initializeWebSocketService(io: Server) {
  webSocketService = new WebSocketService(io);
  return webSocketService;
}