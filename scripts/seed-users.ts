import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

// User Schema Definition (Inline to avoid import issues with Next.js specific alias paths in standalone script)
const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String },
        full_name: { type: String },
        role: { type: String, enum: ['admin', 'user'], default: 'user', index: true },
        phone: { type: String },
        address: { type: String },
        avatar_url: { type: String },
        is_verified: { type: Boolean, default: false },
        verification_token: { type: String },
        verification_token_expires: { type: Date },
        last_verification_sent_at: { type: Date },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUsers() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const usersToSeed = [
            {
                email: 'admin@gmail.com',
                password: 'password123',
                full_name: 'Admin User',
                role: 'admin',
                is_verified: true,
            },
            {
                email: 'ola@gmail.com',
                password: 'password123',
                full_name: 'Ola User',
                role: 'user',
                is_verified: true,
            },
        ];

        for (const userData of usersToSeed) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists. Updating verification status...`);
                existingUser.is_verified = true;
                existingUser.role = userData.role; // Ensure role is correct
                await existingUser.save();
                console.log(`Updated ${userData.email}`);
            } else {
                const hashedPassword = await bcrypt.hash(userData.password, 12);
                await User.create({
                    ...userData,
                    password: hashedPassword,
                });
                console.log(`Created user ${userData.email}`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedUsers();
