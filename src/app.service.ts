import { Injectable } from '@nestjs/common';
import { OnEvent } from './rmq/decorators/onEvent.decorator';
import { RMQService } from './rmq/rmq.service';

@Injectable()
export class AppService {
  static count = 0;
  constructor(private readonly rmq: RMQService) {}

  getHello() {
    return 'Hello';
  }

  async emitMessage(count: number): Promise<string> {
    for (let i = 0; i < count; i++) {
      AppService.count += 1;
      this.rmq.emit('RMS', 'TEST_EVENT', Buffer.from(i.toString()));
    }

    await this.receivedAll();

    return 'Done!';
  }

  async receivedAll(): Promise<boolean> {
    while (AppService.count > 0) {
      console.log(AppService.count);

      await this.#sleep();
    }
    return true;
  }

  @OnEvent('TEST_EVENT')
  onEvent() {
    AppService.count -= 1;
  }

  async #sleep() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(0), 1);
    });
  }
}
