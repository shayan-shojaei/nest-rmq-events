export type RMQOptionsQueue = {
  name: string;
  durable?: boolean;
};

export type RMQOptions = {
  uri: string;
  queues: RMQOptionsQueue[];
};

export const RMQ_OPTIONS = 'RMQ_OPTIONS';
export const EVENT_LISTENER_METADATA = 'RMQ_EVENT_LISTENER_METADATA';

export interface OnEventMetadata {
  event: string;
}

export type Message = {
  queue: string;
  event: string;
  payload: any[];
};
