// models/LoginLog.js
import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  ip: String,
  location: Object, // This stores city, region, country, etc.
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true }); // adds createdAt and updatedAt automatically

export default mongoose.model('LoginLog', loginLogSchema);
