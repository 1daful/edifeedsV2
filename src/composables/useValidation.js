// composables/useValidation.js - Validation Rules
import { object, string, ref as yupRef } from 'yup';
export const useValidationRules = () => {
    const loginSchema = object({
        email: string()
            .required('Email is required')
            .email('Please enter a valid email address'),
        password: string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters')
    });
    const registerSchema = object({
        firstName: string()
            .required('First name is required')
            .min(2, 'First name must be at least 2 characters'),
        lastName: string()
            .required('Last name is required')
            .min(2, 'Last name must be at least 2 characters'),
        email: string()
            .required('Email is required')
            .email('Please enter a valid email address'),
        password: string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number and special character'),
        confirmPassword: string()
            .required('Please confirm your password')
            .oneOf([yupRef('password')], 'Passwords must match')
    });
    const forgotPasswordSchema = object({
        email: string()
            .required('Email is required')
            .email('Please enter a valid email address')
    });
    return {
        loginSchema,
        registerSchema,
        forgotPasswordSchema
    };
};
