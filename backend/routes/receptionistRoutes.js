import express from 'express';
import Joi from 'joi';
import Receptionist from '../models/receptionistModel.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const receptionistRoutes = express.Router();

const receptionistCreateSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    hospitalName: Joi.string().max(100).required(),
    location: Joi.string().max(150).required(),
    timings: Joi.string().max(100).required(),
});

const receptionistUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    hospitalName: Joi.string().max(100),
    location: Joi.string().max(150),
    timings: Joi.string().max(100),
}).min(1);

const validateBody = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            message: error.details.map((item) => item.message.replaceAll('"', '')).join(', '),
            receptionist: null,
            code: 400,
        });
    }
    req.body = value;
    next();
};

// add receptionist
receptionistRoutes.post('/create-receptionist', verifyToken, authorizeRoles('admin'), validateBody(receptionistCreateSchema), async (req, res) => {
    try {
        const newReceptionist = new Receptionist(req.body);
        await newReceptionist.save();

        res.status(201).json({
            message: 'receptionist created successfully',
            receptionist: newReceptionist,
            code: 201,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            receptionist: null,
            code: 500,
        });
    }
});

// get all receptionists
receptionistRoutes.get('/get-all-receptionists', verifyToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const receptionists = await Receptionist.find({}, { __v: 0 }).lean();
        res.status(200).json({
            message: 'receptionists fetched successfully',
            receptionists,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            receptionists: null,
            code: 500,
        });
    }
});

// update receptionist
receptionistRoutes.put('/update-receptionist/:id', verifyToken, authorizeRoles('admin'), validateObjectId('receptionist'), validateBody(receptionistUpdateSchema), async (req, res) => {
    try {
        const updatedReceptionist = await Receptionist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true, projection: { __v: 0 } }
        ).lean();

        if (!updatedReceptionist) {
            return res.status(404).json({
                message: 'receptionist not found',
                receptionist: null,
                code: 404,
            });
        }

        res.status(200).json({
            message: 'receptionist updated successfully',
            receptionist: updatedReceptionist,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            receptionist: null,
            code: 500,
        });
    }
});

// delete receptionist
receptionistRoutes.delete('/delete-receptionist/:id', verifyToken, authorizeRoles('admin'), validateObjectId('receptionist'), async (req, res) => {
    try {
        const deletedReceptionist = await Receptionist.findByIdAndDelete(req.params.id).lean();
        if (!deletedReceptionist) {
            return res.status(404).json({
                message: 'receptionist not found',
                receptionist: null,
                code: 404,
            });
        }

        res.status(200).json({
            message: 'receptionist deleted successfully',
            receptionist: deletedReceptionist,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            receptionist: null,
            code: 500,
        });
    }
});

export default receptionistRoutes;
