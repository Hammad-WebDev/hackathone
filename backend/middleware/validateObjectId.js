import mongoose from 'mongoose';

export const validateObjectId = (entity = 'resource') => (req, res, next) => {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: `invalid ${entity} id`,
            code: 400,
        });
    }
    next();
};
