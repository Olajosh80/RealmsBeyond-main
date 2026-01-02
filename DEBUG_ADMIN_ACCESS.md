# Debugging Admin Access Issues

If you can't access the admin panel, follow these steps:

## Step 1: Verify Admin Status in Database

Run this SQL in Supabase SQL Editor (replace with your email):

```sql
-- Check if your user exists and has admin role
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  up.role,
  up.full_name,
  up.created_at as profile_created
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'your-email@example.com';
```

**Expected Result:**
- `role` should be `'admin'` (exactly, lowercase)
- Both `user` and `profile` should exist

## Step 2: If Profile Doesn't Exist or Role is Wrong

### Option A: Profile exists but role is wrong
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### Option B: Profile doesn't exist - create it
First, get your user ID:
```sql
SELECT id FROM auth.users WHERE email = 'your-email@example.com';
```

Then create the profile (replace `YOUR_USER_ID` with the ID from above):
```sql
INSERT INTO user_profiles (id, full_name, role)
VALUES ('YOUR_USER_ID', 'Your Name', 'admin');
```

### Option C: Verify the update worked
```sql
SELECT au.email, up.role 
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'your-email@example.com';
```

## Step 3: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try to access `/admin`
4. Look for these messages:
   - `[Admin Layout] User ID: ...`
   - `[Admin Layout] Profile: ...`
   - `[Admin Layout] Error: ...`

This will tell you what the code is seeing.

## Step 4: Clear Browser Cache and Cookies

1. Clear your browser cache
2. Clear cookies for your site
3. Sign out completely
4. Sign in again
5. Try accessing `/admin`

## Step 5: Common Issues

### Issue: "Profile is null"
**Cause:** Profile doesn't exist in database
**Fix:** Create profile using SQL in Step 2

### Issue: "Role is 'user' instead of 'admin'"
**Cause:** Role wasn't updated correctly
**Fix:** Run the UPDATE query in Step 2

### Issue: "Profile Error: ..."
**Cause:** RLS policy blocking access or database error
**Fix:** Check RLS policies allow SELECT on user_profiles

### Issue: "Redirect loop"
**Cause:** Session not being recognized
**Fix:** Clear cookies and sign in again

## Step 6: Test the Flow

1. **Sign out completely**
2. **Sign in with admin credentials**
3. **Check browser console** for any errors
4. **Try accessing `/admin` directly**
5. **Check what happens** - do you get redirected? What URL?

## Step 7: Manual Verification Query

Run this to see ALL users and their roles:

```sql
SELECT 
  au.email,
  up.role,
  CASE 
    WHEN up.role = 'admin' THEN '✅ ADMIN'
    WHEN up.role = 'user' THEN '👤 USER'
    WHEN up.role IS NULL THEN '❌ NO ROLE'
    ELSE '❓ UNKNOWN: ' || up.role
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;
```

## Still Not Working?

If after all these steps it still doesn't work:

1. Check the browser console for specific error messages
2. Verify the email you're signing in with matches the email in the database
3. Make sure you're signing out completely before testing
4. Try in an incognito/private window
5. Check if RLS policies are blocking the query

