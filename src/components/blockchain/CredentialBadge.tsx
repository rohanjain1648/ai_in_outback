import React from 'react';
import { BlockchainCredential } from '../../types/blockchain';
import { blockchainService } from '../../services/blockchainService';

interface CredentialBadgeProps {
    credential: BlockchainCredential;
    size?: 'small' | 'medium' | 'large';
    showDetails?: boolean;
    onClick?: () => void;
}

export const CredentialBadge: React.FC<CredentialBadgeProps> = ({
    credential,
    size = 'medium',
    showDetails = false,
    onClick,
}) => {
    const statusInfo = blockchainService.getStatusInfo(credential.status);
    const typeLabel = blockchainService.getCredentialTypeLabel(credential.credentialType);

    const sizeClasses = {
        small: 'w-16 h-16 text-xs',
        medium: 'w-24 h-24 text-sm',
        large: 'w-32 h-32 text-base',
    };

    const getCredentialIcon = () => {
        switch (credential.credentialType) {
            case 'skill_verification':
                return '🎓';
            case 'job_completion':
                return '✅';
            case 'community_contribution':
                return '🤝';
            case 'emergency_response':
                return '🚨';
            default:
                return '🏆';
        }
    };

    const getStatusColor = () => {
        switch (statusInfo.color) {
            case 'green':
                return 'border-green-500 bg-green-50';
            case 'yellow':
                return 'border-yellow-500 bg-yellow-50';
            case 'red':
                return 'border-red-500 bg-red-50';
            default:
                return 'border-gray-500 bg-gray-50';
        }
    };

    return (
        <div
            className={`relative ${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}
            onClick={onClick}
        >
            <div
                className={`w-full h-full rounded-full border-4 ${getStatusColor()} flex items-center justify-center shadow-lg`}
            >
                {credential.metadata.imageUrl ? (
                    <img
                        src={credential.metadata.imageUrl}
                        alt={credential.metadata.title}
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <span className="text-4xl">{getCredentialIcon()}</span>
                )}
            </div>

            {/* Status indicator */}
            {credential.status === 'minted' && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs">✓</span>
                </div>
            )}

            {credential.status === 'pending' && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs">⏳</span>
                </div>
            )}

            {showDetails && (
                <div className="mt-2 text-center">
                    <p className="font-semibold text-sm truncate">{credential.metadata.title}</p>
                    <p className="text-xs text-gray-600">{typeLabel}</p>
                    <p className="text-xs text-gray-500">{statusInfo.label}</p>
                </div>
            )}
        </div>
    );
};
