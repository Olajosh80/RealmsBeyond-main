-- Script to verify admin user status
-- Run this in Supabase SQL Editor to check if your user is properly set as admin

-- 1. Check all users and their roles
SELECT 
  au.id as user_id,
  au.email,
  up.role,
  up.full_name,
  up.created_at as profile_created_at,
  au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;

-- 2. Check specific user by email (replace with your email)
SELECT 
  au.id as user_id,
  au.email,
  up.role,
  up.full_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'your-email@example.com';

-- 3. If role is NULL or 'user', set it to 'admin' (replace with your email)
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- 4. Verify the update worked
SELECT 
  au.email,
  up.role
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'your-email@example.com';

-- 5. If profile doesn't exist, create it (replace with your email and user ID)
-- First, get the user ID:
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then create the profile (use the ID from above):
-- INSERT INTO user_profiles (id, full_name, role)
-- VALUES ('user-id-from-above', 'Your Name', 'admin');

