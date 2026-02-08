import { sanitize } from '../utils/sanitize.js';

/**
 * Middleware to intercept res.json and sanitize the response data
 */
const sanitizeResponse = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        if (data && data.success && data.data) {
            // If the response follows the { success: true, data: ... } pattern
            data.data = sanitize(data.data);
        } else if (data && !data.success && data.message) {
            // Error responses - usually don't need sanitization but good to be safe
        } else {
            // Generic objects
            data = sanitize(data);
        }

        return originalJson.call(this, data);
    };

    next();
};

export default sanitizeResponse;
