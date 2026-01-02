import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Division {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image_url: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category: string;
  division_id: string;
  division?: Division;
  in_stock: boolean;
  featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  author_image?: string;
  featured_image: string;
  category: string;
  tags: string[];
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

