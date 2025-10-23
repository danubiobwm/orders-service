import { OrdersController } from '../../src/modules/orders/adapters/controllers/orders.controller';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Order } from '../../src/modules/orders/domain/order.entity';
import { OrderStatus } from '../../src/modules/orders/domain/order-status.enum';

describe('OrdersController', () => {
  let controller: OrdersController;
  let mockRepo: any;
  let mockPublisher: any;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    mockPublisher = { publish: jest.fn() };

    controller = new OrdersController(mockRepo, mockPublisher);
  });

  afterEach(() => jest.clearAllMocks());



  it('deve criar um pedido com sucesso', async () => {
    const dto = {
      customerId: 'cust-123',
      items: [{ productId: 'p01', quantity: 2 }],
      total: 100,
    };

    const order = new Order(
      '1',
      dto.customerId,
      dto.items,
      dto.total,
      OrderStatus.CREATED,
      new Date(),
      new Date(),
    );

    const mockExecute = jest
      .spyOn((controller as any).createOrderUC, 'execute')
      .mockResolvedValue(order);

    const result = await controller.create(dto);

    expect(result).toEqual({ id: '1' });
    expect(mockExecute).toHaveBeenCalledWith(dto);
  });

  it('deve lançar exceção ao falhar na criação', async () => {
    const dto = {
      customerId: 'x',
      items: [] as { productId: string; quantity: number }[],
      total: 0,
    };

    jest
      .spyOn((controller as any).createOrderUC, 'execute')
      .mockRejectedValue(new Error('fail'));

    await expect(controller.create(dto)).rejects.toThrow(HttpException);
  });



  it('deve retornar pedido quando encontrado (GET /orders/:id)', async () => {
    const order = new Order(
      '1',
      'cust-123',
      [{ productId: 'p01', quantity: 2 }],
      150,
      OrderStatus.SHIPPED,
      new Date(),
      new Date(),
    );

    jest.spyOn((controller as any).getOrderUC, 'execute').mockResolvedValue(order);

    const result = await controller.get('1');
    expect(result).toBe(order);
    expect((controller as any).getOrderUC.execute).toHaveBeenCalledWith('1');
  });

  it('deve lançar exceção 404 quando pedido não for encontrado (GET)', async () => {
    jest
      .spyOn((controller as any).getOrderUC, 'execute')
      .mockResolvedValue(null);

    await expect(controller.get('999')).rejects.toThrow(
      new HttpException('Order not found', HttpStatus.NOT_FOUND),
    );
  });



  it('deve atualizar o status do pedido com sucesso (PATCH /orders/:id/status)', async () => {
    const updatedOrder = new Order(
      '1',
      'cust-123',
      [{ productId: 'p01', quantity: 2 }],
      100,
      OrderStatus.SHIPPED,
      new Date(),
      new Date(),
    );

    jest
      .spyOn((controller as any).updateOrderStatusUC, 'execute')
      .mockResolvedValue(updatedOrder);

    const dto = { status: OrderStatus.SHIPPED };
    const result = await controller.updateStatus('1', dto);

    expect(result).toBe(updatedOrder);
    expect((controller as any).updateOrderStatusUC.execute).toHaveBeenCalledWith(
      '1',
      dto.status,
    );
  });

  it('deve lançar exceção 404 ao tentar atualizar status de pedido inexistente', async () => {
    jest
      .spyOn((controller as any).updateOrderStatusUC, 'execute')
      .mockResolvedValue(null);

    const dto = { status: OrderStatus.SHIPPED };
    await expect(controller.updateStatus('999', dto)).rejects.toThrow(
      new HttpException('Order not found', HttpStatus.NOT_FOUND),
    );
  });



  it('deve deletar pedido com sucesso', async () => {
    const mockOrder = new Order(
      '1',
      'cust-123',
      [],
      200,
      OrderStatus.CREATED,
      new Date(),
      new Date(),
    );
    mockRepo.findById.mockResolvedValue(mockOrder);
    mockRepo.delete.mockResolvedValue(undefined);

    const result = await controller.delete('1');

    expect(mockRepo.findById).toHaveBeenCalledWith('1');
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
    expect(result).toEqual({ message: 'Order deleted successfully' });
  });

  it('deve lançar exceção 404 ao deletar pedido inexistente', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(controller.delete('999')).rejects.toThrow(
      new HttpException('Order not found', HttpStatus.NOT_FOUND),
    );
  });
});
