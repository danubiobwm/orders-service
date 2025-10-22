import * as amqp from 'amqplib';
import { logger } from '../common/logger';

async function start() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost';
  const conn = await amqp.connect(url);
  const ch = await conn.createChannel();
  const exchange = 'orders.exchange';
  await ch.assertExchange(exchange, 'topic', { durable: true });
  const q = await ch.assertQueue('shipping.queue', { durable: true });
  await ch.bindQueue(q.queue, exchange, 'order.status.updated');
  logger.info('Shipping consumer waiting for messages...');
  ch.consume(q.queue, msg => {
    if (!msg) return;
    const payload = JSON.parse(msg.content.toString());
    logger.info('Shipping consumer received', payload);
    ch.ack(msg);
  });
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});