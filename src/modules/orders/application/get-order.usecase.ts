import { OrderRepositoryPort } from '../ports/order-repository.port';

export class GetOrderUseCase {
  constructor(private readonly repo: OrderRepositoryPort) {}

  async execute(id: string) {
    return this.repo.findById(id);
  }
}