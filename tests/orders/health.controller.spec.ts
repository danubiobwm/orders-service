import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../src/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve retornar status ok', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result).toHaveProperty('time');
    expect(new Date(result.time)).toBeInstanceOf(Date);
  });
});
