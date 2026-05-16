import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RuntimeService } from '../runtime/runtime.service';
import { SessionService } from '../runtime/session.service';

interface StartSessionPayload {
  botId: string;
  flowId: string;
  userId?: string;
}

interface SendMessagePayload {
  sessionId: string;
  text: string;
}

interface ResetSessionPayload {
  sessionId: string;
  flowId: string;
  botId: string;
}

@WebSocketGateway({
  namespace: '/simulator',
  cors: { origin: '*', credentials: false },
})
export class SimulatorGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private runtimeService: RuntimeService,
    private sessionService: SessionService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Simulator client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Simulator client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startSession')
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: StartSessionPayload,
  ) {
    try {
      const userId = payload.userId ?? client.id;
      const session = await this.sessionService.getOrCreate(
        payload.botId,
        payload.flowId,
        userId,
        true,
      );

      client.emit('sessionStarted', { sessionId: session._id.toString() });

      const response = await this.runtimeService.startSession(
        payload.botId,
        payload.flowId,
        userId,
        true,
        (output) => this.emitOutput(client, output),
      );

      this.emitRuntimeMeta(client, response);
    } catch (err: any) {
      client.emit('error', { message: err.message ?? 'Failed to start session' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    try {
      const response = await this.runtimeService.processMessage(
        payload.sessionId,
        payload.text,
        (output) => this.emitOutput(client, output),
      );
      this.emitRuntimeMeta(client, response);
    } catch (err: any) {
      client.emit('error', { message: err.message ?? 'Failed to process message' });
    }
  }

  @SubscribeMessage('resetSession')
  async handleReset(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ResetSessionPayload,
  ) {
    try {
      await this.sessionService.reset(payload.sessionId);
      client.emit('sessionReset', { sessionId: payload.sessionId });
      const response = await this.runtimeService.startSession(
        payload.botId,
        payload.flowId,
        client.id,
        true,
        (output) => this.emitOutput(client, output),
      );
      this.emitRuntimeMeta(client, response);
    } catch (err: any) {
      client.emit('error', { message: err.message ?? 'Failed to reset session' });
    }
  }

  private emitOutput(client: Socket, output: any) {
    if (output.type === 'text') {
      client.emit('botMessage', {
        content: output.content,
        type: 'text',
        timestamp: new Date().toISOString(),
      });
    } else if (output.type === 'delay') {
      client.emit('botTyping', { delay: output.delay });
    } else if (output.type === 'end') {
      client.emit('sessionEnded', {});
    }
  }

  /** Emits session metadata after all outputs have been streamed. */
  private emitRuntimeMeta(client: Socket, response: any) {
    if (response.currentNodeId) {
      client.emit('nodeHighlight', { nodeId: response.currentNodeId });
    }

    client.emit('contextUpdate', {
      variables: response.variables,
      context: response.context,
    });

    for (const log of response.logs ?? []) {
      client.emit('executionLog', log);
    }
  }
}
