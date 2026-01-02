-- Fix Product Management Permissions and Storage
-- Run this in your Supabase SQL Editor

-- 1. Create missing RLS policies for products table
-- Only admins should be able to modify products

CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Storage Bucket Instructions
/*
   To fix "Bucket not found":
   1. Go to your Supabase Dashboard
   2. Click on "Storage" in the left sidebar
   3. Click "New bucket"
   4. Name it: products
   5. Set "Public bucket" to: ON
   6. Click "Save"
*/

-- 4. Storage RLS Policies (Optional but recommended)
-- By default, public buckets allow anyone to read, 
-- but you need policies to allow admins to upload to it.

-- Allow public read access to the products bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- Allow admins to upload/modify files in the products bucket
CREATE POLICY "Admins can upload files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'products' AND 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update files" ON storage.objects FOR UPDATE USING (
  bucket_id = 'products' AND 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete files" ON storage.objects FOR DELETE USING (
  bucket_id = 'products' AND 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
