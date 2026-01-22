// server/src/utils/validation.ts
// Input validation and sanitization utilities

/**
 * Basic XSS sanitization - escapes HTML entities
 */
export const sanitizeString = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Phone validation (Indian format - 10 digits starting with 6-9)
 */
export const isValidPhone = (phone: string): boolean => {
    if (typeof phone !== 'string') return false;
    const cleaned = phone.replace(/\D/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleaned);
};

/**
 * Password strength validation
 */
export const isValidPassword = (password: string): { valid: boolean; error?: string } => {
    if (typeof password !== 'string') {
        return { valid: false, error: 'Password is required' };
    }
    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
    }
    return { valid: true };
};

/**
 * Trim and normalize string input
 */
export const normalizeString = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input.trim();
};

/**
 * Normalize email (lowercase and trim)
 */
export const normalizeEmail = (email: string): string => {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim();
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
    if (!obj || typeof obj !== 'object') return obj;

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map(item =>
                typeof item === 'string' ? sanitizeString(item) :
                    typeof item === 'object' ? sanitizeObject(item) : item
            );
        } else if (typeof value === 'object' && value !== null) {
            result[key] = sanitizeObject(value);
        } else {
            result[key] = value;
        }
    }
    return result;
};
