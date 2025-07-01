import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3002', {
      auth: {
        token
      },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Re-register all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function): void {
    // Store the listener for re-registration on reconnect
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    // Register with socket if connected
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      // Remove specific callback
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      this.socket?.off(event, callback as any);
    } else {
      // Remove all callbacks for event
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Specific methods for care coordination events
  updateLocation(latitude: number, longitude: number): void {
    this.emit('location_update', { latitude, longitude });
  }

  updateJobStatus(jobId: number, status: string): void {
    this.emit('job_status_update', { jobId, status });
  }

  addNote(jobId: number, noteId: number, content: string): void {
    this.emit('new_note', { jobId, noteId, content });
  }

  assignJob(workerId: number, jobId: number, title: string, scheduledTime: string, clientName: string, address: string): void {
    this.emit('job_assigned', { workerId, jobId, title, scheduledTime, clientName, address });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
