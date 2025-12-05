# Blockchain Credential Display - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Display Credentials in User Profile

```tsx
import { CredentialGallery } from './components/blockchain';

function UserProfile() {
  return (
    <div>
      <h2>My Credentials</h2>
      <CredentialGallery />
    </div>
  );
}
```

### 2. Add Achievement Notifications

```tsx
import { CredentialNotificationManager } from './components/blockchain';

function App() {
  return (
    <>
      <YourAppContent />
      <CredentialNotificationManager />
    </>
  );
}
```

### 3. Create Public Verification Route

```tsx
import { PublicCredentialVerification } from './components/blockchain';

// Option A: With React Router
<Route path="/credentials/:credentialId" element={<PublicCredentialVerification />} />

// Option B: Standalone (reads from URL)
<PublicCredentialVerification />

// Option C: With prop
<PublicCredentialVerification credentialId="abc123" />
```

### 4. Show Single Badge

```tsx
import { CredentialBadge } from './components/blockchain';

function MyComponent({ credential }) {
  return (
    <CredentialBadge 
      credential={credential}
      size="large"
      showDetails={true}
      onClick={() => console.log('Clicked!')}
    />
  );
}
```

### 5. Manual Achievement Notification

```tsx
import { CredentialAchievementNotification } from './components/blockchain';

function MyComponent() {
  const [show, setShow] = useState(false);
  const [credential, setCredential] = useState(null);

  const handleEarned = (newCredential) => {
    setCredential(newCredential);
    setShow(true);
  };

  return (
    <>
      <button onClick={() => handleEarned(myCredential)}>
        Earn Credential
      </button>
      
      {show && credential && (
        <CredentialAchievementNotification 
          credential={credential}
          onClose={() => setShow(false)}
        />
      )}
    </>
  );
}
```

## 📱 Common Use Cases

### Show Credential Count

```tsx
import { blockchainService } from './services/blockchainService';

function CredentialCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    blockchainService.getUserCredentials()
      .then(creds => setCount(creds.length));
  }, []);

  return <div>You have {count} credentials</div>;
}
```

### Filter Credentials by Type

```tsx
import { blockchainService } from './services/blockchainService';

function SkillCredentials() {
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    blockchainService.getUserCredentials()
      .then(creds => {
        const skills = creds.filter(c => c.credentialType === 'skill_verification');
        setCredentials(skills);
      });
  }, []);

  return (
    <div>
      {credentials.map(cred => (
        <CredentialBadge key={cred._id} credential={cred} />
      ))}
    </div>
  );
}
```

### Share Credential

```tsx
import { blockchainService } from './services/blockchainService';

function ShareButton({ credentialId }) {
  const handleShare = () => {
    const link = blockchainService.generateShareLink(credentialId);
    navigator.clipboard.writeText(link);
    alert('Link copied!');
  };

  return <button onClick={handleShare}>Share</button>;
}
```

### Verify Credential

```tsx
import { blockchainService } from './services/blockchainService';

function VerifyButton({ credentialId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const verification = await blockchainService.verifyCredential(credentialId);
    setResult(verification);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      {result && (
        <div>{result.isValid ? '✅ Valid' : '❌ Invalid'}</div>
      )}
    </div>
  );
}
```

## 🎨 Customization Examples

### Custom Badge Size

```tsx
<CredentialBadge 
  credential={credential}
  size="small"  // or "medium" or "large"
/>
```

### Custom Auto-Close Delay

```tsx
<CredentialAchievementNotification 
  credential={credential}
  onClose={() => setShow(false)}
  autoCloseDelay={10000}  // 10 seconds
/>
```

### Custom Gallery Filters

The gallery component has built-in filters, but you can also filter manually:

```tsx
const [credentials, setCredentials] = useState([]);
const [filter, setFilter] = useState('all');

const filtered = credentials.filter(c => 
  filter === 'all' || c.credentialType === filter
);
```

## 🔧 Backend Integration

### Emit Socket Event (Backend)

```typescript
// When a credential is minted
io.to(userId).emit('credential_achieved', {
  credential: mintedCredential
});
```

### API Endpoints Required

```typescript
// Get user's credentials
GET /api/v1/blockchain/credentials
Authorization: Bearer {token}

// Get specific credential (public)
GET /api/v1/blockchain/credentials/:id

// Verify credential
POST /api/v1/blockchain/credentials/:id/verify

// Mint credential
POST /api/v1/blockchain/credentials/:id/mint
Authorization: Bearer {token}
```

## 🐛 Troubleshooting

### Credentials Not Loading
```tsx
// Check if token is set
const token = localStorage.getItem('token');
console.log('Token:', token);

// Check API response
blockchainService.getUserCredentials()
  .then(creds => console.log('Credentials:', creds))
  .catch(err => console.error('Error:', err));
```

### Notifications Not Appearing
```tsx
// Check socket connection
import { socketService } from './services/socketService';

socketService.on('connected', () => {
  console.log('Socket connected');
});

socketService.on('credential_achieved', (data) => {
  console.log('Credential achieved:', data);
});
```

### Verification Failing
```tsx
// Check credential status
if (credential.status !== 'minted') {
  console.log('Credential not minted yet');
}

// Check transaction hash
if (!credential.blockchainTxHash) {
  console.log('No transaction hash');
}
```

## 📚 Next Steps

1. **Read Full Documentation:** `BLOCKCHAIN_CREDENTIAL_DISPLAY.md`
2. **Try the Demo:** Import and render `CredentialDisplayDemo`
3. **Check API Reference:** `CREDENTIAL_DISPLAY_README.md`
4. **Review Examples:** Look at existing components for patterns

## 💡 Pro Tips

1. **Always show loading states** when fetching credentials
2. **Handle errors gracefully** with user-friendly messages
3. **Use the notification manager** instead of manual notifications
4. **Cache credentials** to reduce API calls
5. **Test on mobile** to ensure responsive design works
6. **Add analytics** to track credential views and shares

## 🎯 Common Patterns

### Loading State
```tsx
const [loading, setLoading] = useState(true);
const [credentials, setCredentials] = useState([]);

useEffect(() => {
  setLoading(true);
  blockchainService.getUserCredentials()
    .then(setCredentials)
    .finally(() => setLoading(false));
}, []);

if (loading) return <div>Loading...</div>;
```

### Error Handling
```tsx
const [error, setError] = useState(null);

try {
  const creds = await blockchainService.getUserCredentials();
  setCredentials(creds);
} catch (err) {
  setError(err.message);
}

if (error) return <div>Error: {error}</div>;
```

### Empty State
```tsx
if (credentials.length === 0) {
  return (
    <div>
      <p>No credentials yet</p>
      <p>Complete activities to earn credentials!</p>
    </div>
  );
}
```

## 🚀 Ready to Go!

You now have everything you need to implement blockchain credential display in your app. Start with the simple examples above and refer to the full documentation for advanced features.

**Happy coding! 🎉**
