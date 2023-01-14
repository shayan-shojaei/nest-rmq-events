import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RMQModule } from './rmq/rmq.module';

@Module({
  imports: [
    RMQModule.forRoot({
      uri: 'amqp://127.0.0.1:5672',
      queues: [
        {
          name: 'RMS',
          durable: true,
        },
        {
          name: 'TENANT',
          durable: true,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
