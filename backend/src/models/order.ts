import { Schema, model, Document } from 'mongoose';

interface IOrder extends Document {
  pi_payment_id: string;
  product_id: string;
  user: string;
  amount: number;
  txid: string | null;
  paid: boolean;
  cancelled: boolean;
  completed: boolean;
  created_at: Date;
  is_refund: boolean;
  refunded_at: Date | null;
}

const OrderSchema = new Schema<IOrder>({
  pi_payment_id: { type: String, required: true },
  product_id: { type: String, required: true },
  user: { type: String, required: true },
  amount: { type: Number, required: true },
  txid: { type: String, default: null },
  paid: { type: Boolean, default: false },
  cancelled: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  is_refund: { type: Boolean, default: false },
  refunded_at: { type: Date, default: null },
});

const Order = model<IOrder>('order', OrderSchema);

export default Order;
