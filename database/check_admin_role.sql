-- Quick Admin Check
-- Run this in Supabase SQL Editor to verify your admin setup

-- 1. Check your current user and role
SELECT 
  u.id as user_id,
  u.email,
  p.role,
  p.full_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'YOUR_EMAIL@example.com';  -- REPLACE WITH YOUR EMAIL

-- 2. If profile doesn't exist or role is not 'admin', run this:
-- (Make sure to replace YOUR_EMAIL@example.com)

UPDATE user_profiles 
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'YOUR_EMAIL@example.com'  -- REPLACE WITH YOUR EMAIL
);

-- 3. If no rows were updated, the profile doesn't exist. Create it:

INSERT INTO user_profiles (id, full_name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com'  -- REPLACE WITH YOUR EMAIL
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 4. Verify the update worked:

SELECT 
  u.email,
  p.role,
  p.full_name
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'YOUR_EMAIL@example.com';  -- REPLACE WITH YOUR EMAIL

-- Expected result: role should be 'admin'
