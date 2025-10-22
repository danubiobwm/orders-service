import { Order } from '../domain/order.entity';
import { OrderRepositoryPort } from '../ports/order-repository.port';
import { v4 as uuidv4 } from 'uuid';
import { OrderStatus } from '../domain/order-status.enum';

export class CreateOrderUseCase {
  constructor(private readonly repo: OrderRepositoryPort) {}

  async execute(data: { customerId: string; items: { productId: string; quantity: number }[]; total: number; }) {
    const id = uuidv4();
    const now = new Date();
    const order = new Order(id, data.customerId, data.items, data.total, OrderStatus.CREATED, now, now);
    return this.repo.save(order);
  }
}