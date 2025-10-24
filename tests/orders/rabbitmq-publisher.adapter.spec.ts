import { RabbitMQPublisher } from '../../src/modules/orders/adapters/events/rabbitmq-publisher.adapter';
import * as amqplib from 'amqplib';
import { logger } from '../../src/common/logger';

jest.mock('amqplib');
jest.mock('../../src/common/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('RabbitMQPublisher', () => {
  let publisher: RabbitMQPublisher;
  let mockConnection: any;
  let mockChannel: any;

  beforeEach(() => {
    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockReturnValue(true),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    };

    (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

    publisher = new RabbitMQPublisher();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('deve estabelecer conexão e criar canal com sucesso', async () => {
    await (publisher as any).ensureConnection();

    expect(amqplib.connect).toHaveBeenCalledWith(process.env.RABBITMQ_URL || 'amqp://localhost');
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('RabbitMQPublisher connected');
  });

  it('não deve reconectar se já existir conexão e canal', async () => {
    (publisher as any).connection = mockConnection;
    (publisher as any).channel = mockChannel;

    await (publisher as any).ensureConnection();

    expect(amqplib.connect).not.toHaveBeenCalled();
    expect(mockConnection.createChannel).not.toHaveBeenCalled();
  });

  it('deve lançar erro se falhar na conexão', async () => {
    (amqplib.connect as jest.Mock).mockRejectedValueOnce(new Error('connection failed'));

    const brokenPublisher = new RabbitMQPublisher();

    await expect((brokenPublisher as any).ensureConnection()).rejects.toThrow('connection failed');
    expect(logger.error).toHaveBeenCalledWith('RabbitMQ connection error: connection failed');
  });


  it('deve publicar mensagem com sucesso', async () => {
    await publisher.publish('order.created', { id: 1, status: 'created' });

    expect(mockChannel.assertExchange).toHaveBeenCalledWith('orders.exchange', 'topic', { durable: true });
    expect(mockChannel.publish).toHaveBeenCalledWith(
      'orders.exchange',
      'order.created',
      Buffer.from(JSON.stringify({ id: 1, status: 'created' })),
      { persistent: true },
    );
    expect(logger.info).toHaveBeenCalledWith('Published event to order.created');
  });

  it('deve lançar erro se o canal estiver indisponível', async () => {
    (publisher as any).channel = null;
    (publisher as any).connection = mockConnection;
    mockConnection.createChannel = jest.fn().mockResolvedValue(null);

    await expect(publisher.publish('order.created', { test: true })).rejects.toThrow(
      'RabbitMQ channel is not available',
    );
  });

  it('deve tentar reconectar automaticamente se a conexão estiver fechada', async () => {
    (publisher as any).connection = null;
    (publisher as any).channel = null;

    await publisher.publish('order.updated', { id: 2, status: 'updated' });

    expect(amqplib.connect).toHaveBeenCalled();
    expect(mockChannel.publish).toHaveBeenCalled();
  });
});