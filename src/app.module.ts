import { Module } from '@nestjs/common';
import { OrdersModule } from './modules/orders/orders.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [OrdersModule],
  controllers: [HealthController],
  providers: []
})
export class AppModule {}