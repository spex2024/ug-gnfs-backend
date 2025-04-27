import Department from "../schema/department.js";

export const createDepartment = async (req, res) => {
    try {
        const { name, colorCode } = req.body;
        const department = await Department.create({ name, colorCode });
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create department' });
    }
};

export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

export const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving department' });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedDepartment) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.status(200).json(updatedDepartment);
    } catch (error) {
        res.status(500).json({ error: 'Error updating department' });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const deleted = await Department.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.status(200).json({ message: 'Department deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting department' });
    }
};
