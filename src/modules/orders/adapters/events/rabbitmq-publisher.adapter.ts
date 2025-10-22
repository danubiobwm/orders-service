import { Injectable } from '@nestjs/common';
import { EventPublisherPort } from '../../ports/event-publisher.port';
import * as amqp from 'amqplib';
import { logger } from '../../../../common/logger';

@Injectable()
export class RabbitMQPublisher implements EventPublisherPort {
  private connection: any = null;
  private channel: any = null;

  private async ensureConnection(): Promise<void> {
    if (!this.connection || !this.channel) {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost';
      try {
        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
        logger.info('RabbitMQPublisher connected');
      } catch (error: any) {
        logger.error(`RabbitMQ connection error: ${error.message}`);
        throw error;
      }
    }
  }

  async publish(routingKey: string, message: any): Promise<void> {
    await this.ensureConnection();

    if (!this.channel) {
      throw new Error('RabbitMQ channel is not available');
    }

    const exchange = 'orders.exchange';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });
    logger.info(`Published event to ${routingKey}`);
  }
}