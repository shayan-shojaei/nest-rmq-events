import { Injectable } from '@nestjs/common';
import { OnEvent } from './rmq/decorators/onEvent.decorator';
import { RMQService } from './rmq/rmq.service';

@Injectable()
export class AppService {
  constructor(private readonly rmq: RMQService) {}

  getHello() {
    return 'Hello';
  }

  emitMessage(message: string): string {
    this.rmq.emit('RMS', 'PlaceCreate', message);
    return 'emitted!';
  }

  deletePlace(message: string): string {
    this.rmq.emit('RMS', 'PlaceDelete', message);
    return 'emitted!';
  }

  @OnEvent('PlaceCreate')
  onPlaceCreate(payload: any) {
    console.log(payload);
  }

  @OnEvent('PlaceDelete')
  onPlaceDelete(payload: any) {
    console.log(payload);
  }
}
