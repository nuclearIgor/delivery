import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import { Inject, OnModuleInit } from '@nestjs/common';
import { RoutesService } from '../routes.service';
import { ClientKafka } from '@nestjs/microservices';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RoutesGateway implements OnModuleInit {
  private kafkaProducer: Producer;

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly routesService: RoutesService,
    @Inject('KAFKA_SERVICE')
    private kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaProducer = await this.kafkaClient.connect();
    console.log('module init');
  }

  @SubscribeMessage('new-direction')
  handleMessage(client: Socket, payload: { routeId: string }): void {
    console.log(payload);

    this.kafkaProducer.send({
      topic: 'route.new-direction',
      messages: [
        {
          key: 'route.new-direction',
          value: JSON.stringify({
            routeId: payload.routeId,
            clientId: client.id,
          }),
        },
      ],
    });
    // return 'Hello world!';
  }

  sendPosition(data: {
    clientId: string;
    routeId: string;
    position: [number, number];
    finished: boolean;
  }) {
    console.log(data);
    console.log(this.server.sockets.sockets.keys());
    const { clientId, ...rest } = data;

    const clients = this.server.sockets.sockets;

    if (!clients.has(clientId)) {
      console.error('client doesnt exist. Refresh and try again');
      return;
    }

    // this.server.emit()
    // console.log(typeof clients.get(clientId))
    // console.log(clients[clientId] instanceof Socket)
    clients.get(clientId).emit('new-position', rest);
  }
}
