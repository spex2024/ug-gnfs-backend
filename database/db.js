import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createDefaultAdmin } from '../schema/admin.js';
import Admin from '../schema/admin.js';

dotenv.config();
const connectDB = async (retries = 5, delay = 5000) => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Increased timeout
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Check if superadmin exists
        const existingAdmin = await Admin.findOne({ username: 'super_admin' });

        if (existingAdmin) {
            console.log('Superadmin already exists.');
            return;
        }

        // Create superadmin if not found
        await createDefaultAdmin();
        console.log('Superadmin created successfully.');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (retries > 0) {
            console.log(`Retrying in ${delay / 1000} seconds...`);
            setTimeout(() => connectDB(retries - 1, delay), delay);
        } else {
            console.log('Could not connect to MongoDB after multiple retries');
            process.exit(1);
        }
    }
};

export default connectDB;
