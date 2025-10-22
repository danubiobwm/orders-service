import * as amqp from 'amqplib';
import { logger } from '../common/logger';

export async function createRabbitConnection(url: string) {
  const conn = await amqp.connect(url);
  const ch = await conn.createChannel();
  logger.info('RabbitMQ connected');
  return { conn, ch };
}