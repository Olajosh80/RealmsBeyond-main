import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('   Optional but recommended: SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env');
  console.warn('   Add it to .env.local for full admin capabilities');
}

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

const adminEmail = 'admin@beyondrealms.com';
const adminPassword = 'AdminPassword123!@#';
const adminName = 'Super Admin';

async function createAdmin() {
  try {
    console.log('🔄 Creating super admin user...');
    console.log(`   Email: ${adminEmail}`);

    // Create admin user
    const { data: authData, error: signupError } = await client.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
      },
    });

    if (signupError) {
      // If user already exists, just ensure the profile is set to admin
      if (signupError.message.includes('already been registered')) {
        console.log('⏭️  User already exists, ensuring admin profile...');
        
        // Get the user by email
        const { data: users, error: listError } = await client.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Error listing users:', listError.message);
          process.exit(1);
        }
        
        const existingUser = users?.users.find(u => u.email === adminEmail);
        if (!existingUser) {
          console.error('❌ User not found');
          process.exit(1);
        }
        
        // Update the profile
        const { error: profileError } = await client
          .from('user_profiles')
          .upsert([{
            id: existingUser.id,
            full_name: adminName,
            role: 'admin',
          }]);
        
        if (profileError) {
          console.error('❌ Error updating profile:', profileError.message);
          process.exit(1);
        }
        
        console.log('✅ Admin profile ensured');
        console.log('\n' + '='.repeat(50));
        console.log('✅ SUPER ADMIN READY!');
        console.log('='.repeat(50));
        console.log('\n📧 Email:', adminEmail);
        console.log('🔑 Password:', adminPassword);
        console.log('\n🔗 Sign In: http://localhost:3000/signin');
        console.log('📊 Admin Dashboard: http://localhost:3000/admin');
        console.log('='.repeat(50) + '\n');
        process.exit(0);
      }
      
      console.error('❌ Error creating auth user:', signupError.message);
      process.exit(1);
    }

    console.log('✅ Auth user created');

    // Create admin profile (or update if exists)
    if (authData.user) {
      const { error: profileError } = await client
        .from('user_profiles')
        .upsert([
          {
            id: authData.user.id,
            full_name: adminName,
            role: 'admin',
          },
        ]);

      if (profileError) {
        console.error('❌ Error creating profile:', profileError.message);
        process.exit(1);
      }

      console.log('✅ Admin profile created');
      console.log('\n' + '='.repeat(50));
      console.log('✅ SUPER ADMIN CREATED SUCCESSFULLY!');
      console.log('='.repeat(50));
      console.log('\n📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('\n🔗 Sign In: http://localhost:3000/signin');
      console.log('📊 Admin Dashboard: http://localhost:3000/admin');
      console.log('\n⚠️  Save these credentials! Change the password after first login.');
      console.log('='.repeat(50) + '\n');
      process.exit(0);
    } else {
      console.error('❌ No user data returned');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

createAdmin();
