import { z } from 'zod';

// Password complexity regex: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const authSchemas = {
    adminLogin: z.object({
        body: z.object({
            email: z.string().email('Invalid email address'),
            password: z.string().min(1, 'Password is required'),
        }),
    }),
    adminRegister: z.object({
        body: z.object({
            name: z.string().min(2, 'Name is required'),
            email: z.string().email('Invalid email address'),
            password: passwordSchema,
            secretKey: z.string().min(1, 'Secret key is required'),
        }),
    }),
};

export const adminSchemas = {
    updateHospitalStatus: z.object({
        body: z.object({
            status: z.enum(['approved', 'pending', 'suspended', 'rejected']),
            reason: z.string().optional(),
        }),
        params: z.object({
            id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
        }),
    }),
    updateSettings: z.object({
        body: z.object({
            notifications: z.boolean().optional(),
            theme: z.enum(['light', 'dark']).optional(),
        }).passthrough(),
    }),
};

export const hospitalSchemas = {
    login: z.object({
        body: z.object({
            email: z.string().email('Invalid email address'),
            password: z.string().min(1, 'Password is required'),
        }),
    }),
    register: z.object({
        body: z.object({
            name: z.string().min(2, 'Hospital name is required'),
            email: z.string().email('Invalid email address'),
            password: passwordSchema,
            licenseNumber: z.string().min(1, 'License number is required'),
            phone: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            specializations: z.array(z.string()).optional(),
        }),
    }),
    updateProfile: z.object({
        body: z.object({
            name: z.string().min(2).optional(),
            phone: z.string().optional(),
            emergencyPhone: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            specializations: z.array(z.string()).optional(),
            capacity: z.object({
                totalBeds: z.number().optional(),
                availableBeds: z.number().optional(),
            }).optional(),
        }).passthrough(),
    }),
};

export const userSchemas = {
    login: z.object({
        body: z.object({
            email: z.string().email('Invalid email address'),
            password: z.string().min(1, 'Password is required'),
        }),
    }),
    register: z.object({
        body: z.object({
            name: z.string().min(2, 'Name is required'),
            email: z.string().email('Invalid email address'),
            password: passwordSchema,
            bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
            isDonor: z.boolean().optional(),
        }),
    }),
    updateProfile: z.object({
        body: z.object({
            name: z.string().min(2).optional(),
            phone: z.string().optional(),
            bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
            isDonor: z.boolean().optional(),
            organ: z.string().optional(),
            visibilityStatus: z.enum(['public', 'private']).optional(),
            availabilityStatus: z.enum(['Active', 'Inactive']).optional(),
        }).passthrough(),
    }),
};
