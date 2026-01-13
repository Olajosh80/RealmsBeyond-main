import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    parent?: mongoose.Types.ObjectId;
    count: number;
    created_at: Date;
    updated_at: Date;
}

const CategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String },
        parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        count: { type: Number, default: 0 },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
