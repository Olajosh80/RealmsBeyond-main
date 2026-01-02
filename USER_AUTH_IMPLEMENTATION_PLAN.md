# User Authentication & Profile Implementation Plan

## 📋 Current State Analysis

### ✅ Already Implemented

1. **User Registration/Sign Up**
   - ✅ Sign up page at `/signup`
   - ✅ Creates user in Supabase `auth.users`
   - ✅ Automatically creates profile in `user_profiles` table with `role: 'customer'`
   - ✅ Uses Supabase Authentication

2. **User Sign In**
   - ✅ Sign in page at `/signin`
   - ✅ Uses Supabase Authentication
   - ✅ Role-based redirect (admin → /admin, customer → /)

3. **Checkout Protection**
   - ✅ Checkout page already requires authentication
   - ✅ Redirects to `/signin?returnTo=/checkout` if not logged in
   - ✅ Located in `app/checkout/page.tsx` (lines 30-42)

4. **Cart Functionality**
   - ✅ Anyone can browse and add to cart (no auth required)
   - ✅ Cart persists in localStorage
   - ✅ Cart drawer accessible from navbar

5. **Sign Out API**
   - ✅ API route exists at `app/api/auth/signout/route.ts`
   - ✅ Uses Supabase `auth.signOut()`

### ❌ Missing Implementation

1. **Profile Icon in Navbar** - Not implemented
2. **User Dropdown Menu** - Not implemented
3. **Logout Functionality in UI** - Not implemented
4. **Conditional Navbar UI** - Show login/signup when logged out, profile when logged in
5. **User Profile Management Page** - Optional but recommended

---

## 🎯 Implementation Breakdown

### Phase 1: Update Header Component with Authentication UI

**File: `components/layout/Header.tsx`**

#### Changes Needed:

1. **Import Supabase and Auth Hooks**
   - Import `supabase` from `@/lib/supabase`
   - Add state to track user authentication status
   - Add state to track user profile data

2. **Add User Authentication State**
   ```typescript
   const [user, setUser] = useState<any>(null);
   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
   ```

3. **Add useEffect to Check Auth Status**
   - Listen to Supabase auth state changes
   - Fetch user profile when authenticated
   - Clean up on unmount

4. **Conditional Rendering in Navbar Icons Section**
   - **When NOT logged in:**
     - Show "Sign In" button/link
     - Show "Sign Up" button/link
   - **When logged in:**
     - Show profile icon/avatar (with dropdown)
     - Show cart icon (already exists)
     - Hide sign in/sign up buttons

5. **Profile Dropdown Menu Component**
   - User's name and email
   - "My Profile" link (optional)
   - "My Orders" link (optional)
   - "Logout" button
   - Handle click outside to close dropdown

#### UI Structure:

```
Desktop View:
[Search Icon] [Cart Icon] [Profile Avatar/Icon] ← When logged in
[Search Icon] [Cart Icon] [Sign In] [Sign Up] ← When NOT logged in

Mobile View:
[Menu Icon] ... [Cart Icon] [Profile Icon] ← When logged in
[Menu Icon] ... [Cart Icon] [Sign In] ← When NOT logged in
```

---

### Phase 2: Profile Dropdown Menu Component

**New File: `components/ui/UserMenu.tsx`**

#### Features:
- Dropdown menu that appears below profile icon
- Shows user avatar (from `user_profiles.avatar_url` or default)
- Shows user's full name and email
- Menu items:
  - My Profile (optional - links to `/profile` or `/account`)
  - My Orders (links to `/orders`)
  - Logout button
- Click outside to close
- Escape key to close
- Smooth animations

#### Props Interface:
```typescript
interface UserMenuProps {
  user: any; // Supabase user object
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null; // For positioning
}
```

---

### Phase 3: Logout Functionality

**File: `components/layout/Header.tsx` or `components/ui/UserMenu.tsx`**

#### Implementation:

1. **Create handleLogout Function**
   ```typescript
   const handleLogout = async () => {
     try {
       await supabase.auth.signOut();
       // Clear any local state
       setUser(null);
       setUserProfile(null);
       // Redirect to home page
       router.push('/');
     } catch (error) {
       console.error('Error signing out:', error);
     }
   };
   ```

2. **Add Logout Button to UserMenu**
   - Button in dropdown menu
   - Calls handleLogout on click
   - Shows loading state during logout

3. **Alternative: Use API Route**
   - Call `/api/auth/signout` endpoint
   - Handle response and redirect

---

### Phase 4: Profile Icon Implementation

#### Options for Profile Icon:

**Option A: Avatar Image** (Recommended)
- Use `user_profiles.avatar_url` if available
- Fallback to user's initials in a circle
- Fallback to default user icon

**Option B: Default User Icon**
- Use `FiUser` from react-icons
- Simple and clean

**Option C: User Initials Badge**
- Extract first letter of first and last name
- Display in colored circle
- Most personalized

#### Implementation Details:

1. **Avatar Component**
   - Check if `avatar_url` exists
   - If yes, show image
   - If no, show initials or default icon
   - Add hover effect
   - Add click handler to open dropdown

2. **Positioning**
   - Dropdown should appear below avatar
   - Align to the right edge
   - Add shadow and border
   - Use z-index to appear above other content

---

### Phase 5: Sign In/Sign Up Buttons (When Not Authenticated)

