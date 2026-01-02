# How to Set an Admin User

There are several ways to set a user as admin. Here are the methods:

## Method 1: Direct Database Update (Recommended for First Admin)

Since you can't use the admin panel without being an admin first, you'll need to set the first admin directly in the database.

### Using Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this SQL query:

```sql
-- Set a user as admin by email
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

**OR** if you know the user's UUID:

```sql
-- Set a user as admin by user ID
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

**Note:** Replace `'your-email@example.com'` with the actual email address of the user you want to make an admin.

### To Find a User's Email:

If you need to find users in your database, run:

```sql
-- View all users with their emails and roles
SELECT 
  up.id,
  up.full_name,
  up.role,
  au.email,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;
```

---

## Method 2: Through Admin Panel (Requires Existing Admin)

If you already have an admin user:

1. Sign in as an existing admin
2. Navigate to `/admin/users`
3. Find the user you want to make an admin
4. In the "Role" column, change the dropdown from "User" to "Admin"
5. The role will be updated automatically

---

## Method 3: Create Admin During Signup (Manual Code Change)

You can temporarily modify the signup code to create an admin, but this is **NOT recommended** for production:

1. Open `app/api/auth/signup/route.ts`
2. Temporarily change the default role:

```typescript
role: 'admin',  // ⚠️ Only for testing - change back after creating admin
```

3. Sign up a new user
4. Change the code back to `role: 'user'`
5. Delete the temporary admin user if needed

---

## Method 4: Using Supabase Service Role (Advanced)

If you have access to the service role key, you can create an API endpoint or script to set admins. However, this requires server-side code and is more complex.

---

## Verification

After setting an admin:

1. Sign out (if currently signed in)
2. Sign in with the admin user's credentials
3. You should be redirected to `/admin` instead of the home page
4. You should see the admin panel

---

## Troubleshooting

### If the update doesn't work:

1. **Check if the user exists:**
   ```sql
   SELECT * FROM user_profiles WHERE id = 'user-id-here';
   ```

2. **Check if the profile was created:**
   - Sometimes profiles aren't created if signup failed
   - You may need to manually create the profile:

   ```sql
   INSERT INTO user_profiles (id, full_name, role)
   VALUES (
     'user-id-from-auth-users',
     'Admin Name',
     'admin'
   );
   ```

3. **Verify the role was updated:**
   ```sql
   SELECT role FROM user_profiles WHERE id = 'user-id-here';
   ```

4. **Clear browser cache and cookies** - Sometimes cached session data needs to be refreshed

---

## Security Note

⚠️ **Important:** Only set trusted users as admins. Admin users have full access to:
- All products and content management
- User management (can change roles)
- Order management
- Site settings
- All admin-only features

---

## Quick Reference

### Check Current User Roles:
```sql
SELECT 
  au.email,
  up.role,
  up.full_name
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;
```

### Set Multiple Admins:
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin1@example.com', 'admin2@example.com')
);
```

### Remove Admin Status:
```sql
UPDATE user_profiles 
SET role = 'user' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'email@example.com');
```

