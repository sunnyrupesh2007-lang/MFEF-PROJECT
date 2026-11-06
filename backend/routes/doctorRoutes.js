import express from 'express';
import { getDoctors, getDoctorById, getDoctorSlots } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);

export default router;
