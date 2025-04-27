import { Router } from 'express';
import {
  createAdmin,
  deleteAdmin,
  getAdminProfile,
  getAllAdmins,
  loginAdmin,
  logoutAdmin,
  logs,
  updateAdminProfile,
} from '../controller/admin.js';

import {
  createRank,
  deleteRank,
  getAllRanks,
  getRankById,
  updateRank,
} from '../controller/ranks.js';

import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} from '../controller/departments.js';

import { protectAdmin } from '../midleware/super.js';

const router = Router();

// ===== Admin Routes =====
router.post('/login', loginAdmin);
router.post('/logout', protectAdmin, logoutAdmin);
router.post('/add', protectAdmin, createAdmin);
router.get('/get/:id', protectAdmin, getAdminProfile);
router.get('/admins', protectAdmin, getAllAdmins);
router.get('/logs', protectAdmin, logs);
router.put('/update/:id', protectAdmin, updateAdminProfile);
router.delete('/delete/:id', protectAdmin, deleteAdmin);

// ===== Rank Routes =====
router.post('/rank/add', protectAdmin, createRank);
router.get('/ranks', protectAdmin, getAllRanks);
router.get('/rank/:id', protectAdmin, getRankById);
router.put('/rank/update/:id', protectAdmin, updateRank);
router.delete('/rank/delete/:id', protectAdmin, deleteRank);

// ===== Department Routes =====
router.post('/department/add', protectAdmin, createDepartment);
router.get('/departments', protectAdmin, getAllDepartments);
router.get('/department/:id', protectAdmin, getDepartmentById);
router.put('/department/update/:id', protectAdmin, updateDepartment);
router.delete('/department/delete/:id', protectAdmin, deleteDepartment);

export default router;
