import mongoose from 'mongoose';

const ReceptionistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
        hospitalName: { type: String, required: true, trim: true, maxlength: 100 },
        location: { type: String, required: true, trim: true, maxlength: 150 },
        timings: { type: String, required: true, trim: true, maxlength: 100 },
    },
    { timestamps: true }
);

const Receptionist = mongoose.model('receptionist', ReceptionistSchema);

export default Receptionist;
