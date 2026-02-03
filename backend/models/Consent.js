import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        required: function () { return this.status === 'rejected'; }
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Ensure either donor or user is provided
consentSchema.pre('validate', function (next) {
    if (!this.donor && !this.user) {
        next(new Error('Consent must be linked to either a Donor or a User'));
    } else {
        next();
    }
});

export default mongoose.model('Consent', consentSchema);
