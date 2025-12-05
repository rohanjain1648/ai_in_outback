import React, { useState, useEffect } from 'react';
import { blockchainService } from '../../services/blockchainService';
import { BlockchainStatus } from '../../types/blockchain';
import { CredentialGallery } from './CredentialGallery';

/**
 * Demo component showing blockchain credential functionality
 * This can be integrated into user profiles or achievement pages
 */
export const BlockchainDemo: React.FC = () => {
    const [status, setStatus] = useState<BlockchainStatus | null>(null);
    const [issuing, setIssuing] = useState(false);
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const data = await blockchainService.getStatus();
            setStatus(data);
        } catch (err) {
            console.error('Failed to load blockchain status:', err);
        }
    };

    const handleIssueTestCredential = async () => {
        setIssuing(true);
        try {
            await blockchainService.issueCredential('skill_verification', {
                title: 'Test Credential',
                description: 'This is a test blockchain credential',
                attributes: [
                    { trait_type: 'skill', value: 'testing' },
                    { trait_type: 'level', value: 'beginner' },
                ],
            });
            alert('Credential issued successfully!');
            await loadStatus();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to issue credential');
        } finally {
            setIssuing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold mb-4">Blockchain Trust System</h1>
                <p className="text-gray-600 mb-6">
                    Earn blockchain-verified credentials for your achievements and contributions.
                    These credentials are tamper-proof and can be verified by anyone.
                </p>

                {/* Status Card */}
                {status && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-900">Blockchain Status</h3>
                                <p className="text-sm text-blue-700">
                                    {status.isAvailable ? '✓ Connected' : '⚠ Offline Mode'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-900">{status.pendingCount}</p>
                                <p className="text-sm text-blue-700">Pending</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={handleIssueTestCredential}
                        disabled={issuing}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                    >
                        {issuing ? 'Issuing...' : 'Issue Test Credential'}
                    </button>
                    <button
                        onClick={() => setShowGallery(!showGallery)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold"
                    >
                        {showGallery ? 'Hide Gallery' : 'View My Credentials'}
                    </button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">🎓 Skill Verification</h4>
                        <p className="text-sm text-green-700">
                            Earn credentials when your skills are verified by the community or through completed jobs.
                        </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">✅ Job Completion</h4>
                        <p className="text-sm text-purple-700">
                            Receive blockchain badges for successfully completed gig jobs with positive ratings.
                        </p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">🤝 Community Contribution</h4>
                        <p className="text-sm text-orange-700">
                            Get recognized for helping others and contributing to the community.
                        </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">🚨 Emergency Response</h4>
                        <p className="text-sm text-red-700">
                            Earn credentials for participating in emergency response and helping during crises.
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Why Blockchain Credentials?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                            <span className="mr-2">🔒</span>
                            <span><strong>Tamper-Proof:</strong> Once issued, credentials cannot be altered or faked</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">✓</span>
                            <span><strong>Verifiable:</strong> Anyone can verify your credentials on the blockchain</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">🌐</span>
                            <span><strong>Portable:</strong> Your credentials belong to you and can be shared anywhere</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">📱</span>
                            <span><strong>Offline Support:</strong> Works even when blockchain is temporarily unavailable</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Credential Gallery */}
            {showGallery && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <CredentialGallery />
                </div>
            )}
        </div>
    );
};
