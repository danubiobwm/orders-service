import { Injectable } from '@nestjs/common';
import { EventPublisherPort } from '../../ports/event-publisher.port';
import * as amqp from 'amqplib';
import { logger } from '../../../common/logger';

@Injectable()
export class RabbitMQPublisher implements EventPublisherPort {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor() {}

  private async ensureConnection() {
    if (!this.connection || !this.channel) {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      logger.info('RabbitMQPublisher connected');
    }
  }

  async publish(routingKey: string, message: any): Promise<void> {
    await this.ensureConnection();
    if (!this.channel) throw new Error('Channel not initialized');
    const exchange = 'orders.exchange';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
  }
}