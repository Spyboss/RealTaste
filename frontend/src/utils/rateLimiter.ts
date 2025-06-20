// Simple client-side rate limiter to prevent excessive API calls

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) { // 5 attempts per minute
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxAttempts) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    
    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  reset(key: string): void {
    this.limits.delete(key);
  }
}

// Create singleton instances for different operations
export const authRateLimiter = new RateLimiter(3, 60000); // 3 attempts per minute for auth
export const signupRateLimiter = new RateLimiter(2, 300000); // 2 attempts per 5 minutes for signup

// Helper function to get a rate limit key based on operation and identifier
export const getRateLimitKey = (operation: string, identifier: string = 'default'): string => {
  return `${operation}:${identifier}`;
};

// Helper function to format remaining time
export const formatRemainingTime = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};