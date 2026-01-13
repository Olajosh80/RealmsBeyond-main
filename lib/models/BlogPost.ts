import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: string;
  author_image?: string;
  featured_image?: string;
  category?: string;
  tags: string[];
  published: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const BlogPostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    author: { type: String, required: true },
    author_image: { type: String },
    featured_image: { type: String },
    category: { type: String, index: true },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: false, index: true },
    published_at: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
