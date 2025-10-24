import { Test } from '@nestjs/testing';
import { OrdersModule } from '../../src/modules/orders/orders.module';
import { OrdersController } from '../../src/modules/orders/adapters/controllers/orders.controller';
import { MongoOrderRepository } from '../../src/modules/orders/adapters/repositories/mongo-order.repository';
import { RabbitMQPublisher } from '../../src/modules/orders/adapters/events/rabbitmq-publisher.adapter';

describe('OrdersModule', () => {
  let ordersModule: OrdersModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [OrdersModule],
    }).compile();

    ordersModule = moduleRef.get<OrdersModule>(OrdersModule);
  });

  it('should be defined', () => {
    expect(ordersModule).toBeDefined();
  });
});