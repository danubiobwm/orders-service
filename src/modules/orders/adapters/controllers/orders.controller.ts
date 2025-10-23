import { Controller, Post, Body, Get, Param, Patch, HttpException, HttpStatus, Inject, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { CreateOrderUseCase } from '../../application/create-order.usecase';
import { GetOrderUseCase } from '../../application/get-order.usecase';
import { UpdateOrderStatusUseCase } from '../../application/update-order-status.usecase';
import { ApiTags, ApiResponse, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrderRepositoryPort } from '../../ports/order-repository.port';
import { EventPublisherPort } from '../../ports/event-publisher.port';
import { UpdateStatusDto } from '../../dtos/update-status.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  private readonly createOrderUC: CreateOrderUseCase;
  private readonly getOrderUC: GetOrderUseCase;
  private readonly updateOrderStatusUC: UpdateOrderStatusUseCase;

  constructor(
    @Inject('OrderRepository') private readonly repo: OrderRepositoryPort,
    @Inject('EventPublisher') private readonly publisher: EventPublisherPort
  ) {
    this.createOrderUC = new CreateOrderUseCase(this.repo);
    this.getOrderUC = new GetOrderUseCase(this.repo);
    this.updateOrderStatusUC = new UpdateOrderStatusUseCase(this.repo, this.publisher);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado' })
  async create(@Body() dto: CreateOrderDto) {
    try {
      const order = await this.createOrderUC.execute(dto as any);
      return { id: order.id };
    } catch (err) {
      throw new HttpException('Error creating order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém pedido por id' })
  async get(@Param('id') id: string) {
    const order = await this.getOrderUC.execute(id);
    if (!order) throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    return order;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualiza status do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido (Mongo ObjectId)' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ status: 200, description: 'Pedido atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Invalid id or payload' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
     @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const updated = await this.updateOrderStatusUC.execute(id, dto.status);
    if (!updated) throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    return updated;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui um pedido' })
  @ApiResponse({ status: 200, description: 'Pedido deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async delete(@Param('id') id: string) {
    const found = await this.repo.findById(id);
    if (!found) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    await (this.repo as any).delete(id);
    return { message: 'Order deleted successfully' };
  }
}

