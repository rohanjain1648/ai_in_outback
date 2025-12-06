import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../../utils/errorLogger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetKeys?: any[];
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Comprehensive Error Boundary with user-friendly messages
 * Catches React component errors and provides graceful fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error
        };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to error logging service
        logError(error, {
            componentStack: errorInfo.componentStack,
            type: 'react-error-boundary'
        });

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // Update state with error info
        this.setState({
            errorInfo
        });
    }

    override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
        // Reset error boundary when resetKeys change
        if (this.state.hasError && this.props.resetKeys) {
            const hasResetKeyChanged = this.props.resetKeys.some(
                (key, index) => key !== prevProps.resetKeys?.[index]
            );

            if (hasResetKeyChanged) {
                this.reset();
            }
        }
    }

    reset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    override render(): ReactNode {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                if (typeof this.props.fallback === 'function') {
                    return this.props.fallback(this.state.error, this.state.errorInfo!);
                }
                return this.props.fallback;
            }

            // Default error UI
            return (
                <DefaultErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    onReset={this.reset}
                />
            );
        }

        return this.props.children;
    }
}

interface DefaultErrorFallbackProps {
    error: Error;
    errorInfo: ErrorInfo | null;
    onReset: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
    error,
    errorInfo,
    onReset
}) => {
    const [showDetails, setShowDetails] = React.useState(false);

    const getUserFriendlyMessage = (error: Error): string => {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch')) {
            return 'Unable to connect to the server. Please check your internet connection and try again.';
        }

        if (message.includes('timeout')) {
            return 'The request took too long to complete. Please try again.';
        }

        if (message.includes('permission') || message.includes('denied')) {
            return 'You don\'t have permission to access this resource.';
        }

        if (message.includes('not found') || message.includes('404')) {
            return 'The requested resource could not be found.';
        }

        if (message.includes('unauthorized') || message.includes('401')) {
            return 'Your session has expired. Please log in again.';
        }

        if (message.includes('chunk')) {
            return 'Failed to load part of the application. Please refresh the page.';
        }

        return 'Something went wrong. We\'re working to fix the issue.';
    };

    const handleReload = (): void => {
        window.location.reload();
    };

    const handleGoHome = (): void => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Error Title */}
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
                    Oops! Something Went Wrong
                </h1>

                {/* User-friendly message */}
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    {getUserFriendlyMessage(error)}
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <button
                        onClick={onReset}
                        className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={handleReload}
                        className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={handleGoHome}
                        className="flex-1 py-3 px-6 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Go Home
                    </button>
                </div>

                {/* Technical details toggle */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center justify-between w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <span>Technical Details</span>
                        <svg
                            className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {showDetails && (
                        <div className="mt-4 space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Error Message:
                                </h3>
                                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto text-red-600 dark:text-red-400">
                                    {error.toString()}
                                </pre>
                            </div>

                            {errorInfo?.componentStack && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Component Stack:
                                    </h3>
                                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto text-gray-700 dark:text-gray-300 max-h-48 overflow-y-auto">
                                        {errorInfo.componentStack}
                                    </pre>
                                </div>
                            )}

                            {error.stack && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Stack Trace:
                                    </h3>
                                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto text-gray-700 dark:text-gray-300 max-h-48 overflow-y-auto">
                                        {error.stack}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Help text */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-6">
                    If this problem persists, please contact support with the error details above.
                </p>
            </div>
        </div>
    );
};

export default ErrorBoundary;
