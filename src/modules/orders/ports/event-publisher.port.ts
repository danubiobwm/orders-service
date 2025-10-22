export interface EventPublisherPort {
  publish(routingKey: string, message: any): Promise<void>;
}