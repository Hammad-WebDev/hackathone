import mongoose from 'mongoose';


const UserSchema = new mongoose.Schema({
    role: { type: String, enum: ['admin', 'doctor', 'receptionist', 'patient', 'user'], default: 'patient' },
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
},
    {
        timestamps: true
    })

const User = mongoose.model('user', UserSchema);

export default User;
