import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category?: string;
  division_id?: mongoose.Types.ObjectId;
  in_stock: boolean;
  featured: boolean;
  tags: string[];
  features: string[];
  created_at: Date;
  updated_at: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    compare_at_price: { type: Number },
    // Inventory
    sku: { type: String },
    in_stock: { type: Boolean, default: true, index: true },
    stock_quantity: { type: Number },
    // Shipping
    weight: { type: String, required: true },
    dimensions: { type: String },
    // Media & Org
    images: { type: [String], default: [] },
    category: { type: String, index: true },
    tags: { type: [String], default: [] },
    features: { type: [String], default: [] },
    division_id: { type: Schema.Types.ObjectId, ref: 'Division', index: true },
    featured: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
