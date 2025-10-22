import { CreateOrderUseCase } from '../../src/modules/orders/application/create-order.usecase';

describe('CreateOrderUseCase', () => {
  it('should create order via repository', async () => {
    const mockRepo: any = {
      save: jest.fn().mockImplementation(async (order) => order)
    };

    const uc = new CreateOrderUseCase(mockRepo);
    const result = await uc.execute({ customerId: 'c1', items: [{ productId: 'p1', quantity: 1 }], total: 100 });

    expect(mockRepo.save).toHaveBeenCalled();
    expect(result.customerId).toBe('c1');
  });
});