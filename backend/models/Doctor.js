import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required']
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true
    },
    phone: String,
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    availability: {
        type: String,
        enum: ['available', 'on-call', 'busy', 'away'],
        default: 'available'
    },
    stats: {
        totalSurgeries: { type: Number, default: 0 },
        successfulSurgeries: { type: Number, default: 0 },
        successRate: { type: Number, default: 0 }
    },
    experience: Number, // years
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate success rate before saving
doctorSchema.pre('save', function (next) {
    if (this.stats.totalSurgeries > 0) {
        this.stats.successRate = Math.round((this.stats.successfulSurgeries / this.stats.totalSurgeries) * 100);
    } else {
        this.stats.successRate = 0;
    }
    next();
});

export default mongoose.model('Doctor', doctorSchema);
