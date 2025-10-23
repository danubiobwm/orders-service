import { UpdateOrderStatusUseCase } from '../../src/modules/orders/application/update-order-status.usecase';

describe('UpdateOrderStatusUseCase', () => {
  it('should update and publish', async () => {
    const mockRepo: any = { updateStatus: jest.fn().mockResolvedValue({ id: '1', status: 'shipped' }) };
    const mockPub: any = { publish: jest.fn().mockResolvedValue(undefined) };
    const uc = new UpdateOrderStatusUseCase(mockRepo, mockPub);

    const updated = await uc.execute('1', 'shipped');
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('1', 'shipped');
    expect(mockPub.publish).toHaveBeenCalled();
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('shipped');
  });
});