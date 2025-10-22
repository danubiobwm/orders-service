import { OrderRepositoryPort } from '../ports/order-repository.port';
import { EventPublisherPort } from '../ports/event-publisher.port';

export class UpdateOrderStatusUseCase {
  constructor(private readonly repo: OrderRepositoryPort, private readonly publisher: EventPublisherPort) {}

  async execute(id: string, status: string) {
    const updated = await this.repo.updateStatus(id, status);
    if (!updated) return null;

    // publicar evento de status atualizado
    await this.publisher.publish('order.status.updated', { orderId: updated.id, status: updated.status });

    return updated;
  }
}