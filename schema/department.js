import mongoose from 'mongoose';
// Define the schema for the Rank model

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    colorCode: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});


const Department = mongoose.model('Department', departmentSchema);
export default Department;