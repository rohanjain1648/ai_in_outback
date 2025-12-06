import React from 'react';
import { ServiceNavigator } from './ServiceNavigator';

/**
 * Demo component showing how to integrate the Service Navigator
 * 
 * This can be used as a standalone page or integrated into the main dashboard
 */
export const ServiceNavigatorDemo: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Rural Services Directory
                    </h1>
                    <p className="text-lg text-gray-600">
                        Find essential services in your area including health, transport, emergency, and government services.
                    </p>
                </div>

                {/* Service Navigator Component */}
                <ServiceNavigator
                    enableVoiceSearch={true}
                />

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-blue-900 mb-3">
                        How to Use
                    </h2>
                    <div className="space-y-2 text-blue-800">
                        <p>
                            <strong>Search:</strong> Type keywords or use voice search to find services
                        </p>
                        <p>
                            <strong>Filter:</strong> Use category buttons and filters to narrow results
                        </p>
                        <p>
                            <strong>View Details:</strong> Click on any service card to see full information
                        </p>
                        <p>
                            <strong>Offline Mode:</strong> Essential services are cached for offline access
                        </p>
                        <p>
                            <strong>Low Data Mode:</strong> Toggle to reduce data usage
                        </p>
                    </div>
                </div>

                {/* Voice Commands Help */}
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-green-900 mb-3">
                        Voice Commands
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-green-800">
                        <div>
                            <p className="font-medium">Search Examples:</p>
                            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                                <li>"Search for health services"</li>
                                <li>"Find transport near me"</li>
                                <li>"Show emergency services"</li>
                                <li>"Look for government services"</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium">Tips:</p>
                            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                                <li>Speak clearly and naturally</li>
                                <li>Wait for the microphone indicator</li>
                                <li>Use specific service names</li>
                                <li>Include your location if needed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceNavigatorDemo;
