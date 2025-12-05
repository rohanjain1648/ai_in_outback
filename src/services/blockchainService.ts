import axios from 'axios';
import { BlockchainCredential, VerificationResult, BlockchainStatus } from '../types/blockchain';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class BlockchainService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        };
    }

    /**
     * Issue a new blockchain credential
     */
    async issueCredential(
        credentialType: BlockchainCredential['credentialType'],
        metadata: BlockchainCredential['metadata'],
        verifiedBy?: string
    ): Promise<BlockchainCredential> {
        const response = await axios.post(
            `${API_BASE_URL}/blockchain/credentials`,
            { credentialType, metadata, verifiedBy },
            this.getAuthHeaders()
        );
        return response.data.credential;
    }

    /**
     * Get all credentials for the authenticated user
     */
    async getUserCredentials(): Promise<BlockchainCredential[]> {
        const response = await axios.get(
            `${API_BASE_URL}/blockchain/credentials`,
            this.getAuthHeaders()
        );
        return response.data.credentials;
    }

    /**
     * Get a specific credential by ID
     */
    async getCredential(credentialId: string): Promise<BlockchainCredential> {
        const response = await axios.get(
            `${API_BASE_URL}/blockchain/credentials/${credentialId}`
        );
        return response.data.credential;
    }

    /**
     * Verify a credential using blockchain
     */
    async verifyCredential(credentialId: string): Promise<VerificationResult> {
        const response = await axios.post(
            `${API_BASE_URL}/blockchain/credentials/${credentialId}/verify`
        );
        return response.data.verification;
    }

    /**
     * Manually trigger minting for a pending credential
     */
    async mintCredential(credentialId: string): Promise<{ txHash?: string; tokenId?: string }> {
        const response = await axios.post(
            `${API_BASE_URL}/blockchain/credentials/${credentialId}/mint`,
            {},
            this.getAuthHeaders()
        );
        return response.data;
    }

    /**
     * Get blockchain service status
     */
    async getStatus(): Promise<BlockchainStatus> {
        const response = await axios.get(`${API_BASE_URL}/blockchain/status`);
        return response.data;
    }

    /**
     * Share credential (generate shareable link)
     */
    generateShareLink(credentialId: string): string {
        return `${window.location.origin}/credentials/${credentialId}`;
    }

    /**
     * Get blockchain explorer link for transaction
     */
    getExplorerLink(txHash: string, chainId: number = 80001): string {
        // Mumbai testnet explorer
        if (chainId === 80001) {
            return `https://mumbai.polygonscan.com/tx/${txHash}`;
        }
        // Polygon mainnet
        if (chainId === 137) {
            return `https://polygonscan.com/tx/${txHash}`;
        }
        return '#';
    }

    /**
     * Get credential type display name
     */
    getCredentialTypeLabel(type: BlockchainCredential['credentialType']): string {
        const labels: Record<BlockchainCredential['credentialType'], string> = {
            skill_verification: 'Skill Verification',
            job_completion: 'Job Completion',
            community_contribution: 'Community Contribution',
            emergency_response: 'Emergency Response',
        };
        return labels[type] || type;
    }

    /**
     * Get credential status display info
     */
    getStatusInfo(status: BlockchainCredential['status']): { label: string; color: string } {
        const statusMap: Record<BlockchainCredential['status'], { label: string; color: string }> = {
            pending: { label: 'Pending', color: 'yellow' },
            minted: { label: 'Verified', color: 'green' },
            failed: { label: 'Failed', color: 'red' },
        };
        return statusMap[status] || { label: status, color: 'gray' };
    }
}

export const blockchainService = new BlockchainService();
