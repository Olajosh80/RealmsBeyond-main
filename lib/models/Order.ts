import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  user_id?: mongoose.Types.ObjectId;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  paystack_reference?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true, index: true },
    customer_phone: { type: String },
    shipping_address: { type: String, required: true },
    total_amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    payment_method: { type: String },
    paystack_reference: { type: String },
    notes: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