**File: `components/layout/Header.tsx`**

#### Implementation:

1. **Add Sign In Button**
   - Link to `/signin`
   - Styled to match navbar theme
   - Show only when `!user`

2. **Add Sign Up Button** (Optional)
   - Link to `/signup`
   - Can be styled as outline variant
   - Show only when `!user`

3. **Mobile Responsive**
   - Hide text on small screens, show icons only
   - Or add to mobile menu

---

### Phase 6: (Optional) User Profile Page

**New File: `app/profile/page.tsx` or `app/account/page.tsx`**

#### Features:
- View user profile information
- Edit profile (name, phone, address, avatar)
- View order history
- Change password
- Account settings

This is optional but recommended for better UX.

---

## 📁 Files to Create/Modify

### New Files:
1. `components/ui/UserMenu.tsx` - Profile dropdown menu component

### Files to Modify:
1. `components/layout/Header.tsx` - Add auth state, profile icon, conditional rendering
2. (Optional) Create `app/profile/page.tsx` or `app/account/page.tsx`

---

## 🔧 Technical Implementation Details

### 1. Supabase Auth State Management

```typescript
useEffect(() => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    if (session?.user) {
      fetchUserProfile(session.user.id);
    }
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### 2. Fetch User Profile

```typescript
const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    setUserProfile(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};
```

### 3. User Menu Dropdown Positioning

```typescript
// Use refs and useEffect to position dropdown
const menuRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen, onClose]);
```

---

## 🎨 UI/UX Considerations

### Design Requirements:

1. **Follow App Color Theme**
   - Use `rare-primary` (#041a45) for text/buttons
   - Use `rare-accent` (#edcea4) for highlights
   - Use `rare-background` (#fdfbf8) for backgrounds
   - Match existing navbar styling

2. **Responsive Design**
   - Desktop: Show full buttons/text
   - Mobile: Show icons only or add to mobile menu
   - Dropdown should work on touch devices

3. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation (Tab, Enter, Escape)
   - Focus management

4. **Animations**
   - Smooth dropdown open/close
   - Hover effects on buttons
   - Loading states for logout

---

## 🔐 Security Considerations

1. **Client-Side Only**
   - This is UI-only implementation
   - Auth checks still happen on server (middleware, API routes)

2. **Session Management**
   - Supabase handles session tokens
   - Logout clears session properly

3. **Profile Data**
   - Only fetch user's own profile
   - Use RLS policies (already in place)

---

## 📝 Implementation Checklist

### Phase 1: Header Updates
- [ ] Add Supabase imports to Header
- [ ] Add auth state management (user, userProfile)
- [ ] Add useEffect to listen to auth changes
- [ ] Add fetchUserProfile function
- [ ] Add conditional rendering for auth state
- [ ] Add Sign In/Sign Up buttons (when not logged in)

### Phase 2: Profile Icon & Dropdown
- [ ] Create UserMenu component
- [ ] Add profile icon/avatar to Header
- [ ] Implement dropdown menu
- [ ] Add click outside to close
- [ ] Add keyboard navigation
- [ ] Style according to theme

### Phase 3: Logout
- [ ] Implement handleLogout function
- [ ] Add logout button to UserMenu
- [ ] Handle logout loading state
- [ ] Test logout flow

### Phase 4: Testing
- [ ] Test sign in flow
- [ ] Test sign up flow
- [ ] Test logout flow
- [ ] Test profile dropdown
- [ ] Test responsive design
- [ ] Test checkout protection

### Phase 5: Optional Enhancements
- [ ] Create user profile page
- [ ] Add "My Orders" link
- [ ] Add avatar upload functionality
- [ ] Add profile editing

---

## 🚀 Implementation Order

1. **First**: Update Header with auth state management
2. **Second**: Add profile icon/avatar (simple version first)
3. **Third**: Create UserMenu dropdown component
4. **Fourth**: Implement logout functionality
5. **Fifth**: Add Sign In/Sign Up buttons for unauthenticated users
6. **Sixth**: Polish UI and test thoroughly
7. **Seventh**: (Optional) Add profile page

---

## 📌 Key Notes

1. **Single Auth System**: Confirmed - we're using one Supabase auth system for all users (customers and admins)

2. **Checkout Already Protected**: The checkout page already requires authentication, so no changes needed there

3. **Profile Creation**: Users already get profiles created automatically on signup (in `user_profiles` table)

4. **Admin vs Customer**: Admins and customers use the same auth flow, but are redirected differently based on role

5. **Cart Functionality**: Already works for everyone (authenticated or not)

---

## 🎯 Expected Final Result

### When User is NOT Logged In:
- Navbar shows: [Search] [Cart] [Sign In] [Sign Up]
- Can browse products
- Can add to cart
- Redirected to sign in when trying to checkout

### When User IS Logged In (Customer):
- Navbar shows: [Search] [Cart] [Profile Avatar ↓]
- Clicking profile shows dropdown:
  - User name and email
  - My Profile (optional)
  - My Orders (optional)
  - Logout
- Can browse products
- Can add to cart
- Can proceed to checkout
- Redirected to `/` after login (not `/admin`)

### When Admin IS Logged In:
- Same as customer, but redirected to `/admin` after login
- Can still access customer features if they navigate to public pages

---

This is a comprehensive breakdown. Ready to implement when you give the go-ahead! 🚀

