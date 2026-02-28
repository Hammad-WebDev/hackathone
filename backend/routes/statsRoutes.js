import express from 'express';
import Doctor from '../models/doctorModel.js';
import Patient from '../models/patientModel.js';
import Receptionist from '../models/receptionistModel.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const statsRoutes = express.Router();

// get counts for dashboard
statsRoutes.get('/get-counts', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const [doctors, patients, receptionists] = await Promise.all([
            Doctor.countDocuments({}),
            Patient.countDocuments({}),
            Receptionist.countDocuments({}),
        ]);

        res.status(200).json({
            message: 'counts fetched successfully',
            counts: {
                doctors,
                patients,
                receptionists,
            },
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            counts: null,
            code: 500,
        });
    }
});

export default statsRoutes;
