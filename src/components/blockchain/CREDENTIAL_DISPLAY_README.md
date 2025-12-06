# Blockchain Credential Display System

## Overview

A comprehensive system for displaying, verifying, and sharing blockchain-verified credentials in the Rural Connect AI platform. This implementation fulfills Task 12 of the hackathon enhancements specification.

## Components

### 1. CredentialBadge
**File:** `CredentialBadge.tsx`

Displays a credential as a badge with customizable size and styling.

**Props:**
- `credential: BlockchainCredential` - The credential to display
- `size?: 'small' | 'medium' | 'large'` - Badge size (default: 'medium')
- `showDetails?: boolean` - Show title and type below badge
- `onClick?: () => void` - Click handler

**Example:**
```tsx
<CredentialBadge 
  credential={myCredential} 
  size="large" 
  showDetails={true}
  onClick={() => openDetails()}
/>
```

### 2. CredentialGallery
**File:** `CredentialGallery.tsx`

Displays all user credentials with filtering and sorting capabilities.

**Features:**
- Filter by credential type
- Filter by status (minted, pending, failed)
- Sort by date, type, or status
- Responsive grid layout
- Retry minting for failed credentials
- Click to view details

**Example:**
```tsx
<CredentialGallery />
```

### 3. CredentialDetailModal
**File:** `CredentialDetailModal.tsx`

Modal displaying full credential details with verification and sharing options.

**Props:**
- `credential: BlockchainCredential` - The credential to display
- `onClose: () => void` - Close handler

**Features:**
- Blockchain verification
- Social media sharing (Twitter, Facebook, LinkedIn)
- Copy link to clipboard
- Download as JSON
- Transaction hash links
- IPFS metadata display

**Example:**
```tsx
<CredentialDetailModal 
  credential={selectedCredential}
  onClose={() => setSelectedCredential(null)}
/>
```

### 4. PublicCredentialVerification
**File:** `PublicCredentialVerification.tsx`

Standalone page for public credential verification (no authentication required).

**Route:** `/credentials/:credentialId`

**Features:**
- Public access
- Blockchain verification
- Beautiful gradient design
- Share and print functionality
- Mobile responsive
- Error handling

**Example:**
```tsx
// In your router
<Route path="/credentials/:credentialId" element={<PublicCredentialVerification />} />
```

### 5. CredentialAchievementNotification
**File:** `CredentialAchievementNotification.tsx`

Celebration notification displayed when a user earns a new credential.

**Props:**
- `credential: BlockchainCredential` - The earned credential
- `onClose: () => void` - Close handler
- `autoCloseDelay?: number` - Auto-close delay in ms (default: 8000)

**Features:**
- Animated confetti (30 particles)
- Glow and shine effects
- Framer Motion animations
- Auto-dismiss
- Quick actions (View Profile, Share)

**Example:**
```tsx
<CredentialAchievementNotification 
  credential={newCredential}
  onClose={() => setShowNotification(false)}
  autoCloseDelay={10000}
/>
```

### 6. CredentialNotificationManager
**File:** `CredentialNotificationManager.tsx`

Manages and displays credential achievement notifications from socket events.

**Features:**
- Listens for socket events
- Displays most recent notification
- Automatic lifecycle management

**Example:**
```tsx
// Add to your app root
<CredentialNotificationManager />
```

### 7. CredentialDisplayDemo
**File:** `CredentialDisplayDemo.tsx`

Comprehensive demo showcasing all credential display features.

**Features:**
- Badge size demonstrations
- Credential type examples
- Achievement notification trigger
- Gallery preview
- Integration information

**Example:**
```tsx
<CredentialDisplayDemo />
```

## Hooks

### useCredentialNotifications
**File:** `hooks/useCredentialNotifications.ts`

React hook for managing credential achievement notifications.

**Returns:**
- `notifications: CredentialNotification[]` - Array of notifications
- `dismissNotification: (id: string) => void` - Dismiss a notification
- `clearAll: () => void` - Clear all notifications

**Example:**
```tsx
const { notifications, dismissNotification } = useCredentialNotifications();

notifications.map(notif => (
  <CredentialAchievementNotification 
    key={notif.credential._id}
    credential={notif.credential}
    onClose={() => dismissNotification(notif.credential._id)}
  />
))
```

## Integration Guide

### 1. Add to User Profile

```tsx
import { CredentialGallery } from './components/blockchain';

// In your UserProfile component
<div className="credentials-section">
  <h2>My Credentials</h2>
  <CredentialGallery />
</div>
```

### 2. Add Notification Manager

```tsx
import { CredentialNotificationManager } from './components/blockchain';

// In your App.tsx or root component
function App() {
  return (
    <>
      <YourAppContent />
      <CredentialNotificationManager />
    </>
  );
}
```

### 3. Add Public Verification Route

