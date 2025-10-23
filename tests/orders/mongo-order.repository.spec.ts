const mockModel = {
  create: jest.fn().mockResolvedValue({
    _id: '1',
    customerId: 'cust-123',
    items: [{ productId: 'p01', quantity: 2 }],
    total: 150,
    status: 'em_processamento',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  findById: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue({
      _id: '1',
      customerId: 'cust-123',
      items: [{ productId: 'p01', quantity: 2 }],
      total: 150,
      status: 'em_processamento',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  }),
  findByIdAndUpdate: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue({
      _id: '1',
      customerId: 'cust-123',
      items: [{ productId: 'p01', quantity: 2 }],
      total: 150,
      status: 'enviado',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  }),
};

jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(() => mockModel),
  models: {},
}));

import { MongoOrderRepository } from '../../src/modules/orders/adapters/repositories/mongo-order.repository';
import { Order } from '../../src/modules/orders/domain/order.entity';
import { OrderStatus } from '../../src/modules/orders/domain/order-status.enum';
import mongoose from 'mongoose';

describe('MongoOrderRepository', () => {
  let repo: MongoOrderRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new MongoOrderRepository();
  });

  it('deve salvar um pedido corretamente', async () => {
    const order = new Order(
      '1',
      'cust-123',
      [{ productId: 'p01', quantity: 2 }],
      150,
      OrderStatus.PROCESSING,
      new Date(),
      new Date(),
    );

    const result = await repo.save(order);
    expect(result).toBeInstanceOf(Order);
    expect(result.customerId).toBe('cust-123');
    expect(result.status).toBe(OrderStatus.PROCESSING);
  });

  it('deve buscar um pedido pelo ID', async () => {
    const result = await repo.findById('1');
    expect(result).toBeInstanceOf(Order);
    expect(result?.id).toBe('1');
    expect(result?.status).toBe(OrderStatus.PROCESSING);
  });

  it('deve atualizar o status do pedido', async () => {
    const result = await repo.updateStatus('1', OrderStatus.SHIPPED);
    expect(result).toBeInstanceOf(Order);
    expect(result?.status).toBe(OrderStatus.SHIPPED);
  });

  it('deve retornar null se não encontrar pedido em findById', async () => {
    (mockModel.findById as jest.Mock).mockReturnValueOnce({
      lean: jest.fn().mockResolvedValueOnce(null),
    });

    const result = await repo.findById('999');
    expect(result).toBeNull();
  });

  it('deve retornar null se não encontrar pedido em updateStatus', async () => {
    (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValueOnce({
      lean: jest.fn().mockResolvedValueOnce(null),
    });

    const result = await repo.updateStatus('999', OrderStatus.SHIPPED);
    expect(result).toBeNull();
  });
});
