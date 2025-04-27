import Admin from '../schema/admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import geoip from 'geoip-lite';
import LoginLog from '../schema/logs.js';
import dotenv from 'dotenv';
dotenv.config();

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

// Helper to log actions
import geoip from 'geoip-lite';
import axios from 'axios';

const IPINFO_TOKEN = process.env.IPINFO_TOKEN; // Save your ipinfo token in .env

// Helper to fetch ISP (service provider) from IP address
async function getServiceProvider(ip) {
  try {
    const { data } = await axios.get(`https://ipinfo.io/${ip}/json?token=${IPINFO_TOKEN}`);
    return data.org || 'Unknown ISP';
  } catch (error) {
    console.error('Error fetching service provider:', error.message);
    return 'Unknown ISP';
  }
}

export const logAction = async ({ adminId, action, req }) => {
  try {
    let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || '127.0.0.1';

    // Handle localhost during development
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = '8.8.8.8'; // Use Google DNS IP to test
    }

    const locationData = geoip.lookup(ip) || {};

    let location = {
      city: locationData.city || 'Unknown',
      region: locationData.region || 'Unknown',
      country: locationData.country || 'Unknown',
      ll: locationData.ll || [], // [latitude, longitude]
    };

    const bname = await getServiceProvider(ip); // Fetch the ISP (example: MTN Ghana, Telecel Ghana)

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const osMatch = userAgent.match(/\(([^)]+)\)/);
    let operatingSystem = 'Unknown';

    if (osMatch && osMatch[1]) {
      operatingSystem = osMatch[1].split(';')[0];
    }

    await LoginLog.create({
      adminId,
      action,
      ip,
      location,
      bname,
      userAgent: operatingSystem,
      timestamp: new Date(),
    });

  } catch (error) {
    console.error('Error logging action:', error.message);
  }
};

// Controllers

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: admin._id.toString(), role: admin.role  , username: admin.username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
    });
    
    // Log login action
    await logAction({ adminId: admin._id,  action: 'login', req });

    res.status(200).json({
      message: 'Login successful',
      admin: {
        _id: admin._id,

        role: admin.role,
      },
      token,
    });

  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

export const logoutAdmin = async (req, res) => {
  try {

    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure this matches the secure flag
      sameSite: 'strict', // Adjust according to your cookie setup
      domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : 'localhost', // Ensure this matches the domain where the cookie was set
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout error', error: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin profile', error: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
     
    const adminId = req.user.id;
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }


    const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, { new: true });

    

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    await logAction({ adminId, action: `updated -${updatedAdmin.fullName}`, req });


    res.status(200).json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin profile', error: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await logAction({ adminId: deletedAdmin._id,  action: `deleted -${updatedAdmin.fullName}`, req });

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { fullName, department, username, password, role, rank, email, phone } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      fullName,
      department,
      phone,
      rank,
      email,
      username,
      password: hashedPassword,
      role,
    });

    await newAdmin.save();

    await logAction({ adminId: newAdmin._id, username: newAdmin.username, action: 'create', req });

    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
};

export const logs = async (req, res) => {
  try {
    const logs = await LoginLog.find()
    .sort({ createdAt: -1 })
    .populate('adminId'); 
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};
