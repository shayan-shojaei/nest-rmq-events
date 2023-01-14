import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { RMQService } from './rmq.service';
import { RMQOptions, RMQ_OPTIONS } from './rmq.types';

@Module({})
export class RMQModule {
  static forRoot(options: RMQOptions): DynamicModule {
    return {
      imports: [DiscoveryModule],
      providers: [
        {
          provide: RMQ_OPTIONS,
          useValue: options,
        },
        RMQService,
      ],
      exports: [RMQService],
      module: RMQModule,
    };
  }
}
