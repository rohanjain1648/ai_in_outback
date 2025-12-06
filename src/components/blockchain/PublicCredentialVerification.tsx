import React, { useState, useEffect } from 'react';
import { BlockchainCredential, VerificationResult } from '../../types/blockchain';
import { blockchainService } from '../../services/blockchainService';
import { CredentialBadge } from './CredentialBadge';

interface PublicCredentialVerificationProps {
    credentialId?: string;
}

export const PublicCredentialVerification: React.FC<PublicCredentialVerificationProps> = ({
    credentialId: propCredentialId
}) => {
    // Get credential ID from props or URL path
    const getCredentialIdFromUrl = () => {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    };

    const credentialId = propCredentialId || getCredentialIdFromUrl();
    const [credential, setCredential] = useState<BlockchainCredential | null>(null);
    const [verification, setVerification] = useState<VerificationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (credentialId) {
            loadCredential();
        }
    }, [credentialId]);

    const loadCredential = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await blockchainService.getCredential(credentialId!);
            setCredential(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load credential');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!credentialId) return;

        setVerifying(true);
        try {
            const result = await blockchainService.verifyCredential(credentialId);
            setVerification(result);
        } catch (err) {
            console.error('Verification failed:', err);
            setVerification({
                isValid: false,
                error: 'Verification failed. Please try again.',
            });
        } finally {
            setVerifying(false);
        }
    };

    const handleShare = () => {
        const shareLink = window.location.href;
        navigator.clipboard.writeText(shareLink);
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-center text-gray-600 mt-4">Loading credential...</p>
                </div>
            </div>
        );
    }

    if (error || !credential) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Credential Not Found</h2>
                        <p className="text-gray-600 mb-6">
                            {error || 'The credential you are looking for does not exist or has been removed.'}
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusInfo = blockchainService.getStatusInfo(credential.status);
    const typeLabel = blockchainService.getCredentialTypeLabel(credential.credentialType);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Blockchain Credential Verification
                    </h1>
                    <p className="text-gray-600">
                        Verify the authenticity of this credential on the blockchain
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    {/* Badge Display */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-12">
                        <div className="flex justify-center mb-6">
                            <CredentialBadge credential={credential} size="large" />
                        </div>
                        <h2 className="text-3xl font-bold text-white text-center mb-2">
                            {credential.metadata.title}
                        </h2>
                        <p className="text-blue-100 text-center text-lg">{typeLabel}</p>
                    </div>

                    {/* Details */}
                    <div className="p-8 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700">{credential.metadata.description}</p>
                        </div>

                        {/* Status */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
                            <span
                                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color === 'green'
                                    ? 'bg-green-100 text-green-800'
                                    : statusInfo.color === 'yellow'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {statusInfo.label}
                            </span>
                        </div>

                        {/* Attributes */}
                        {credential.metadata.attributes.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Attributes</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {credential.metadata.attributes.map((attr, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="text-xs text-gray-600 mb-1">{attr.trait_type}</div>
                                            <div className="font-medium text-gray-900">{attr.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Blockchain Information */}
                        {credential.status === 'minted' && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Blockchain Information
                                </h3>
                                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                                    {credential.nftTokenId && (
                                        <div>
                                            <span className="text-sm text-gray-600">Token ID:</span>
                                            <div className="font-mono text-sm mt-1 break-all">
                                                {credential.nftTokenId}
                                            </div>
                                        </div>
                                    )}

                                    {credential.blockchainTxHash && (
                                        <div>
                                            <span className="text-sm text-gray-600">Transaction Hash:</span>
                                            <div className="mt-1">
                                                <a
                                                    href={blockchainService.getExplorerLink(
                                                        credential.blockchainTxHash
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline font-mono text-sm break-all"
                                                >
                                                    {credential.blockchainTxHash}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {credential.ipfsHash && (
                                        <div>
                                            <span className="text-sm text-gray-600">IPFS Hash:</span>
                                            <div className="font-mono text-sm mt-1 break-all">
                                                {credential.ipfsHash}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-sm text-gray-600">Issued:</span>
                                        <div className="text-sm mt-1">
                                            {new Date(credential.issuedAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Section */}
                        {credential.status === 'minted' && (
                            <div className="border-t pt-6">
                                <button
                                    onClick={handleVerify}
                                    disabled={verifying}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
                                >
                                    {verifying ? 'Verifying on Blockchain...' : '🔍 Verify on Blockchain'}
                                </button>

                                {verification && (
                                    <div
                                        className={`mt-4 p-4 rounded-lg border-2 ${verification.isValid
                                            ? 'bg-green-50 border-green-500'
                                            : 'bg-red-50 border-red-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">
                                                {verification.isValid ? '✅' : '❌'}
                                            </div>
                                            <div className="flex-1">
                                                <p
                                                    className={`font-bold text-lg ${verification.isValid
                                                        ? 'text-green-800'
                                                        : 'text-red-800'
                                                        }`}
                                                >
                                                    {verification.isValid
                                                        ? 'Credential Verified!'
                                                        : 'Verification Failed'}
                                                </p>
                                                <p
                                                    className={`text-sm ${verification.isValid
                                                        ? 'text-green-700'
                                                        : 'text-red-700'
                                                        }`}
                                                >
                                                    {verification.isValid
                                                        ? 'This credential is authentic and has been verified on the blockchain.'
                                                        : verification.error ||
                                                        'This credential could not be verified.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="border-t pt-6 flex gap-3">
                            <button
                                onClick={handleShare}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
                            >
                                📤 Share Link
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
                            >
                                🖨️ Print
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-600 text-sm">
                    <p>
                        Powered by Rural Connect AI • Blockchain-verified credentials on Polygon Network
                    </p>
                </div>
            </div>
        </div>
    );
};
