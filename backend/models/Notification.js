import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    type: {
        type: String,
        enum: ['SYSTEM', 'SLA_WARNING', 'EMERGENCY', 'APPROVAL', 'INFO'],
        default: 'INFO'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['normal', 'critical', 'emergency'],
        default: 'normal'
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedEntity: {
        id: mongoose.Schema.Types.ObjectId,
        model: {
            type: String,
            enum: ['Request', 'Donor', 'Transplant', 'Hospital']
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Notification', notificationSchema);
