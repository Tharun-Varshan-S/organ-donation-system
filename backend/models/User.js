import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: false
    },
    isDonor: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        required: false
    },
    organ: {
        type: String, // e.g., "Kidney", "Liver"
        required: false
    },
    visibilityStatus: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    availabilityStatus: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    donations: [{
        organ: String,
        hospital: String,
        date: Date,
        status: {
            type: String,
            enum: ['Completed', 'Pending', 'Rejected'],
            default: 'Pending'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
