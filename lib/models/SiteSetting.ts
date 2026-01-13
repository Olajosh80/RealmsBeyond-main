import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSetting extends Document {
  key: string;
  value?: string;
  category?: string;
  created_at: Date;
  updated_at: Date;
}

const SiteSettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String },
    category: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.SiteSetting ||
  mongoose.model<ISiteSetting>('SiteSetting', SiteSettingSchema);
