import { SetMetadata } from '@nestjs/common';
import { EVENT_LISTENER_METADATA, OnEventMetadata } from '../rmq.types';

export const OnEvent = (event: string): MethodDecorator =>
  SetMetadata(EVENT_LISTENER_METADATA, { event } as OnEventMetadata);
