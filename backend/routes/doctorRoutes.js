import express from 'express';
import Joi from 'joi';
import Doctor from '../models/doctorModel.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const doctorRoutes = express.Router();

const doctorCreateSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    qualification: Joi.string().max(100).required(),
    licenseNumber: Joi.string().max(50).required(),
    specialization: Joi.string().max(100).required(),
});

const doctorUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    qualification: Joi.string().max(100),
    licenseNumber: Joi.string().max(50),
    specialization: Joi.string().max(100),
}).min(1);

const validateBody = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            message: error.details.map((item) => item.message.replaceAll('"', '')).join(', '),
            doctor: null,
            code: 400,
        });
    }
    req.body = value;
    next();
};

// add doctor
doctorRoutes.post('/create-doctor', verifyToken, authorizeRoles('admin'), validateBody(doctorCreateSchema), async (req, res) => {
    try {
        const existing = await Doctor.findOne({ licenseNumber: req.body.licenseNumber }).lean();
        if (existing) {
            return res.status(400).json({
                message: 'license number already exists',
                doctor: null,
                code: 400,
            });
        }

        const newDoctor = new Doctor(req.body);
        await newDoctor.save();

        res.status(201).json({
            message: 'doctor created successfully',
            doctor: newDoctor,
            code: 201,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            doctor: null,
            code: 500,
        });
    }
});

// get all doctors
doctorRoutes.get('/get-all-doctors', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const doctors = await Doctor.find({}, { __v: 0 }).lean();
        res.status(200).json({
            message: 'doctors fetched successfully',
            doctors,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            doctors: null,
            code: 500,
        });
    }
});

// update doctor
doctorRoutes.put('/update-doctor/:id', verifyToken, authorizeRoles('admin'), validateObjectId('doctor'), validateBody(doctorUpdateSchema), async (req, res) => {
    try {
        if (req.body.licenseNumber) {
            const licenseOwner = await Doctor.findOne({ licenseNumber: req.body.licenseNumber, _id: { $ne: req.params.id } }).lean();
            if (licenseOwner) {
                return res.status(400).json({
                    message: 'license number already exists',
                    doctor: null,
                    code: 400,
                });
            }
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true, projection: { __v: 0 } }
        ).lean();

        if (!updatedDoctor) {
            return res.status(404).json({
                message: 'doctor not found',
                doctor: null,
                code: 404,
            });
        }

        res.status(200).json({
            message: 'doctor updated successfully',
            doctor: updatedDoctor,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            doctor: null,
            code: 500,
        });
    }
});

// delete doctor
doctorRoutes.delete('/delete-doctor/:id', verifyToken, authorizeRoles('admin'), validateObjectId('doctor'), async (req, res) => {
    try {
        const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id).lean();
        if (!deletedDoctor) {
            return res.status(404).json({
                message: 'doctor not found',
                doctor: null,
                code: 404,
            });
        }

        res.status(200).json({
            message: 'doctor deleted successfully',
            doctor: deletedDoctor,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            doctor: null,
            code: 500,
        });
    }
});

export default doctorRoutes;
