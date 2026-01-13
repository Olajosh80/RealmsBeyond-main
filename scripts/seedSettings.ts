
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SiteSetting from '../lib/models/SiteSetting';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is likely not defined');
    process.exit(1);
}

const settings = [
    { key: 'site_name', value: 'Beyond Realms' },
    { key: 'logo_url', value: '/logo.png' },
    { key: 'contact_email', value: 'contact@beyondrealms.com' },
    { key: 'contact_phone', value: '+1 (555) 123-4567' },
    { key: 'address', value: '123 Innovation Dr, Tech City, TC 90210' },
    { key: 'social_facebook', value: 'https://facebook.com' },
    { key: 'social_twitter', value: 'https://twitter.com' },
    { key: 'social_instagram', value: 'https://instagram.com' },
    { key: 'social_linkedin', value: 'https://linkedin.com' },
];

async function seed() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI as string);
            console.log('Connected to MongoDB');
        }

        for (const setting of settings) {
            await SiteSetting.findOneAndUpdate(
                { key: setting.key },
                { ...setting },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }
        console.log('Site settings seeded successfully');
    } catch (error) {
        console.error('Error seeding settings:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

seed();
