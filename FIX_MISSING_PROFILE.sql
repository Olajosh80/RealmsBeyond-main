-- Fix Missing Profile - Run this in Supabase SQL Editor
-- Replace 'your-email@example.com' with your actual email

-- Step 1: Find your user ID
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Step 2: Create the profile with admin role
-- Copy the 'id' from Step 1 and replace 'YOUR_USER_ID_HERE' below
INSERT INTO user_profiles (id, full_name, role)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your user ID from Step 1
  'Admin User',          -- Or your actual name
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Step 3: Verify it was created
SELECT 
  au.email,
  up.id,
  up.role,
  up.full_name
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'your-email@example.com';

-- If the profile exists but role is wrong, use this:
-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

