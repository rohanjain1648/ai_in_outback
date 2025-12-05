/**
 * Error Logging System
 * Provides centralized error logging for debugging and monitoring
 */

export interface ErrorLog {
    id: string;
    timestamp: Date;
    error: Error | string;
    context?: Record<string, any> | undefined;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    userAgent: string;
    url: string;
    userId?: string | undefined;
}

export interface ErrorLoggerConfig {
    maxLogs?: number;
    enableConsole?: boolean;
    enableRemote?: boolean;
    remoteEndpoint?: string;
    sampleRate?: number;
}

class ErrorLogger {
    private logs: ErrorLog[] = [];
    private config: Required<ErrorLoggerConfig>;
    private listeners: Array<(log: ErrorLog) => void> = [];

    constructor(config: ErrorLoggerConfig = {}) {
        this.config = {
            maxLogs: config.maxLogs || 100,
            enableConsole: config.enableConsole !== false,
            enableRemote: config.enableRemote || false,
            remoteEndpoint: config.remoteEndpoint || '/api/errors',
            sampleRate: config.sampleRate || 1.0
        };

        this.initializeGlobalHandlers();
        this.loadLogsFromStorage();
    }

    /**
     * Initialize global error handlers
     */
    private initializeGlobalHandlers(): void {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError(event.reason, {
                type: 'unhandled-promise-rejection',
                promise: event.promise
            });
        });

        // Handle global errors
        window.addEventListener('error', (event) => {
            this.logError(event.error || event.message, {
                type: 'global-error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target && (event.target as any).tagName) {
                this.logError(`Failed to load resource: ${(event.target as any).src || (event.target as any).href}`, {
                    type: 'resource-error',
                    tagName: (event.target as any).tagName
                });
            }
        }, true);
    }

    /**
     * Log an error
     */
    logError(
        error: Error | string,
        context?: Record<string, any>
    ): void {
        // Sample rate check
        if (Math.random() > this.config.sampleRate) {
            return;
        }

        const errorLog: ErrorLog = {
            id: this.generateId(),
            timestamp: new Date(),
            error,
            context: context || undefined,
            severity: this.determineSeverity(error, context),
            type: context?.['type'] || 'unknown',
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.getUserId()
        };

        // Add to logs array
        this.logs.push(errorLog);

        // Trim logs if exceeding max
        if (this.logs.length > this.config.maxLogs) {
            this.logs = this.logs.slice(-this.config.maxLogs);
        }

        // Save to local storage
        this.saveLogsToStorage();

        // Console logging
        if (this.config.enableConsole) {
            this.logToConsole(errorLog);
        }

        // Remote logging
        if (this.config.enableRemote) {
            this.sendToRemote(errorLog);
        }

        // Notify listeners
        this.notifyListeners(errorLog);
    }

    /**
     * Log a warning
     */
    logWarning(message: string, context?: Record<string, any>): void {
        this.logError(message, {
            ...context,
            ['severity']: 'low',
            ['type']: 'warning'
        });
    }

    /**
     * Log info
     */
    logInfo(message: string, context?: Record<string, any>): void {
        if (this.config.enableConsole) {
            console.info(message, context);
        }
    }

    /**
     * Determine error severity
     */
    private determineSeverity(
        error: Error | string,
        context?: Record<string, any>
    ): 'low' | 'medium' | 'high' | 'critical' {
        if (context?.['severity']) {
            return context['severity'];
        }

        const errorMessage = typeof error === 'string' ? error : error.message;
        const lowerMessage = errorMessage.toLowerCase();

        // Critical errors
        if (
            lowerMessage.includes('security') ||
            lowerMessage.includes('authentication') ||
            lowerMessage.includes('authorization') ||
            context?.['type'] === 'security-error'
        ) {
            return 'critical';
        }

        // High severity errors
        if (
            lowerMessage.includes('database') ||
            lowerMessage.includes('payment') ||
            lowerMessage.includes('transaction') ||
            context?.['type'] === 'api-error'
        ) {
            return 'high';
        }

        // Medium severity errors
        if (
            lowerMessage.includes('network') ||
            lowerMessage.includes('timeout') ||
            lowerMessage.includes('fetch')
        ) {
            return 'medium';
        }

        // Default to low
        return 'low';
    }

    /**
     * Log to console
     */
    private logToConsole(errorLog: ErrorLog): void {
        const style = this.getConsoleStyle(errorLog.severity);

        console.group(`%c[${errorLog.severity.toUpperCase()}] ${errorLog.type}`, style);
        console.error(errorLog.error);

        if (errorLog.context) {
            console.log('Context:', errorLog.context);
        }

        console.log('Timestamp:', errorLog.timestamp.toISOString());
        console.log('URL:', errorLog.url);
        console.groupEnd();
    }

    /**
     * Get console style for severity
     */
    private getConsoleStyle(severity: string): string {
        const styles = {
            low: 'color: #3b82f6; font-weight: bold;',
            medium: 'color: #f59e0b; font-weight: bold;',
            high: 'color: #ef4444; font-weight: bold;',
            critical: 'color: #dc2626; font-weight: bold; background: #fee2e2; padding: 2px 4px;'
        };
        return styles[severity as keyof typeof styles] || styles.low;
    }

    /**
     * Send error to remote endpoint
     */
    private async sendToRemote(errorLog: ErrorLog): Promise<void> {
        try {
            const payload = {
                ...errorLog,
                error: typeof errorLog.error === 'string'
                    ? errorLog.error
                    : {
                        message: errorLog.error.message,
                        stack: errorLog.error.stack,
                        name: errorLog.error.name
                    }
            };

            await fetch(this.config.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            // Silently fail remote logging to avoid infinite loops
            console.warn('Failed to send error to remote endpoint:', error);
        }
    }

    /**
     * Get all logs
     */
    getLogs(): ErrorLog[] {
        return [...this.logs];
    }

    /**
     * Get logs by severity
     */
    getLogsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): ErrorLog[] {
        return this.logs.filter(log => log.severity === severity);
    }

    /**
     * Get logs by type
     */
    getLogsByType(type: string): ErrorLog[] {
        return this.logs.filter(log => log.type === type);
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.logs = [];
        this.saveLogsToStorage();
    }

    /**
     * Export logs as JSON
     */
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Add error listener
     */
    addListener(listener: (log: ErrorLog) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify listeners
     */
    private notifyListeners(log: ErrorLog): void {
        this.listeners.forEach(listener => {
            try {
                listener(log);
            } catch (error) {
                console.error('Error in error logger listener:', error);
            }
        });
    }

    /**
     * Save logs to local storage
     */
    private saveLogsToStorage(): void {
        try {
            const logsToSave = this.logs.slice(-50); // Only save last 50 logs
            localStorage.setItem('error-logs', JSON.stringify(logsToSave));
        } catch (error) {
            console.warn('Failed to save error logs to storage:', error);
        }
    }

    /**
     * Load logs from local storage
     */
    private loadLogsFromStorage(): void {
        try {
            const stored = localStorage.getItem('error-logs');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.logs = parsed.map((log: any) => ({
                    ...log,
                    timestamp: new Date(log.timestamp)
                }));
            }
        } catch (error) {
            console.warn('Failed to load error logs from storage:', error);
        }
    }

    /**
     * Get user ID from storage
     */
    private getUserId(): string | undefined {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const parsed = JSON.parse(user);
                return parsed.id || parsed._id || undefined;
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get error statistics
     */
    getStatistics(): {
        total: number;
        bySeverity: Record<string, number>;
        byType: Record<string, number>;
        recentErrors: number;
    } {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        const bySeverity: Record<string, number> = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };

        const byType: Record<string, number> = {};

        let recentErrors = 0;

        this.logs.forEach(log => {
            bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
            byType[log.type] = (byType[log.type] || 0) + 1;

            if (log.timestamp.getTime() > oneHourAgo) {
                recentErrors++;
            }
        });

        return {
            total: this.logs.length,
            bySeverity,
            byType,
            recentErrors
        };
    }
}

// Create singleton instance
const errorLogger = new ErrorLogger({
    enableConsole: import.meta.env.MODE === 'development',
    enableRemote: import.meta.env.MODE === 'production',
    maxLogs: 100,
    sampleRate: 1.0
});

// Export convenience functions
export const logError = (error: Error | string, context?: Record<string, any>) => {
    errorLogger.logError(error, context);
};

export const logWarning = (message: string, context?: Record<string, any>) => {
    errorLogger.logWarning(message, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
    errorLogger.logInfo(message, context);
};

export const getErrorLogs = () => errorLogger.getLogs();
export const clearErrorLogs = () => errorLogger.clearLogs();
export const exportErrorLogs = () => errorLogger.exportLogs();
export const getErrorStatistics = () => errorLogger.getStatistics();
export const addErrorListener = (listener: (log: ErrorLog) => void) =>
    errorLogger.addListener(listener);

export default errorLogger;
