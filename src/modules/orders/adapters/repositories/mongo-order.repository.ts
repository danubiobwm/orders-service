import { Injectable } from '@nestjs/common';
import { OrderRepositoryPort } from '../../ports/order-repository.port';
import { Order } from '../../domain/order.entity';
import mongoose, { Schema, Model } from 'mongoose';

const OrderSchema = new Schema({
  _id: String,
  customerId: { type: String, required: true },
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  status: { type: String, required: true },
  createdAt: Date,
  updatedAt: Date
}, { versionKey: false });

const OrderModel: Model<any> = mongoose.models.Order || mongoose.model('Order', OrderSchema);

@Injectable()
export class MongoOrderRepository implements OrderRepositoryPort {
  async save(order: Order): Promise<Order> {
    const doc: any = await OrderModel.create(order);
    return new Order(doc._id, doc.customerId, doc.items, doc.total, doc.status, doc.createdAt, doc.updatedAt);
  }

  async findById(id: string): Promise<Order | null> {
    const doc: any = await OrderModel.findById(id).lean();
    if (!doc) return null;
    return new Order(doc._id, doc.customerId, doc.items, doc.total, doc.status, doc.createdAt, doc.updatedAt);
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    const doc: any = await OrderModel.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true }).lean();
    if (!doc) return null;
    return new Order(doc._id, doc.customerId, doc.items, doc.total, doc.status, doc.createdAt, doc.updatedAt);
  }
}
