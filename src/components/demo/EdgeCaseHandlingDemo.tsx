import React, { useState } from 'react';
import { ManualLocationEntry } from '../location/ManualLocationEntry';
import { NetworkStatusIndicator, useNetworkStatus } from '../common/NetworkStatusIndicator';
import {
    getCapabilities,
    isBrowserSupported,
    getBrowserInfo
} from '../../utils/featureDetection';
import {
    getErrorLogs,
    getErrorStatistics,
    clearErrorLogs,
    logError,
    logWarning
} from '../../utils/errorLogger';
import { retryWithBackoff } from '../../utils/retryLogic';
import { validateForm, ValidationRule } from '../../utils/inputValidation';
import { Coordinates } from '../../types/location';

/**
 * Edge Case Handling Demo Component
 * Demonstrates all edge case and error handling features
 */
export const EdgeCaseHandlingDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'location' | 'network' | 'browser' | 'errors' | 'retry' | 'validation'>('location');
    const [showLocationEntry, setShowLocationEntry] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
    const [errorLogs, setErrorLogs] = useState(getErrorLogs());
    const [retryResult, setRetryResult] = useState<string>('');
    const [validationResult, setValidationResult] = useState<any>(null);

    const networkStatus = useNetworkStatus();
    const capabilities = getCapabilities();
    const browserSupport = isBrowserSupported();
    const browserInfo = getBrowserInfo();
    const errorStats = getErrorStatistics();

    const handleLocationSet = (coords: Coordinates, name?: string) => {
        setSelectedLocation(coords);
        setShowLocationEntry(false);
        alert(`Location set: ${name || 'Custom coordinates'}\nLat: ${coords.latitude}, Lng: ${coords.longitude}`);
    };

    const handleTestError = () => {
        logError(new Error('Test error from demo'), {
            type: 'demo-error',
            severity: 'medium'
        });
        setErrorLogs(getErrorLogs());
    };

    const handleTestWarning = () => {
        logWarning('Test warning from demo', {
            type: 'demo-warning'
        });
        setErrorLogs(getErrorLogs());
    };

    const handleClearLogs = () => {
        clearErrorLogs();
        setErrorLogs([]);
    };

    const handleTestRetry = async () => {
        setRetryResult('Testing retry logic...');

        let attemptCount = 0;
        try {
            await retryWithBackoff(
                async () => {
                    attemptCount++;
                    if (attemptCount < 3) {
                        throw new Error('Simulated failure');
                    }
                    return 'Success!';
                },
                {
                    maxAttempts: 5,
                    initialDelay: 500,
                    onRetry: (_error, attempt, delay) => {
                        setRetryResult(prev =>
                            `${prev}\nAttempt ${attempt} failed. Retrying in ${Math.round(delay)}ms...`
                        );
                    }
                }
            );
            setRetryResult(prev => `${prev}\n✓ Operation succeeded after ${attemptCount} attempts`);
        } catch {
            setRetryResult(prev => `${prev}\n✗ Operation failed after all retries`);
        }
    };

    const handleTestValidation = () => {
        const testData = {
            email: 'test@example.com',
            phone: '0412345678',
            postcode: '2000',
            name: '  John Doe  ',
            age: '25'
        };

        const rules: Record<string, ValidationRule> = {
            email: { required: true, email: true },
            phone: { required: true, phone: true },
            postcode: { required: true, postcode: true },
            name: { required: true, minLength: 2, maxLength: 50 },
            age: { required: true, min: 18, max: 120 }
        };

        const result = validateForm(testData, rules);
        setValidationResult(result);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <NetworkStatusIndicator position="top" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Edge Case & Error Handling Demo
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Comprehensive demonstration of error handling, validation, and graceful degradation
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-4">
                        {[
                            { id: 'location', label: 'Manual Location' },
                            { id: 'network', label: 'Network Status' },
                            { id: 'browser', label: 'Browser Support' },
                            { id: 'errors', label: 'Error Logging' },
                            { id: 'retry', label: 'Retry Logic' },
                            { id: 'validation', label: 'Validation' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    {activeTab === 'location' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                Manual Location Entry
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                When GPS is unavailable, users can manually set their location by choosing from preset locations or entering coordinates.
                            </p>

                            {!showLocationEntry ? (
                                <div>
                                    <button
                                        onClick={() => setShowLocationEntry(true)}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Open Location Entry
                                    </button>

                                    {selectedLocation && (
                                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <p className="text-green-800 dark:text-green-300">
                                                <strong>Current Location:</strong><br />
                                                Latitude: {selectedLocation.latitude.toFixed(4)}<br />
                                                Longitude: {selectedLocation.longitude.toFixed(4)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <ManualLocationEntry
                                    onLocationSet={handleLocationSet}
                                    onCancel={() => setShowLocationEntry(false)}
                                    {...(selectedLocation && { initialCoordinates: selectedLocation })}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'network' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                Network Status Detection
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Real-time network status monitoring with connection quality detection.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Current Status</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Online:</span>
                                            <span className={`ml-2 font-medium ${networkStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                                {networkStatus.isOnline ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Connection Type:</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                {networkStatus.effectiveType || 'Unknown'}
                                            </span>
                                        </div>
                                        {networkStatus.downlink && (
                                            <div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Downlink:</span>
                                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                    {networkStatus.downlink} Mbps
                                                </span>
                                            </div>
                                        )}
                                        {networkStatus.rtt && (
                                            <div>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">RTT:</span>
                                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                    {networkStatus.rtt} ms
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        The network status indicator at the top of the page shows real-time connection status.
                                        Try disconnecting your internet to see it in action!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'browser' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                Browser Feature Detection
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Automatic detection of browser capabilities with graceful degradation.
                            </p>

                            <div className="space-y-6">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Browser Information</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{browserInfo.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Version:</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{browserInfo.version}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{browserInfo.platform}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Mobile:</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                {browserInfo.mobile ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-lg ${browserSupport.supported
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                    }`}>
                                    <h3 className={`font-semibold mb-2 ${browserSupport.supported ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                                        }`}>
                                        Browser Support: {browserSupport.supported ? 'Fully Supported' : 'Limited Support'}
                                    </h3>
                                    {browserSupport.issues.length > 0 && (
                                        <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 mb-2">
                                            {browserSupport.issues.map((issue, i) => (
                                                <li key={i}>{issue}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {browserSupport.warnings.length > 0 && (
                                        <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400">
                                            {browserSupport.warnings.map((warning, i) => (
                                                <li key={i}>{warning}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Feature Support</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                        {Object.entries(capabilities).map(([feature, supported]) => (
                                            <div key={feature} className="flex items-center">
                                                <span className={`mr-2 ${supported ? 'text-green-600' : 'text-red-600'}`}>
                                                    {supported ? '✓' : '✗'}
                                                </span>
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'errors' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                Error Logging System
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Centralized error logging with severity levels and detailed context.
                            </p>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleTestError}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Test Error
                                    </button>
                                    <button
                                        onClick={handleTestWarning}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Test Warning
                                    </button>
                                    <button
                                        onClick={handleClearLogs}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Clear Logs
                                    </button>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Statistics</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{errorStats.total}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Critical:</span>
                                            <span className="ml-2 font-medium text-red-600">{errorStats.bySeverity['critical']}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">High:</span>
                                            <span className="ml-2 font-medium text-orange-600">{errorStats.bySeverity['high']}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Recent (1h):</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{errorStats.recentErrors}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-h-96 overflow-y-auto">
                                    {errorLogs.length === 0 ? (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                            No errors logged yet
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {errorLogs.slice().reverse().map(log => (
                                                <div
                                                    key={log.id}
                                                    className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${log.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                    log.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                        log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                                    }`}>
                                                                    {log.severity}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">{log.type}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {typeof log.error === 'string' ? log.error : log.error.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'retry' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                Retry Logic with Exponential Backoff
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Automatic retry for failed operations with intelligent backoff strategy.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={handleTestRetry}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Test Retry Logic
                                </button>

                                {retryResult && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
                                            {retryResult}
                                        </pre>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">How it works:</h3>
                                    <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                        <li>Automatically retries failed operations</li>
                                        <li>Uses exponential backoff (1s, 2s, 4s, 8s...)</li>
                                        <li>Adds random jitter to prevent thundering herd</li>
                                        <li>Configurable max attempts and delays</li>
                                        <li>Smart detection of retryable errors</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'validation' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                Input Validation & Sanitization
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Comprehensive validation and sanitization for all form inputs.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={handleTestValidation}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Test Validation
                                </button>

                                {validationResult && (
                                    <div className="space-y-4">
                                        <div className={`p-4 rounded-lg ${validationResult.isValid
                                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                            }`}>
                                            <h3 className={`font-semibold mb-2 ${validationResult.isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                                                }`}>
                                                Validation Result: {validationResult.isValid ? 'Valid' : 'Invalid'}
                                            </h3>
                                            {!validationResult.isValid && (
                                                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400">
                                                    {Object.entries(validationResult.errors).map(([field, errors]: [string, any]) => (
                                                        <li key={field}>
                                                            <strong>{field}:</strong> {errors.join(', ')}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Sanitized Data:</h3>
                                            <pre className="text-sm text-gray-900 dark:text-white overflow-x-auto">
                                                {JSON.stringify(validationResult.sanitizedData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">Supported Validations:</h3>
                                    <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                        <li>Email addresses</li>
                                        <li>Australian phone numbers</li>
                                        <li>Australian postcodes</li>
                                        <li>URLs</li>
                                        <li>Coordinates</li>
                                        <li>String length and patterns</li>
                                        <li>Number ranges</li>
                                        <li>Custom validation rules</li>
                                        <li>XSS and SQL injection detection</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EdgeCaseHandlingDemo;
