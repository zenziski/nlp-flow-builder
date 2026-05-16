import { io, Socket } from 'socket.io-client';

type EventCallback = (...args: any[]) => void;

class SimulatorSocket {
  private socket: Socket | null = null;

  connect(url?: string) {
    const baseUrl = url ?? (import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? '');
    this.socket = io(`${baseUrl}/simulator`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, callback: EventCallback) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: EventCallback) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  startSession(botId: string, flowId: string, userId?: string) {
    this.emit('startSession', { botId, flowId, userId });
  }

  sendMessage(sessionId: string, text: string) {
    this.emit('sendMessage', { sessionId, text });
  }

  resetSession(sessionId: string, botId: string, flowId: string) {
    this.emit('resetSession', { sessionId, botId, flowId });
  }
}

export const simulatorSocket = new SimulatorSocket();
