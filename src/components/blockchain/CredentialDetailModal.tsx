import React, { useState } from 'react';
import { BlockchainCredential, VerificationResult } from '../../types/blockchain';
import { blockchainService } from '../../services/blockchainService';

interface CredentialDetailModalProps {
    credential: BlockchainCredential;
    onClose: () => void;
}

export const CredentialDetailModal: React.FC<CredentialDetailModalProps> = ({
    credential,
    onClose,
}) => {
    const [verification, setVerification] = useState<VerificationResult | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleVerify = async () => {
        setVerifying(true);
        try {
            const result = await blockchainService.verifyCredential(credential._id);
            setVerification(result);
        } catch (err) {
            console.error('Verification failed:', err);
        } finally {
            setVerifying(false);
        }
    };

    const handleShare = async (platform?: 'twitter' | 'facebook' | 'linkedin') => {
        const shareLink = blockchainService.generateShareLink(credential._id);
        const shareText = `I just earned a blockchain-verified credential: ${credential.metadata.title}! 🎉`;

        if (platform) {
            let shareUrl = '';
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareLink)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
                    break;
            }
            window.open(shareUrl, '_blank', 'width=600,height=400');
        } else {
            // Copy to clipboard
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        const data = JSON.stringify(credential, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credential-${credential._id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const statusInfo = blockchainService.getStatusInfo(credential.status);
    const typeLabel = blockchainService.getCredentialTypeLabel(credential.credentialType);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Credential Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Badge Display */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-blue-500 bg-blue-50 flex items-center justify-center shadow-lg">
                                {credential.metadata.imageUrl ? (
                                    <img
                                        src={credential.metadata.imageUrl}
                                        alt={credential.metadata.title}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-6xl">🏆</span>
                                )}
                            </div>
                            {credential.status === 'minted' && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Verified on Blockchain
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-2xl font-bold text-center">{credential.metadata.title}</h3>
                            <p className="text-center text-gray-600 mt-1">{typeLabel}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700">{credential.metadata.description}</p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color === 'green'
                                    ? 'bg-green-100 text-green-800'
                                    : statusInfo.color === 'yellow'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* Attributes */}
                    {credential.metadata.attributes.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Attributes</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {credential.metadata.attributes.map((attr, index) => (
                                    <div key={index} className="bg-gray-50 rounded p-2">
                                        <div className="text-xs text-gray-600">{attr.trait_type}</div>
                                        <div className="font-medium">{attr.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Blockchain Info */}
                    {credential.status === 'minted' && (
                        <div className="border-t pt-4 space-y-2">
                            <h4 className="font-semibold">Blockchain Information</h4>

                            {credential.nftTokenId && (
                                <div className="text-sm">
                                    <span className="text-gray-600">Token ID:</span>
                                    <span className="ml-2 font-mono">{credential.nftTokenId}</span>
                                </div>
                            )}

                            {credential.blockchainTxHash && (
                                <div className="text-sm">
                                    <span className="text-gray-600">Transaction:</span>
                                    <a
                                        href={blockchainService.getExplorerLink(credential.blockchainTxHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 hover:text-blue-800 underline font-mono text-xs"
                                    >
                                        {credential.blockchainTxHash.substring(0, 10)}...
                                        {credential.blockchainTxHash.substring(credential.blockchainTxHash.length - 8)}
                                    </a>
                                </div>
                            )}

                            {credential.ipfsHash && (
                                <div className="text-sm">
                                    <span className="text-gray-600">IPFS:</span>
                                    <span className="ml-2 font-mono text-xs">{credential.ipfsHash}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Verification */}
                    {credential.status === 'minted' && (
                        <div className="border-t pt-4">
                            <button
                                onClick={handleVerify}
                                disabled={verifying}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {verifying ? 'Verifying...' : 'Verify on Blockchain'}
                            </button>

                            {verification && (
                                <div
                                    className={`mt-3 p-3 rounded-lg ${verification.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                        }`}
                                >
                                    <p
                                        className={`font-semibold ${verification.isValid ? 'text-green-800' : 'text-red-800'
                                            }`}
                                    >
                                        {verification.isValid ? '✓ Credential Verified' : '✗ Verification Failed'}
                                    </p>
                                    {verification.error && (
                                        <p className="text-sm text-gray-600 mt-1">{verification.error}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="border-t pt-4 space-y-3">
                        {/* Social Media Sharing */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Share on Social Media
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="flex-1 bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 text-sm font-semibold"
                                >
                                    🐦 Twitter
                                </button>
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                                >
                                    📘 Facebook
                                </button>
                                <button
                                    onClick={() => handleShare('linkedin')}
                                    className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 text-sm font-semibold"
                                >
                                    💼 LinkedIn
                                </button>
                            </div>
                        </div>

                        {/* Other Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleShare()}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                            >
                                {copied ? '✓ Copied!' : '📋 Copy Link'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                            >
                                💾 Download
                            </button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 text-center">
                        Issued: {new Date(credential.issuedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};
