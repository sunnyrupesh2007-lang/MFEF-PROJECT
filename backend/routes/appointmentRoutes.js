import express from 'express';
import { bookAppointment, getMyAppointments, cancelAppointment, getAppointmentById } from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All appointment routes require authentication

router.post('/', bookAppointment);
router.get('/my', getMyAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/cancel', cancelAppointment);

export default router;
