import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function verifyAdmin() {
  try {
    console.log('🔍 Checking admin user...\n');

    // Check auth user
    const { data: users, error: listError } = await client.auth.admin.listUsers();
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      process.exit(1);
    }

    const adminUser = users?.users.find(u => u.email === 'admin@beyondrealms.com');
    if (!adminUser) {
      console.error('❌ Admin user not found in auth');
      process.exit(1);
    }

    console.log('✅ Auth user found:');
    console.log('   Email:', adminUser.email);
    console.log('   ID:', adminUser.id);
    console.log('   Created:', adminUser.created_at);

    // Check profile
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', adminUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('\n❌ Error checking profile:', profileError.message);
      process.exit(1);
    }

    if (!profile) {
      console.error('\n❌ No profile found for admin user!');
      console.log('   User ID:', adminUser.id);
      console.log('   This is the issue - the profile was not created');
      process.exit(1);
    }

    console.log('\n✅ Profile found:');
    console.log('   ID:', profile.id);
    console.log('   Full Name:', profile.full_name);
    console.log('   Role:', profile.role);
    console.log('   Created:', profile.created_at);

    if (profile.role === 'admin') {
      console.log('\n✅ ADMIN ROLE CONFIRMED! Everything is set correctly.');
    } else {
      console.error('\n❌ ROLE IS NOT ADMIN! Found:', profile.role);
      console.log('   This is why you cannot access the admin panel');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

verifyAdmin();
