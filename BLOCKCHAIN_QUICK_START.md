# Blockchain Trust Service - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install ethers@^6.9.0
```

### 2. Configure Environment (Optional for Demo)

Add to `backend/.env`:

```bash
# Optional - works without these for demo
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
BLOCKCHAIN_PRIVATE_KEY=
BLOCKCHAIN_CONTRACT_ADDRESS=
BLOCKCHAIN_CHAIN_ID=80001
```

**Note**: The service works in offline mode without blockchain configuration. Credentials are stored in the database and can be minted later when blockchain is configured.

### 3. Start the Backend

```bash
cd backend
npm run dev
```

The blockchain routes are automatically available at:
- `http://localhost:3001/api/v1/blockchain/*`

## 📝 API Endpoints

### Issue a Credential
```bash
POST /api/v1/blockchain/credentials
Authorization: Bearer <token>

{
  "credentialType": "skill_verification",
  "metadata": {
    "title": "Expert Farmer",
    "description": "Verified expertise in sustainable farming",
    "attributes": [
      { "trait_type": "skill", "value": "farming" },
      { "trait_type": "level", "value": "expert" }
    ]
  }
}
```

### Get User Credentials
```bash
GET /api/v1/blockchain/credentials
Authorization: Bearer <token>
```

### Verify Credential
```bash
POST /api/v1/blockchain/credentials/:id/verify
```

### Check Status
```bash
GET /api/v1/blockchain/status
```

## 🎨 Frontend Usage

### Display Credential Gallery

```tsx
import { CredentialGallery } from './components/blockchain';

function UserProfile() {
  return (
    <div>
      <h1>My Credentials</h1>
      <CredentialGallery />
    </div>
  );
}
```

### Show Demo Page

```tsx
import { BlockchainDemo } from './components/blockchain';

function BlockchainPage() {
  return <BlockchainDemo />;
}
```

### Issue Credential Programmatically

```tsx
import { blockchainService } from './services/blockchainService';

async function awardSkillBadge(userId: string) {
  const credential = await blockchainService.issueCredential(
    'skill_verification',
    {
      title: 'Certified Farmer',
      description: 'Completed advanced farming course',
      attributes: [
        { trait_type: 'skill', value: 'farming' },
        { trait_type: 'level', value: 'advanced' }
      ]
    }
  );
  
  console.log('Credential issued:', credential);
}
```

## 🔧 Integration Examples

### Award Credential on Job Completion

```typescript
// In your gig completion handler
import { blockchainService } from '../services/blockchainService';

async function completeJob(jobId: string, workerId: string) {
  // ... complete the job
  
  // Award blockchain credential
  await blockchainService.issueCredential(
    new mongoose.Types.ObjectId(workerId),
    'job_completion',
    {
      title: 'Job Completed',
      description: `Successfully completed job: ${job.title}`,
      attributes: [
        { trait_type: 'job_type', value: job.category },
        { trait_type: 'rating', value: rating.toString() }
      ]
    }
  );
}
```

### Award Credential for Emergency Response

```typescript
// In your emergency response handler
async function recordEmergencyResponse(userId: string, alertId: string) {
  await blockchainService.issueCredential(
    new mongoose.Types.ObjectId(userId),
    'emergency_response',
    {
      title: 'Emergency Responder',
      description: 'Responded to community emergency alert',
      attributes: [
        { trait_type: 'response_type', value: 'emergency' },
        { trait_type: 'alert_id', value: alertId }
      ]
    }
  );
}
```

## 🎯 Credential Types

1. **skill_verification** - Verified skills and expertise
2. **job_completion** - Completed gig jobs
3. **community_contribution** - Community service
4. **emergency_response** - Emergency participation

## 📊 Testing

Run the tests:

```bash
cd backend
npm test -- blockchainService.test.ts
```

Expected output:
```
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

## 🔍 Troubleshooting

### Credentials Stay in "Pending" Status

**Cause**: Blockchain service not configured or unavailable

**Solution**: 
- This is normal for demo mode
- Credentials are stored in database
- Configure blockchain environment variables to enable minting
- Or manually trigger minting via API

### "User not authenticated" Error

**Cause**: Missing or invalid JWT token

**Solution**: Include valid JWT token in Authorization header

### TypeScript Errors

**Cause**: Missing type definitions

**Solution**: All types are defined in `src/types/blockchain.ts`

## 📚 Documentation

- Full documentation: `backend/BLOCKCHAIN_SERVICE_README.md`
- Implementation summary: `BLOCKCHAIN_IMPLEMENTATION_SUMMARY.md`
- API routes: `backend/src/routes/blockchain.ts`
- Service code: `backend/src/services/blockchainService.ts`

## ✅ Verification Checklist

- [x] Backend service running
- [x] Routes accessible at `/api/v1/blockchain/*`
- [x] Can issue credentials via API
- [x] Can retrieve credentials
- [x] Frontend components render correctly
- [x] Tests passing
- [x] No TypeScript errors

## 🎉 You're Ready!

The blockchain trust service is fully functional and ready to use. Start issuing credentials to build trust and reputation in your platform!
