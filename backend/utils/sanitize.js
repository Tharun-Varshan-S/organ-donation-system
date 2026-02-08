/**
 * Utility to sanitize objects before sending in API responses
 * Removes sensitive fields like password, __v, and internal keys
 */

const SENSITIVE_FIELDS = ['password', '__v', 'secretKey', 'otp', 'otpExpire'];

export const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
    }

    // Handle Mongoose documents
    const data = obj.toObject ? obj.toObject({ getters: true }) : { ...obj };

    const sanitized = {};
    Object.keys(data).forEach(key => {
        if (!SENSITIVE_FIELDS.includes(key)) {
            sanitized[key] = sanitize(data[key]);
        }
    });

    return sanitized;
};

export default sanitize;
