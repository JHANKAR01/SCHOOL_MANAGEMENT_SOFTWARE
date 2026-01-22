// server/src/utils/rate-limiter.ts
// Simple in-memory rate limiter (upgrade to Redis for production clustering)

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

const attempts = new Map<string, RateLimitRecord>();

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of attempts.entries()) {
        if (now > record.resetTime) {
            attempts.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number;
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (e.g., "login:192.168.1.1:user@email.com")
 * @param maxAttempts - Maximum attempts allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export const checkRateLimit = (
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes default
): RateLimitResult => {
    const now = Date.now();
    const record = attempts.get(key);

    // No existing record or expired - start fresh
    if (!record || now > record.resetTime) {
        attempts.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs };
    }

    // Check if limit exceeded
    if (record.count >= maxAttempts) {
        return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
    }

    // Increment and allow
    record.count++;
    return {
        allowed: true,
        remaining: maxAttempts - record.count,
        resetIn: record.resetTime - now
    };
};

/**
 * Reset rate limit for a key (call on successful login)
 */
export const resetRateLimit = (key: string): void => {
    attempts.delete(key);
};
