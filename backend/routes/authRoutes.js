import express from 'express';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/userModel.js';
import Doctor from '../models/doctorModel.js';
import Receptionist from '../models/receptionistModel.js';
import Patient from '../models/patientModel.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const authRoutes = express.Router();

const emailRule = Joi.string().email({ tlds: { allow: false } }).required();
const passwordRule = Joi.string().min(6).max(50).required();

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: emailRule,
    password: passwordRule,
    role: Joi.string().valid('patient', 'doctor', 'receptionist', 'user'),
    qualification: Joi.string().max(100).when('role', { is: 'doctor', then: Joi.required() }),
    licenseNumber: Joi.string().max(50).when('role', { is: 'doctor', then: Joi.required() }),
    specialization: Joi.string().max(100).when('role', { is: 'doctor', then: Joi.required() }),
    hospitalName: Joi.string().max(100).when('role', { is: 'receptionist', then: Joi.required() }),
    location: Joi.string().max(150).when('role', { is: 'receptionist', then: Joi.required() }),
    timings: Joi.string().max(100).when('role', { is: 'receptionist', then: Joi.required() }),
    age: Joi.number().integer().min(0).max(130).when('role', { is: 'patient', then: Joi.required() }),
    gender: Joi.string().valid('male', 'female', 'other').when('role', { is: 'patient', then: Joi.required() }),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').when('role', { is: 'patient', then: Joi.required() }),
    disease: Joi.string().max(200).when('role', { is: 'patient', then: Joi.required() }),
});

const loginSchema = Joi.object({
    email: emailRule,
    password: passwordRule,
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(3).max(50),
    email: Joi.string().email({ tlds: { allow: false } }),
    password: Joi.string().min(6).max(50),
}).min(1);

const validateBody = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            message: error.details.map((item) => item.message.replaceAll('"', '')).join(', '),
            user: null,
            code: 400,
        });
    }
    req.body = value;
    next();
};

// register user 
authRoutes.post('/register', validateBody(registerSchema), async (req, res) => {
    const {
        password,
        email,
        role,
        qualification,
        licenseNumber,
        specialization,
        hospitalName,
        location,
        timings,
        age,
        gender,
        bloodGroup,
        disease,
        ...rest
    } = req.body;
    try {
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            return res.status(400).json({
                message: 'email already exists',
                user: null,
                code: 400,
            });
        }

        if (role === 'doctor') {
            const existingLicense = await Doctor.findOne({ licenseNumber }).lean();
            if (existingLicense) {
                return res.status(400).json({
                    message: 'license number already exists',
                    user: null,
                    code: 400,
                });
            }
        }

        const saltRounds = parseInt(process.env.SALT_ROUND || '10', 10);
        const hashPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ ...rest, email, password: hashPassword, ...(role ? { role } : {}) });
        await newUser.save();

        if (newUser.role === 'doctor') {
            try {
                const newDoctor = new Doctor({
                    name: newUser.name,
                    qualification,
                    licenseNumber,
                    specialization,
                    userId: newUser._id,
                });
                await newDoctor.save();
            } catch (error) {
                await User.findByIdAndDelete(newUser._id);
                return res.status(400).json({
                    message: error.message,
                    user: null,
                    code: 400,
                });
            }
        } else if (newUser.role === 'receptionist') {
            try {
                const newReceptionist = new Receptionist({
                    name: newUser.name,
                    hospitalName,
                    location,
                    timings,
                    userId: newUser._id,
                });
                await newReceptionist.save();
            } catch (error) {
                await User.findByIdAndDelete(newUser._id);
                return res.status(400).json({
                    message: error.message,
                    user: null,
                    code: 400,
                });
            }
        } else if (newUser.role === 'patient') {
            try {
                const newPatient = new Patient({
                    name: newUser.name,
                    age,
                    gender,
                    bloodGroup,
                    disease,
                    userId: newUser._id,
                });
                await newPatient.save();
            } catch (error) {
                await User.findByIdAndDelete(newUser._id);
                return res.status(400).json({
                    message: error.message,
                    user: null,
                    code: 400,
                });
            }
        }

        const user = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        };
        const token = jwt.sign(
            { _id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'user created successfully',
            user: { ...user, token },
            code: 201,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            user: null,
            code: 500,
        });
    }
});


// login user 
authRoutes.post('/login', validateBody(loginSchema), async (req, res) => {
    const { password, email } = req.body || {};

    try {
        const findUser = await User.findOne({ email }).lean();

        if (!findUser) {
            return res.status(400).json({
                message: 'email does not exist',
                user: null,
                code: 400,
            });
        }

        const isRightPassword = await bcrypt.compare(password, findUser.password);

        if (!isRightPassword) {
            return res.status(400).json({
                message: "incorrect password",
                user: null,
                code: 400,
            });
        }

        const user = findUser;
        delete user.password;
        delete user.__v;
        delete user.createdAt;
        delete user.updatedAt;

        const token = jwt.sign(
            { _id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'login successfully',
            user: {
                ...user,
                token,
            },
            code: 200,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            user: null,
            code: 500,
        });
    }
});

// VERIFY USER 
authRoutes.get('/verify', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean();
        if (!user) {
            return res.status(401).json({
                message: 'user not found',
                user: null,
                code: 401,
            });
        }

        res.status(200).json({
            message: 'user verified successfully',
            user,
            code: 200,
        });

    } catch (error) {
        res.status(401).json({
            message: 'invalid token',
            user: null,
            code: 401,
        });
    }

});

authRoutes.get('/users', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean();
        res.status(200).json({
            message: 'users fetched successfully',
            users,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            users: null,
            code: 500,
        });
    }
});

authRoutes.get('/users/:id', verifyToken, validateObjectId('user'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean();
        if (!user) {
            return res.status(404).json({
                message: 'user not found',
                user: null,
                code: 404,
            });
        }
        res.status(200).json({
            message: 'user fetched successfully',
            user,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            user: null,
            code: 500,
        });
    }
});

authRoutes.put('/users/:id', verifyToken, validateObjectId('user'), validateBody(updateUserSchema), async (req, res) => {
    try {
        if (req.body.email) {
            const emailOwner = await User.findOne({ email: req.body.email, _id: { $ne: req.params.id } }).lean();
            if (emailOwner) {
                return res.status(400).json({
                    message: 'email already exists',
                    user: null,
                    code: 400,
                });
            }
        }

        const payload = { ...req.body };
        if (payload.password) {
            const saltRounds = parseInt(process.env.SALT_ROUND || '10', 10);
            payload.password = await bcrypt.hash(payload.password, saltRounds);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true, projection: { password: 0, __v: 0, createdAt: 0, updatedAt: 0 } }
        ).lean();

        if (!updatedUser) {
            return res.status(404).json({
                message: 'user not found',
                user: null,
                code: 404,
            });
        }

        const updatedToken = jwt.sign(
            { _id: updatedUser._id, email: updatedUser.email, role: updatedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'user updated successfully',
            user: updatedUser,
            token: updatedToken,
            code: 200,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            user: null,
            code: 500,
        });
    }
});

authRoutes.delete('/users/:id', verifyToken, validateObjectId('user'), async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id).lean();
        if (!deletedUser) {
            return res.status(404).json({
                message: 'user not found',
                user: null,
                code: 404,
            });
        }

        delete deletedUser.password;
        res.status(200).json({
            message: 'user deleted successfully',
            user: deletedUser,
            code: 200,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            user: null,
            code: 500,
        });
    }
});

export default authRoutes;
