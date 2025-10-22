import { Module } from '@nestjs/common';
import { OrdersController } from './adapters/controllers/orders.controller';
import { MongoOrderRepository } from './adapters/repositories/mongo-order.repository';
import { RabbitMQPublisher } from './adapters/events/rabbitmq-publisher.adapter';

@Module({
  controllers: [OrdersController],
  providers: [
    { provide: 'OrderRepository', useClass: MongoOrderRepository },
    { provide: 'EventPublisher', useClass: RabbitMQPublisher }
  ]
})
export class OrdersModule {}