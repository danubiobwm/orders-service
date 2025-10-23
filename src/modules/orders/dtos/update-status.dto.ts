import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../domain/order-status.enum';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Novo status do pedido',
    example: OrderStatus.SHIPPED,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus, { message: 'status inválido' })
  status: OrderStatus;
}
