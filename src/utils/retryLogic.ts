/**
 * Retry Logic Utility with Exponential Backoff
 * Provides robust retry mechanisms for failed operations
 */

export interface RetryOptions {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: any, attempt: number) => boolean;
    onRetry?: (error: any, attempt: number, delay: number) => void;
}

export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: any;
    attempts: number;
    totalTime: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    shouldRetry: (error: any) => {
        // Retry on network errors and 5xx server errors
        if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
            return true;
        }
        if (error?.status >= 500 && error?.status < 600) {
            return true;
        }
        // Retry on timeout errors
        if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
            return true;
        }
        // Retry on rate limit errors (429)
        if (error?.status === 429) {
            return true;
        }
        return false;
    },
    onRetry: () => { }
};

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();
    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            lastError = error;

            // Check if we should retry
            if (attempt >= opts.maxAttempts || !opts.shouldRetry(error, attempt)) {
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
                opts.maxDelay
            );

            // Add jitter to prevent thundering herd
            const jitter = Math.random() * 0.3 * delay;
            const actualDelay = delay + jitter;

            // Notify about retry
            opts.onRetry(error, attempt, actualDelay);

            // Wait before retrying
            await sleep(actualDelay);
        }
    }

    throw lastError;
}

/**
 * Execute a function with retry logic and return detailed result
 */
export async function retryWithBackoffDetailed<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let attempts = 0;

    try {
        const data = await retryWithBackoff(fn, {
            ...options,
            onRetry: (error, attempt, delay) => {
                attempts = attempt;
                options.onRetry?.(error, attempt, delay);
            }
        });

        return {
            success: true,
            data,
            attempts: attempts + 1,
            totalTime: Date.now() - startTime
        };
    } catch (error) {
        return {
            success: false,
            error,
            attempts: options.maxAttempts || DEFAULT_OPTIONS.maxAttempts,
            totalTime: Date.now() - startTime
        };
    }
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
    url: string,
    init?: RequestInit,
    options: RetryOptions = {}
): Promise<Response> {
    return retryWithBackoff(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const response = await fetch(url, {
                ...init,
                signal: controller.signal
            });

            clearTimeout(timeout);

            // Throw error for non-ok responses
            if (!response.ok) {
                const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.response = response;
                throw error;
            }

            return response;
        } catch (error: any) {
            clearTimeout(timeout);

            // Handle abort as timeout error
            if (error.name === 'AbortError') {
                const timeoutError: any = new Error('Request timeout');
                timeoutError.name = 'TimeoutError';
                throw timeoutError;
            }

            throw error;
        }
    }, options);
}

/**
 * Fetch JSON with retry logic
 */
export async function fetchJsonWithRetry<T = any>(
    url: string,
    init?: RequestInit,
    options: RetryOptions = {}
): Promise<T> {
    const response = await fetchWithRetry(url, init, options);
    return response.json();
}

/**
 * Execute multiple operations with retry, fail fast on first success
 */
export async function retryRace<T>(
    fns: Array<() => Promise<T>>,
    options: RetryOptions = {}
): Promise<T> {
    const errors: any[] = [];

    for (const fn of fns) {
        try {
            return await retryWithBackoff(fn, options);
        } catch (error) {
            errors.push(error);
        }
    }

    // All attempts failed
    const error: any = new Error('All retry attempts failed');
    error.errors = errors;
    throw error;
}

/**
 * Execute multiple operations with retry, return all successful results
 */
export async function retryAll<T>(
    fns: Array<() => Promise<T>>,
    options: RetryOptions = {}
): Promise<Array<RetryResult<T>>> {
    return Promise.all(
        fns.map(fn => retryWithBackoffDetailed(fn, options))
    );
}

/**
 * Create a retry wrapper for a function
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: RetryOptions = {}
): T {
    return ((...args: any[]) => {
        return retryWithBackoff(() => fn(...args), options);
    }) as T;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
    return DEFAULT_OPTIONS.shouldRetry(error, 1);
}

/**
 * Get retry delay for attempt number
 */
export function getRetryDelay(
    attempt: number,
    options: Partial<RetryOptions> = {}
): number {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    return Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
    );
}

export default {
    retryWithBackoff,
    retryWithBackoffDetailed,
    fetchWithRetry,
    fetchJsonWithRetry,
    retryRace,
    retryAll,
    withRetry,
    isRetryableError,
    getRetryDelay
};
