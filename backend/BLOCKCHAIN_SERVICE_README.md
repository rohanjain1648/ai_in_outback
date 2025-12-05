# Blockchain Trust Service

## Overview

The Blockchain Trust Service provides a transparent and tamper-proof reputation system for the Rural Connect AI platform. It issues NFT-based credentials for verified achievements and allows users to build verifiable on-chain reputation.

## Features

- **NFT Credential Minting**: Issue blockchain-verified badges for achievements
- **Offline Queue**: Queue transactions when blockchain is unavailable
- **Credential Verification**: Verify credentials using blockchain transaction hashes
- **IPFS Integration**: Store metadata on IPFS for decentralization
- **Multiple Credential Types**: Support for skills, jobs, contributions, and emergency responses

## Architecture

### Components

1. **BlockchainCredential Model** (`models/BlockchainCredential.ts`)
   - MongoDB schema for storing credential data
   - Tracks minting status and blockchain references

2. **Blockchain Service** (`services/blockchainService.ts`)
   - Core service for blockchain interactions
   - Handles minting, verification, and queue management
   - Uses ethers.js for Polygon Mumbai testnet

3. **API Routes** (`routes/blockchain.ts`)
   - RESTful endpoints for credential management
   - Authentication and validation middleware

4. **Frontend Components** (`src/components/blockchain/`)
   - CredentialBadge: Display credential badges
   - CredentialGallery: Browse user credentials
   - CredentialDetailModal: View and verify credentials

## Setup

### Environment Variables

Add to `backend/.env`:

```bash
# Blockchain Configuration (Optional)
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here
BLOCKCHAIN_CONTRACT_ADDRESS=your_contract_address_here
BLOCKCHAIN_CHAIN_ID=80001
```

### Installation

```bash
cd backend
npm install ethers@^6.9.0
```

### Database Migration

No migration needed - the BlockchainCredential model will be created automatically.

## Usage

### Backend API

#### Issue a Credential

```bash
POST /api/v1/blockchain/credentials
Authorization: Bearer <token>
Content-Type: application/json

{
  "credentialType": "skill_verification",
  "metadata": {
    "title": "Expert Farmer",
    "description": "Verified expertise in sustainable farming practices",
    "attributes": [
      { "trait_type": "skill", "value": "farming" },
      { "trait_type": "level", "value": "expert" }
    ]
  }
}
```

#### Get User Credentials

```bash
GET /api/v1/blockchain/credentials
Authorization: Bearer <token>
```

#### Verify a Credential

```bash
POST /api/v1/blockchain/credentials/:id/verify
```

#### Get Blockchain Status

```bash
GET /api/v1/blockchain/status
```

### Frontend Usage

```typescript
import { blockchainService } from './services/blockchainService';
import { CredentialGallery } from './components/blockchain/CredentialGallery';

// Issue a credential
const credential = await blockchainService.issueCredential(
  'skill_verification',
  {
    title: 'Expert Farmer',
    description: 'Verified expertise in sustainable farming',
    attributes: [
      { trait_type: 'skill', value: 'farming' }
    ]
  }
);

// Display credentials
<CredentialGallery />
```

## Credential Types

1. **skill_verification**: Verified skills and expertise
2. **job_completion**: Completed gig jobs with ratings
3. **community_contribution**: Community service and contributions
4. **emergency_response**: Emergency response participation

## Offline Mode

When blockchain services are unavailable:
- Credentials are created with 'pending' status
- Transactions are queued for later processing
- Users can still view and share credentials
- Verification falls back to database records

## Testing

```bash
cd backend
npm test -- blockchainService.test.ts
```

## Production Deployment

### Smart Contract

Deploy an ERC-721 NFT contract with minting functionality:

```solidity
function mint(address to, string memory tokenURI) public returns (uint256)
```

### IPFS Setup

Integrate with IPFS services:
- Pinata: https://pinata.cloud
- Infura IPFS: https://infura.io/product/ipfs
- NFT.Storage: https://nft.storage

### Wallet Integration

For production, integrate wallet connection:
- MetaMask
- WalletConnect
- Coinbase Wallet

Store user wallet addresses in the User model.

### Gas Optimization

- Batch mint multiple credentials
- Use layer-2 solutions (Polygon)
- Implement gas price monitoring
- Queue low-priority mints

## Security Considerations

1. **Private Key Management**
   - Never commit private keys to version control
   - Use environment variables or secret management services
   - Rotate keys regularly

2. **Transaction Validation**
   - Validate all inputs before minting
   - Implement rate limiting on minting endpoints
   - Monitor for suspicious activity

3. **Access Control**
   - Only authorized users can issue credentials
   - Implement role-based permissions
   - Audit credential issuance

## Monitoring

Track these metrics:
- Pending credentials count
- Failed minting attempts
- Average minting time
- Gas costs
- Queue processing time

## Troubleshooting

### Minting Fails

1. Check RPC URL is accessible
2. Verify private key has sufficient funds
3. Check contract address is correct
4. Review transaction logs

### Verification Fails

1. Ensure transaction is confirmed on blockchain
2. Check network connectivity
3. Verify transaction hash is correct
4. Try fallback database verification

### Queue Not Processing

1. Check blockchain service availability
2. Verify credentials are in 'pending' status
3. Manually trigger queue processing
4. Review error logs

## Future Enhancements

- [ ] Multi-chain support (Ethereum, BSC, etc.)
- [ ] Credential revocation mechanism
- [ ] Credential expiration dates
- [ ] Batch minting optimization
- [ ] Social media sharing integration
- [ ] QR code generation for credentials
- [ ] Credential marketplace
- [ ] Reputation scoring algorithm

## Resources

- Ethers.js Documentation: https://docs.ethers.org
- Polygon Documentation: https://docs.polygon.technology
- IPFS Documentation: https://docs.ipfs.tech
- ERC-721 Standard: https://eips.ethereum.org/EIPS/eip-721
