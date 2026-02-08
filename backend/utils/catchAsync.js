/**
 * Middleware to handle async errors in controllers
 * @param {Function} fn - The async controller function
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default catchAsync;

