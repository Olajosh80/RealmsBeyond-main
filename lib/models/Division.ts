import mongoose, { Schema, Document } from 'mongoose';

export interface IDivision extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

const DivisionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    image_url: { type: String },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.Division || mongoose.model<IDivision>('Division', DivisionSchema);
