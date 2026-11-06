import express from 'express';
import {
  getDashboardOverview,
  getDoctorAppointments,
  updateAppointmentStatus,
  callNextPatient,
  updateDoctorSettings,
} from '../controllers/doctorDashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Require logged-in doctor
router.use(protect);
router.use(authorize('doctor', 'admin'));

router.get('/overview', getDashboardOverview);
router.get('/appointments', getDoctorAppointments);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.post('/queue/call-next', callNextPatient);
router.patch('/settings', updateDoctorSettings);

export default router;
