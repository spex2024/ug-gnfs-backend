import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Admin Schema
const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    rank: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: { 
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        
    },

} , {timestamps: true});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Admin Model
const Admin = mongoose.model('Admin', adminSchema);

export default Admin;