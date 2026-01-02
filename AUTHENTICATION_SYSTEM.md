# Authentication System Overview

## 🔐 Authentication Architecture

**No, admins and regular users do NOT have separate authentication systems.** They use the **same authentication system** with **role-based access control (RBAC)**.

### Single Authentication System

Both admins and regular users:
- Use the same sign-in page (`/signin`)
- Use the same sign-up page (`/signup`)  
- Are stored in Supabase `auth.users` table
- Authenticate with email and password through Supabase Auth

## 👥 User Roles

Users are differentiated by a `role` field in the `user_profiles` table:

1. **`customer`** (default) - Regular users who can:
   - Browse products
   - Make purchases
   - View their own orders
   - Update their own profile

2. **`admin`** - Full administrative access:
   - Access `/admin` routes
   - Manage products, blog posts, divisions
   - View/manage all users
   - Update user roles
   - Manage orders

3. **`manager`** - Administrative access (similar to admin):
   - Access `/admin` routes
   - Can manage content and orders

## 📋 How It Works

### Sign Up Flow

1. User signs up at `/signup`
2. Supabase Auth creates account in `auth.users`
3. A profile record is automatically created in `user_profiles` table
4. **Default role is set to `'customer'`**
5. User is redirected to `/signin`

```typescript
// From app/api/auth/signup/route.ts
{
  id: authData.user.id,
  full_name: full_name || '',
  role: 'customer',  // ← Always defaults to 'customer'
}
```

### Sign In Flow

1. User signs in at `/signin` with email/password
2. Supabase Auth authenticates the credentials
3. System fetches user profile to check `role`
4. **Role-based redirect:**
   - `admin` or `manager` → Redirected to `/admin`
   - `customer` → Redirected to `/` (home page)

```typescript
// From app/signin/page.tsx
if (profile?.role === 'admin' || profile?.role === 'manager') {
  router.push('/admin');
} else {
  router.push('/');
}
```

### Admin Route Protection

The `middleware.ts` file protects all `/admin/*` routes:

1. Checks if user is authenticated (logged in)
2. If not authenticated → Redirects to `/signin`
3. If authenticated → Checks `user_profiles.role`
4. **Only allows access if role is `'admin'` or `'manager'`**
5. Regular customers are redirected to home page if they try to access `/admin`

```typescript
// From middleware.ts
if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
  return NextResponse.redirect(new URL('/', request.url));
}
```

## 🔑 Creating Admin Users

**Admin users cannot sign up directly** - they must be created manually:

### Method 1: Through Admin Panel (if you already have an admin)
- Existing admin goes to `/admin/users`
- Updates a user's role from `customer` to `admin`

### Method 2: Direct Database Update
Update the `user_profiles` table in Supabase:
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Method 3: During Sign Up (Manual)
You could modify the signup API route to allow admin creation with a special key/token, but currently it always defaults to `'customer'`.

## 📊 Database Structure

```sql
-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer',  -- 'customer', 'admin', or 'manager'
  phone VARCHAR(50),
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Security Features

1. **Row Level Security (RLS)** - Supabase RLS policies protect data
2. **Middleware Protection** - All `/admin` routes are protected
3. **API Route Checks** - Admin-only API routes verify role before allowing operations
4. **Session Management** - Supabase handles session tokens and refresh

## 📝 Key Files

- **Authentication Pages:**
  - `app/signin/page.tsx` - Sign in (redirects based on role)
  - `app/signup/page.tsx` - Sign up (always creates 'customer' role)
  
- **API Routes:**
  - `app/api/auth/signin/route.ts` - Sign in API
  - `app/api/auth/signup/route.ts` - Sign up API (creates customer profile)
  
- **Protection:**
  - `middleware.ts` - Protects `/admin` routes
  - `app/admin/layout.tsx` - Additional client-side protection
  
- **User Management:**
  - `app/admin/users/page.tsx` - Admin can update user roles

## 🎯 Summary

✅ **Single authentication system** for all users  
✅ **Role-based access control** determines permissions  
✅ **Default role is 'customer'** when signing up  
✅ **Admin role must be assigned manually** (cannot sign up as admin)  
✅ **Middleware protects admin routes** automatically  
✅ **Same sign-in page** - redirects based on role after login

