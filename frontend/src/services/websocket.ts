import { io, Socket } from 'socket.io-client';
import { Note } from '../types/api';

export interface NoteSync {
  type: 'create' | 'update' | 'delete' | 'storage-changed';
  note?: Note;
  noteId?: string;
  oldNoteId?: string;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // Start with 1 second
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const serverUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      timeout: 20000,
    });

    this.setupSocketEventHandlers();

    // Authenticate after connection
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.socket?.emit('authenticate', token);
      this.emit('connected');
    });

    this.socket.on('authenticated', (data: { userId: string }) => {
      console.log('WebSocket authenticated for user:', data.userId);
      this.emit('authenticated', data);
    });

    this.socket.on('auth-error', (error: { message: string }) => {
      console.error('WebSocket authentication error:', error.message);
      this.emit('auth-error', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    }
  }

  private setupSocketEventHandlers() {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection-failed');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      this.emit('reconnected', { attemptNumber });
    });

    // Listen for note sync events
    this.socket.on('note-sync', (syncData: NoteSync) => {
      console.log('Received note sync:', syncData);
      this.emit('note-sync', syncData);
    });

    // Listen for sync requests
    this.socket.on('sync-requested', (data: { timestamp: string }) => {
      console.log('Sync requested by server:', data.timestamp);
      this.emit('sync-requested', data);
    });

    // Listen for system messages
    this.socket.on('system-message', (data: { message: string; timestamp: string }) => {
      console.log('System message:', data.message);
      this.emit('system-message', data);
    });
  }

  private setupEventListeners() {
    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.socket && !this.socket.connected) {
        console.log('Page became visible, attempting to reconnect WebSocket...');
        this.socket.connect();
      }
    });

    // Handle online/offline events
    window.addEventListener('online', () => {
      console.log('Device came online, checking WebSocket connection...');
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    });

    window.addEventListener('offline', () => {
      console.log('Device went offline');
      this.emit('offline');
    });
  }

  // Request manual sync
  requestSync() {
    if (this.socket?.connected) {
      this.socket.emit('request-sync');
    }
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Status methods
  isConnectedToServer(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getConnectionState(): 'connected' | 'disconnected' | 'connecting' | 'error' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.disconnected === false && !this.socket.connected) return 'connecting';
    return 'error';
  }

  // Clean up
  destroy() {
    this.listeners.clear();
    this.disconnect();
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();