import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true
    },
    type: {
        type: String,
        default: 'APPLICATION'
    },
    relatedEntity: {
        model: {
            type: String,
            enum: ['Donor']
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedEntity.model'
        }
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
    medicalHistory: {
        type: String,
        required: false
    },
    lifestyleData: {
        type: String,
        required: false
    },
    consentSigned: {
        type: Boolean,
        default: false,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected', 'APPROVED'],
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

// Ensure either donor, user, or relatedEntity is provided
applicationSchema.pre('validate', function (next) {
    if (!this.donor && !this.user && !this.relatedEntity?.id) {
        next(new Error('Application must be linked to either a Donor or a User'));
    } else {
        next();
    }
});

export default mongoose.model('Application', applicationSchema);
