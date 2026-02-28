import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
        qualification: { type: String, required: true, trim: true, maxlength: 100 },
        licenseNumber: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
        specialization: { type: String, required: true, trim: true, maxlength: 100 },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', unique: true, sparse: true },
    },
    { timestamps: true }
);

const Doctor = mongoose.model('doctor', DoctorSchema);

export default Doctor;
