import * as amqp from 'amqplib';

jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertExchange: jest.fn(),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'shipping.queue' }),
      bindQueue: jest.fn(),
      consume: jest.fn((_, cb) => cb({ content: Buffer.from(JSON.stringify({ id: '1' })) })),
      ack: jest.fn(),
    }),
  }),
}));

describe('ShippingConsumer', () => {
  it('deve consumir mensagens da fila sem erros', async () => {
    const spyConsole = jest.spyOn(console, 'log').mockImplementation(() => {});
    await import('../../src/consumers/shipping-consumer');
    expect(amqp.connect).toHaveBeenCalled();
    spyConsole.mockRestore();
  });
});
