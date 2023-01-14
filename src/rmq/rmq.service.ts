import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Channel, connect, Connection, ConsumeMessage } from 'amqplib';
import {
  EVENT_LISTENER_METADATA,
  Message,
  RMQOptions,
  RMQ_OPTIONS,
} from './rmq.types';

@Injectable()
export class RMQService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channels: Record<string, Channel> = {};
  private listenerMethods: Record<string, ((...payload: any[]) => void)[]> = {};

  constructor(
    @Inject(RMQ_OPTIONS) private readonly options: RMQOptions,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  async onModuleInit() {
    this.connection = await connect(this.options.uri);

    for await (const { name, ...queue } of this.options.queues) {
      const channel: Channel = await this.connection.createChannel();
      await channel.assertQueue(name, {
        ...queue,
      });

      await channel.consume(
        name,
        (message) => this.consumer.call(this, message),
        {
          noAck: true,
        },
      );
      this.channels[name] = channel;
    }

    this.loadEventListeners();
  }

  private loadEventListeners() {
    const providers = this.discoveryService.getProviders();
    providers
      .filter((wrapper) => wrapper.instance && !wrapper.isAlias)
      .forEach((wrapper: InstanceWrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance) || {};
        const handlers = this.metadataScanner.scanFromPrototype(
          instance,
          prototype,
          (methodKey: string) =>
            this.subscribeToEventIfListener(instance, methodKey),
        );
        for (const { event, handler } of handlers) {
          if (!this.listenerMethods[event]) {
            this.listenerMethods[event] = [handler];
          } else {
            this.listenerMethods[event].push(handler);
          }
        }
      });
  }

  private subscribeToEventIfListener(
    instance: Record<string, any>,
    methodKey: string,
  ): { event: string; handler: (...payload: any) => void } {
    const eventListenerMetadata = this.reflector.get(
      EVENT_LISTENER_METADATA,
      instance[methodKey],
    );

    if (!eventListenerMetadata) {
      return;
    }

    const methodHandler = instance[methodKey];
    const { event } = eventListenerMetadata;
    return { event: event, handler: methodHandler };
  }

  private consumer(message: ConsumeMessage) {
    const data: Message = JSON.parse(Buffer.from(message.content).toString());
    const listenerMethods = this.listenerMethods[data.event];
    if (!listenerMethods) return;
    listenerMethods.forEach((method) => method(...data.payload));
  }

  emit(queue: string, event: string, ...payload: any[]) {
    const message: Message = { queue: queue, event: event, payload: payload };
    const messageBuffer = Buffer.from(JSON.stringify(message));
    this.channels[queue].sendToQueue(queue, messageBuffer);
  }

  async onModuleDestroy() {
    for await (const channel of Object.values(this.channels)) {
      await channel.close();
    }
    await this.connection.close();
  }
}
