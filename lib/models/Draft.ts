import mongoose, { Schema, Document } from 'mongoose';

export interface IDraft extends Document {
    userId: string;
    resourceType: string; // e.g., 'product', 'blog'
    resourceId?: string; // specific ID being edited, or 'new'
    data: any; // The form data
    updatedAt: Date;
}

const DraftSchema: Schema = new Schema(
    {
        userId: { type: String, required: true, index: true }, // Store auth user email or ID
        resourceType: { type: String, required: true },
        resourceId: { type: String, default: 'new' },
        data: { type: Schema.Types.Mixed, default: {} },
    },
    {
        timestamps: { createdAt: false, updatedAt: true },
    }
);

// Compound index to easily search for a user's draft of a specific resource
DraftSchema.index({ userId: 1, resourceType: 1, resourceId: 1 }, { unique: true });

export default mongoose.models.Draft || mongoose.model<IDraft>('Draft', DraftSchema);
