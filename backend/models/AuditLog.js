import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUSPEND', 'LOGIN', 'LOGOUT', 'CONFIDENTIAL_DATA_ACCESS', 'CONSENT_RECORD']
    },
    performedBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'performedBy.role' // Dynamic ref
        },
        name: String,
        role: {
            type: String,
            enum: ['Admin', 'Hospital', 'User'],
            default: 'Admin'
        }
    },
    entityType: {
        type: String,
        required: true,
        enum: ['HOSPITAL', 'DONOR', 'REQUEST', 'TRANSPLANT', 'SYSTEM']
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    details: {
        type: String
    },
    metadata: {
        type: Map,
        of: String
    },
    ipAddress: String
}, {
    timestamps: true
});

export default mongoose.model('AuditLog', auditLogSchema);
