import { z } from 'zod';
import { ErrorResponse } from './error.js';

/**
 * Middleware to validate request against Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
const validateRequest = (schema) => async (req, res, next) => {
    try {
        // Validate body, query, and params if they exist in schema
        // We assume the schema is a Zod object that wraps strict shapes or partials
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Format Zod errors
            const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
            return next(new ErrorResponse(errorMessage, 400));
        }
        next(error);
    }
};

export default validateRequest;
