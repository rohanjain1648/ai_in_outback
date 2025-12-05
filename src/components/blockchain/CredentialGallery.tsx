import React, { useState, useEffect } from 'react';
import { BlockchainCredential } from '../../types/blockchain';
import { blockchainService } from '../../services/blockchainService';
import { CredentialBadge } from './CredentialBadge';
import { CredentialDetailModal } from './CredentialDetailModal';

export const CredentialGallery: React.FC = () => {
    const [credentials, setCredentials] = useState<BlockchainCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCredential, setSelectedCredential] = useState<BlockchainCredential | null>(null);
    const [filter, setFilter] = useState<'all' | BlockchainCredential['credentialType']>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | BlockchainCredential['status']>('all');
    const [sortBy, setSortBy] = useState<'date' | 'type' | 'status'>('date');

    useEffect(() => {
        loadCredentials();
    }, []);

    const loadCredentials = async () => {
        try {
            setLoading(true);
            const data = await blockchainService.getUserCredentials();
            setCredentials(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load credentials');
        } finally {
            setLoading(false);
        }
    };

    const filteredCredentials = credentials
        .filter((cred) => {
            const typeMatch = filter === 'all' || cred.credentialType === filter;
            const statusMatch = statusFilter === 'all' || cred.status === statusFilter;
            return typeMatch && statusMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
                case 'type':
                    return a.credentialType.localeCompare(b.credentialType);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

    const handleRetryMint = async (credentialId: string) => {
        try {
            await blockchainService.mintCredential(credentialId);
            await loadCredentials();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to mint credential');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <button
                    onClick={loadCredentials}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Credentials</h2>
                <div className="text-sm text-gray-600">
                    {filteredCredentials.length} credential{filteredCredentials.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Filters and Sorting */}
            <div className="flex flex-wrap gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="skill_verification">Skill Verification</option>
                        <option value="job_completion">Job Completion</option>
                        <option value="community_contribution">Community Contribution</option>
                        <option value="emergency_response">Emergency Response</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="minted">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                        <option value="date">Date (Newest First)</option>
                        <option value="type">Type</option>
                        <option value="status">Status</option>
                    </select>
                </div>
            </div>

            {/* Credentials Grid */}
            {filteredCredentials.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No credentials found</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Complete activities to earn blockchain-verified credentials
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredCredentials.map((credential) => (
                        <div key={credential._id} className="flex flex-col items-center">
                            <CredentialBadge
                                credential={credential}
                                size="large"
                                showDetails
                                onClick={() => setSelectedCredential(credential)}
                            />
                            {credential.status === 'failed' && (
                                <button
                                    onClick={() => handleRetryMint(credential._id)}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                    Retry Minting
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedCredential && (
                <CredentialDetailModal
                    credential={selectedCredential}
                    onClose={() => setSelectedCredential(null)}
                />
            )}
        </div>
    );
};
