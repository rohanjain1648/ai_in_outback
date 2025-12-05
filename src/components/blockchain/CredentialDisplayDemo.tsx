import React, { useState } from 'react';
import { BlockchainCredential } from '../../types/blockchain';
import { CredentialBadge } from './CredentialBadge';
import { CredentialGallery } from './CredentialGallery';
import { CredentialAchievementNotification } from './CredentialAchievementNotification';
import { CredentialDetailModal } from './CredentialDetailModal';

/**
 * Demo component showcasing all blockchain credential display features
 * This demonstrates the complete credential display system including:
 * - Badge display in various sizes
 * - Achievement notifications with celebrations
 * - Detailed credential modal
 * - Gallery with filtering and sorting
 */
export const CredentialDisplayDemo: React.FC = () => {
    const [showAchievement, setShowAchievement] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState<BlockchainCredential | null>(null);

    // Sample credential data
    const sampleCredential: BlockchainCredential = {
        _id: 'demo_credential_1',
        userId: 'demo_user',
        credentialType: 'skill_verification',
        nftTokenId: '12345',
        blockchainTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        metadata: {
            title: 'Advanced Agricultural Skills',
            description: 'Verified expertise in sustainable farming practices and crop management',
            imageUrl: '',
            attributes: [
                { trait_type: 'Skill Level', value: 'Expert' },
                { trait_type: 'Category', value: 'Agriculture' },
                { trait_type: 'Verified By', value: 'Rural Connect AI' },
                { trait_type: 'Issue Date', value: new Date().toLocaleDateString() },
            ],
        },
        issuedAt: new Date().toISOString(),
        ipfsHash: 'QmX1234567890abcdef',
        status: 'minted',
        retryCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const sampleCredentials: BlockchainCredential[] = [
        sampleCredential,
        {
            ...sampleCredential,
            _id: 'demo_credential_2',
            credentialType: 'job_completion',
            metadata: {
                ...sampleCredential.metadata,
                title: 'Community Project Completion',
                description: 'Successfully completed a community infrastructure project',
            },
        },
        {
            ...sampleCredential,
            _id: 'demo_credential_3',
            credentialType: 'community_contribution',
            status: 'pending',
            metadata: {
                ...sampleCredential.metadata,
                title: 'Community Leadership',
                description: 'Active contribution to community development initiatives',
            },
        },
        {
            ...sampleCredential,
            _id: 'demo_credential_4',
            credentialType: 'emergency_response',
            metadata: {
                ...sampleCredential.metadata,
                title: 'Emergency Response Hero',
                description: 'Provided critical assistance during emergency situation',
            },
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Blockchain Credential Display Demo
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Explore all credential display features and interactions
                    </p>
                </div>

                {/* Badge Sizes Demo */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        1. Credential Badge Sizes
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Badges can be displayed in three sizes: small, medium, and large
                    </p>
                    <div className="flex items-end justify-center gap-8">
                        <div className="text-center">
                            <CredentialBadge credential={sampleCredential} size="small" showDetails />
                            <p className="text-sm text-gray-600 mt-2">Small</p>
                        </div>
                        <div className="text-center">
                            <CredentialBadge credential={sampleCredential} size="medium" showDetails />
                            <p className="text-sm text-gray-600 mt-2">Medium</p>
                        </div>
                        <div className="text-center">
                            <CredentialBadge credential={sampleCredential} size="large" showDetails />
                            <p className="text-sm text-gray-600 mt-2">Large</p>
                        </div>
                    </div>
                </div>

                {/* Credential Types Demo */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        2. Credential Types
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Different credential types with unique icons and styling
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {sampleCredentials.map((cred) => (
                            <div
                                key={cred._id}
                                className="text-center cursor-pointer"
                                onClick={() => setSelectedCredential(cred)}
                            >
                                <CredentialBadge credential={cred} size="large" showDetails />
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 text-center mt-4">
                        Click any badge to view details
                    </p>
                </div>

                {/* Achievement Notification Demo */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        3. Achievement Notification
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Celebration notification with confetti and animations when earning a credential
                    </p>
                    <button
                        onClick={() => setShowAchievement(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold text-lg transition-all transform hover:scale-105"
                    >
                        🎉 Trigger Achievement Notification
                    </button>
                </div>

                {/* Gallery Demo */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        4. Credential Gallery
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Full gallery with filtering, sorting, and credential management
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <p className="text-center text-gray-500 mb-4">
                            Note: This demo uses mock data. In production, this connects to your actual
                            credentials.
                        </p>
                        <CredentialGallery />
                    </div>
                </div>

                {/* Public Verification Demo */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        5. Public Verification Page
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Public page for verifying credentials without authentication
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-700">Example URL:</span>
                            <code className="block mt-1 text-sm bg-white p-2 rounded border">
                                {window.location.origin}/credentials/demo_credential_1
                            </code>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-700">Features:</span>
                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                <li>✓ No authentication required</li>
                                <li>✓ Blockchain verification button</li>
                                <li>✓ Transaction hash links to explorer</li>
                                <li>✓ Share and print functionality</li>
                                <li>✓ Mobile responsive design</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Sharing Features Demo */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        6. Sharing Features
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Multiple ways to share credentials
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Social Media</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>• Twitter with pre-filled text</li>
                                <li>• Facebook sharing</li>
                                <li>• LinkedIn professional network</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Other Options</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>• Copy link to clipboard</li>
                                <li>• Download as JSON</li>
                                <li>• Print credential</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Integration Info */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                    <h2 className="text-2xl font-bold mb-4">Integration Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Components</h3>
                            <ul className="space-y-1 text-sm text-blue-100">
                                <li>• CredentialBadge</li>
                                <li>• CredentialGallery</li>
                                <li>• CredentialDetailModal</li>
                                <li>• PublicCredentialVerification</li>
                                <li>• CredentialAchievementNotification</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Features</h3>
                            <ul className="space-y-1 text-sm text-blue-100">
                                <li>• Real-time socket notifications</li>
                                <li>• Blockchain verification</li>
                                <li>• Social media sharing</li>
                                <li>• Filtering and sorting</li>
                                <li>• Mobile responsive</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAchievement && (
                <CredentialAchievementNotification
                    credential={sampleCredential}
                    onClose={() => setShowAchievement(false)}
                />
            )}

            {selectedCredential && (
                <CredentialDetailModal
                    credential={selectedCredential}
                    onClose={() => setSelectedCredential(null)}
                />
            )}
        </div>
    );
};
