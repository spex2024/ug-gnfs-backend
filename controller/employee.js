import Employee from '../schema/employee.js';
import LoginLog from '../schema/logs.js'; // Import the login log schema
import geoip from 'geoip-lite'; // Ensure geoip-lite is installed

// Log Action Function
const logAction = async ({ adminId, username, action, req }) => {
  try {
    let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || '127.0.0.1';

    // Handle localhost IPs
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = '8.8.8.8'; // Use a public IP for testing (Google Public DNS)
    }

    const location = geoip.lookup(ip) || {}; // fallback to empty object if null

    // Extract operating system using a simple regex
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const osMatch = userAgent.match(/\(([^)]+)\)/);
    let operatingSystem = 'Unknown';

    if (osMatch && osMatch[1]) {
      operatingSystem = osMatch[1].split(';')[0]; // Clean up the OS string
    }

    await LoginLog.create({
      adminId,
      username,
      action,
      ip,
      location,
      userAgent: operatingSystem, // Save only the OS
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging action:', error.message);
    // You might want to log this error somewhere instead of crashing the app
  }
};

// Add Employee Function
export const addEmployee = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      dob,
      levelOfficer,
      rank,
      appointmentDate,
      staffId,
      serviceNumber,
      mateInfo,
      maritalStatus,
      department,
      gender,
      qualification,
      nationalId,
      email,
      address,
      phoneNumber,
      emergencyContact,
    } = req.body;

    // Check if the officer already exists
    const existingOfficer = await Employee.findOne({
      $or: [
        { nationalId },
        { phoneNumber },
        { serviceNumber },
        { staffId },
        { email },
      ],
    });

    if (existingOfficer) {
      return res.status(409).json({ message: 'Officer already exists' });
    }

    // Create new employee
    const employee = await Employee.create({
      firstName,
      middleName,
      lastName,
      dob,
      levelOfficer,
      rank,
      appointmentDate,
      staffId,
      serviceNumber,
      mateType: mateInfo,
      department,
      gender,
      qualification,
      nationalId,
      email,
      maritalStatus,
      address,
      phoneNumber,
      emergencyContact,
    });

    // ✅ Send response first
    res.status(201).json({ message: 'Officer added successfully', employee });

    // 🔥 Then try logging, but don't block
    try {
      await logAction({
        adminId: req.user.id,
        action: `${employee.firstName} ${employee.lastName} - submitted`,
        req,
      });
    } catch (logError) {
      console.error('Failed to log action:', logError.message);
      // No need to crash the main flow if logging fails
    }

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error adding officer', error: error.message });
  }
};

// Get Employee by ID Function
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Officer not found' });
    }
    
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Employees Function
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Officer Function
export const updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      middleName,
      lastName,
      dob,
      rank,
      appointmentDate,
      staffId,
      serviceNumber,
      mateInfo,
      maritalStatus,
      gender,
      qualification,
      nationalId,
      department,
      email,
      address,
      phoneNumber,
      emergencyContact,
      previousRanks = [],
      previousDepartments = [],
    } = req.body;

    // Check if officer already exists (other than the current one being updated)
    const existingOfficer = await Employee.findOne({
      $or: [
        { nationalId },
        { phoneNumber },
        { serviceNumber },
        { staffId },
        { accountNumber },
        { email },
      ],
    });

    if (existingOfficer && existingOfficer._id.toString() !== id) {
      return res.status(409).json({ message: 'Officer already exists' });
    }

    // Update officer details
    const updatedOfficer = await Employee.findByIdAndUpdate(
      id,
      {
        firstName,
        middleName,
        lastName,
        dob,
        rank,
        department,
        appointmentDate,
        staffId,
        serviceNumber,
        mateType: mateInfo,
        gender,
        qualification,
        nationalId,
        department,
        email,
        maritalStatus,
        address,
        phoneNumber,
        emergencyContact,
        previousRanks,
        previousDepartments,
      },
      { new: true }
    );

    if (!updatedOfficer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    // Log the update action
    await logAction({
      adminId: req.user.id,
      action: `updated - ${updatedOfficer.firstName} ${updatedOfficer.lastName}`,
      req,
    });

    res.status(200).json({ message: 'Officer updated successfully', updatedOfficer });
  } catch (error) {
    res.status(400).json({ message: 'Error updating officer', error: error.message });
  }
};

// Delete Officer Function
export const deleteOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete officer by ID
    const officer = await Employee.findByIdAndDelete(id);

    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    // Log the delete action
    await logAction({
      adminId: req.user.id,
      action: `deleted - ${officer.firstName} ${officer.lastName}`,
      req,
    });

    res.status(200).json({ message: 'Officer deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting officer', error: error.message });
  }
};
