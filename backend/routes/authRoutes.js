import express from 'express';
import { register, login, getMe, getAllPatients, getAllDoctors } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/patients', getAllPatients);
router.get('/doctors-list', getAllDoctors);

export default router;
