import { Order } from '../../src/modules/orders/domain/order.entity';
import { OrderStatus } from '../../src/modules/orders/domain/order-status.enum';

describe('Order Entity (Domain)', () => {
  it('deve criar uma instância válida de Order', () => {
    const now = new Date();
    const order = new Order(
      '1',
      'cust-123',
      [{ productId: 'p01', quantity: 2 }],
      150,
      OrderStatus.CREATED,
      now,
      now,
    );

    expect(order).toBeInstanceOf(Order);
    expect(order.id).toBe('1');
    expect(order.customerId).toBe('cust-123');
    expect(order.items.length).toBe(1);
    expect(order.total).toBe(150);
    expect(order.status).toBe(OrderStatus.CREATED);
    expect(order.createdAt).toBe(now);
    expect(order.updatedAt).toBe(now);
  });

  it('deve permitir alterar o status do pedido manualmente', () => {
    const order = new Order(
      '2',
      'cust-456',
      [{ productId: 'p02', quantity: 1 }],
      80,
      OrderStatus.CREATED,
      new Date(),
      new Date(),
    );

    order.status = OrderStatus.SHIPPED;
    expect(order.status).toBe(OrderStatus.SHIPPED);
  });

  it('deve aceitar diferentes status definidos no enum', () => {
    const statuses = Object.values(OrderStatus);
    expect(statuses).toContain('criado');
    expect(statuses).toContain('em_processamento');
    expect(statuses).toContain('enviado');
    expect(statuses).toContain('entregue');
  });

  it('deve retornar valores consistentes ao serializar', () => {
    const order = new Order(
      '3',
      'cust-789',
      [{ productId: 'p03', quantity: 3 }],
      300,
      OrderStatus.DELIVERED,
      new Date('2025-01-01T00:00:00Z'),
      new Date('2025-01-01T00:00:00Z'),
    );

    const serialized = JSON.parse(JSON.stringify(order));

    expect(serialized.id).toBe('3');
    expect(serialized.customerId).toBe('cust-789');
    expect(serialized.status).toBe(OrderStatus.DELIVERED);
  });
});
