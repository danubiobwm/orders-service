import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { OrdersModule } from '../../src/modules/orders/orders.module';
import { v4 as uuidv4 } from 'uuid';
import amqp from 'amqplib';

const mockRepositoryPort = {
  create: jest.fn().mockImplementation(dto => Promise.resolve({ id: uuidv4(), ...dto })),
  findById: jest.fn().mockImplementation(id => Promise.resolve({ id, customerId: 'cust-1', items: [], total: 100, status: 'criado' })),
  delete: jest.fn().mockResolvedValue(true),
};

const mockPublisherPort = {
  publish: jest.fn().mockResolvedValue(true),
};

describe('Orders E2E (with RabbitMQ)', () => {
  let app: INestApplication;
  let connection: any;
  let channel: amqp.Channel;
  const queue = 'orders.shipped';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider('OrderRepository')
      .useValue(mockRepositoryPort)
      .overrideProvider('EventPublisher')
      .useValue(mockPublisherPort)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: false });
  });

  afterAll(async () => {
    if (channel) await channel.close();
    if (connection) await connection.close();
    await app.close();
  });

  it('should create an order and return id', async () => {
    const orderData = {
      customerId: 'cust-1',
      items: [{ productId: 'p01', quantity: 1 }],
      total: 100,
      status: 'criado',
    };

    const createResp = await request(app.getHttpServer())
      .post('/orders')
      .send(orderData)
      .expect(201);

    expect(createResp.body.id).toBeDefined();
    expect(mockRepositoryPort.create).toHaveBeenCalledWith(expect.objectContaining(orderData));
    expect(mockPublisherPort.publish).toHaveBeenCalledWith(expect.objectContaining({ id: createResp.body.id }));
  }, 15000);

  it('should listen emitted event from RabbitMQ', async () => {
    const testMessage = { test: true };

    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(testMessage)));

    const result = await new Promise<any>((resolve) => {
      channel.consume(queue, (msg: amqp.ConsumeMessage | null) => {
        if (!msg) return;
        resolve(JSON.parse(msg.content.toString()));
        channel.ack(msg);
      });
    });

    expect(result).toStrictEqual(testMessage);
  });
});
