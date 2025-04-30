// models/Employee.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  levelOfficer:{
    type:String,
    required:true

  },
  rank: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
  },
  serviceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  mateType: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  qualification:{
    type: String,
    required:true
  },
  department:{
    type: String,
    required:true
  },
  nationalId:{
    type:String,
    required:true
  },
   email:{
    type: String,
    required: true,
   },
  maritalStatus: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  emergencyContactName: {
    type: String,
    required: true,
  },
  emergencyContact: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

export default Employee;
