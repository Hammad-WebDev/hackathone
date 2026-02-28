import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/userModel.js';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!token) {
            return res.status(401).json({
                message: 'token is missing',
                user: null,
                code: 401,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'invalid token',
            user: null,
            code: 401,
        });
    }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            message: 'invalid token',
            user: null,
            code: 401,
        });
    }

    User.findById(userId, { role: 1 })
        .lean()
        .then((dbUser) => {
            const userRole = dbUser?.role || req.user?.role;
            if (!userRole || !roles.includes(userRole)) {
                return res.status(403).json({
                    message: 'forbidden',
                    user: null,
                    code: 403,
                });
            }
            next();
        })
        .catch(() =>
            res.status(500).json({
                message: 'server error',
                user: null,
                code: 500,
            })
        );
};
