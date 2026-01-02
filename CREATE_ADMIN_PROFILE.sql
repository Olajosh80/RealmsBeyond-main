-- Quick Fix: Create Admin Profile
-- Run this in Supabase SQL Editor
-- Replace 'your-email@example.com' with your actual email address

-- Option 1: Create profile if it doesn't exist, or update role if it does
INSERT INTO user_profiles (id, full_name, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Admin User'),
  'admin'
FROM auth.users au
WHERE au.email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Option 2: If Option 1 doesn't work, do it in two steps:

-- Step A: Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Step B: Create the profile (replace YOUR_USER_ID with the id from Step A)
INSERT INTO user_profiles (id, full_name, role)
VALUES ('YOUR_USER_ID', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Verify it worked:
SELECT 
  au.email,
  up.id,
  up.role,
  up.full_name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'your-email@example.com';