```tsx
import { PublicCredentialVerification } from './components/blockchain';

// In your router configuration
<Routes>
  <Route path="/credentials/:credentialId" element={<PublicCredentialVerification />} />
  {/* other routes */}
</Routes>
```

### 4. Trigger Achievement Notification Manually

```tsx
import { CredentialAchievementNotification } from './components/blockchain';

const [showAchievement, setShowAchievement] = useState(false);
const [newCredential, setNewCredential] = useState(null);

// When credential is earned
const handleCredentialEarned = (credential) => {
  setNewCredential(credential);
  setShowAchievement(true);
};

// In render
{showAchievement && newCredential && (
  <CredentialAchievementNotification 
    credential={newCredential}
    onClose={() => setShowAchievement(false)}
  />
)}
```

## Socket Events

The system listens for the following socket event:

```typescript
socketService.on('credential_achieved', (data: { credential: BlockchainCredential }) => {
  // Automatically handled by CredentialNotificationManager
});
```

**Backend Implementation:**
```typescript
// When a credential is minted
io.to(userId).emit('credential_achieved', {
  credential: mintedCredential
});
```

## API Integration

All components use the `blockchainService` for API calls:

```typescript
// Get user's credentials
const credentials = await blockchainService.getUserCredentials();

// Get specific credential (public)
const credential = await blockchainService.getCredential(credentialId);

// Verify credential on blockchain
const verification = await blockchainService.verifyCredential(credentialId);

// Retry minting
await blockchainService.mintCredential(credentialId);

// Generate share link
const link = blockchainService.generateShareLink(credentialId);

// Get blockchain explorer link
const explorerUrl = blockchainService.getExplorerLink(txHash);
```

## Styling

### Tailwind Classes Used
- Gradient backgrounds: `bg-gradient-to-br from-blue-50 to-indigo-100`
- Shadows: `shadow-lg`, `shadow-xl`, `shadow-2xl`
- Rounded corners: `rounded-lg`, `rounded-full`, `rounded-2xl`
- Hover effects: `hover:scale-105`, `hover:bg-blue-700`
- Transitions: `transition-all`, `transition-colors`, `transition-transform`

### Custom Animations
- Confetti particles with random trajectories
- Pulsing glow effects
- Shine/shimmer effects
- Spring-based entrance animations

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Focus management in modals
- ✅ Color contrast compliance (WCAG AA)
- ✅ Screen reader friendly
- ✅ Semantic HTML structure

## Mobile Responsiveness

- ✅ Responsive grid layouts (2-5 columns)
- ✅ Touch-friendly button sizes (min 44x44px)
- ✅ Swipe gestures in modals
- ✅ Viewport-optimized scaling
- ✅ Reduced animations on low-end devices

## Performance

- ✅ Lazy loading of credentials
- ✅ Memoized components
- ✅ GPU-accelerated animations
- ✅ Optimized re-renders
- ✅ Efficient socket event handling

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

### Unit Tests
```typescript
// Test badge rendering
test('renders credential badge with correct size', () => {
  render(<CredentialBadge credential={mockCredential} size="large" />);
  expect(screen.getByRole('img')).toHaveClass('w-32 h-32');
});

// Test filtering
test('filters credentials by type', () => {
  render(<CredentialGallery />);
  fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'skill_verification' } });
  expect(screen.getAllByRole('button')).toHaveLength(expectedCount);
});
```

### Integration Tests
```typescript
// Test socket event handling
test('displays notification when credential achieved', async () => {
  render(<CredentialNotificationManager />);
  
  act(() => {
    socketService.emit('credential_achieved', { credential: mockCredential });
  });
  
  await waitFor(() => {
    expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Credentials not loading
- Check authentication token
- Verify API endpoint configuration
- Check network requests in browser DevTools

### Notifications not appearing
- Ensure CredentialNotificationManager is mounted
- Check socket connection status
- Verify socket event name matches backend

### Verification failing
- Check blockchain network connectivity
- Verify transaction hash format
- Ensure credential is minted (status: 'minted')

### Share links not working
- Verify public route is configured
- Check credential ID in URL
- Ensure backend allows public access to credential endpoint

## Future Enhancements

1. **Credential Collections** - Group related credentials
2. **Achievement Milestones** - Track progress
3. **Leaderboards** - Community comparisons
4. **QR Codes** - Easy mobile sharing
5. **Batch Operations** - Share multiple credentials
6. **Advanced Search** - Date ranges, issuers, etc.
7. **NFT Marketplace** - Trade credentials
8. **Expiry Handling** - Time-limited credentials

## Support

For issues or questions:
1. Check this README
2. Review the main documentation: `BLOCKCHAIN_CREDENTIAL_DISPLAY.md`
3. Check the demo: `CredentialDisplayDemo.tsx`
4. Review the blockchain service: `services/blockchainService.ts`

## License

Part of the Rural Connect AI platform.
