import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
        required: false // Optional if it's a registered User
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    medicalHistory: {
        type: String,
        required: true
    },
    lifestyleData: {
        type: String,
        required: true
    },
    consentSigned: {
        type: Boolean,
        default: false,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },
    reviewedAt: Date,
    rejectionReason: String,
    notes: String
}, {
    timestamps: true
});

// Ensure either donor or user is provided
applicationSchema.pre('validate', function (next) {
    if (!this.donor && !this.user) {
        next(new Error('Application must be linked to either a Donor or a User'));
    } else {
        next();
    }
});

export default mongoose.model('Application', applicationSchema);
