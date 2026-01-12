const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUSPEND', 'LOGIN', 'LOGOUT']
    },
    performedBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        name: String,
        role: {
            type: String,
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

module.exports = mongoose.model('AuditLog', auditLogSchema);
