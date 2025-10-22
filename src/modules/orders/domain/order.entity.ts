import { OrderStatus } from './order-status.enum';

export class Order {
  constructor(
    public id: string | null,
    public customerId: string,
    public items: { productId: string; quantity: number }[],
    public total: number,
    public status: OrderStatus,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}