import { Router } from 'express';
import { addEmployee, getEmployeeById ,getAllEmployees , updateOfficer,deleteOfficer} from '../controller/employee.js';
import { protectAdmin } from '../midleware/super.js';

const router = Router();


router.post('/add', addEmployee)
router.get('/get/:id', protectAdmin, getEmployeeById) 
router.get('/getAll',protectAdmin, getAllEmployees)
router.put('/update/:id', protectAdmin, updateOfficer);  // Update officer by ID
router.delete('/delete/:id', protectAdmin,deleteOfficer);  // Delete officer by ID

export default router;