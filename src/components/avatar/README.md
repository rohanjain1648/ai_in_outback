# Spirit Avatar System

AI-powered avatar generation system with geometric fallback patterns for the Rural Connect AI platform.

## Features

### 1. AI Avatar Generation
- **OpenAI DALL-E Integration**: Generates unique, personalized spirit avatars using DALL-E 3
- **Profile-Based Customization**: Avatars are personalized based on user interests, occupation, and location
- **Style Options**: 5 distinct styles (ethereal, geometric, nature, abstract, traditional)
- **Theme Options**: 6 color themes (light, dark, earth, water, fire, air)

### 2. Geometric Fallback System
- **Deterministic Patterns**: Generates consistent geometric patterns based on user ID
- **SVG-Based**: Lightweight, scalable vector graphics
- **Multiple Shapes**: Circles, triangles, squares, and hexagons
- **Theme Colors**: Matches selected color theme
- **No External Dependencies**: Works completely offline

### 3. Avatar Caching
- **Local Cache**: Reduces API calls by caching generated avatars
- **24-Hour TTL**: Cache expires after 24 hours
- **Automatic Fallback**: Falls back to geometric patterns if cache miss and API unavailable

### 4. Avatar Gallery
- **Browse Avatars**: View all generated avatars
- **Set Active**: Select which avatar to use
- **Delete Avatars**: Remove unwanted avatars
- **AI Badge**: Visual indicator for AI-generated vs geometric avatars

### 5. Avatar Display
- **Multiple Sizes**: sm, md, lg, xl
- **Glow Effects**: Optional holographic glow animation
- **Fallback UI**: Graceful fallback to default user icon
- **Responsive**: Works on all screen sizes

## Components

### AvatarGenerator
Main component for generating new avatars.

```tsx
import { AvatarGenerator } from './components/avatar';

<AvatarGenerator
  onAvatarGenerated={(avatarUrl) => console.log('Generated:', avatarUrl)}
  onClose={() => setShowGenerator(false)}
/>
```

**Props:**
- `onAvatarGenerated?: (avatarUrl: string) => void` - Callback when avatar is generated
- `onClose?: () => void` - Callback to close the generator

### AvatarGallery
Component for browsing and managing user avatars.

```tsx
import { AvatarGallery } from './components/avatar';

<AvatarGallery
  onAvatarSelected={(avatar) => console.log('Selected:', avatar)}
/>
```

**Props:**
- `onAvatarSelected?: (avatar: SpiritAvatar) => void` - Callback when avatar is selected

### AvatarDisplay
Component for displaying avatars with various styles.

```tsx
import { AvatarDisplay } from './components/avatar';

<AvatarDisplay
  avatarUrl={user.profile.avatar}
  size="lg"
  showGlow={true}
  alt="User Avatar"
/>
```

**Props:**
- `avatarUrl?: string` - URL of the avatar image
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Size of the avatar (default: 'md')
- `showGlow?: boolean` - Show holographic glow effect (default: true)
- `className?: string` - Additional CSS classes
- `alt?: string` - Alt text for accessibility (default: 'Avatar')

### AvatarDemo
Demo component showcasing all avatar features.

```tsx
import AvatarDemo from './components/avatar/AvatarDemo';

<AvatarDemo />
```

## Backend API

### Endpoints

#### POST /api/v1/avatars/generate
Generate a new spirit avatar.

**Request:**
```json
{
  "customization": {
    "style": "ethereal",
    "theme": "light",
    "colors": ["#E0F2FE", "#BAE6FD"]
  },
  "userProfile": {
    "interests": ["farming", "sustainability"],
    "occupation": "Farmer",
    "location": "Outback"
  }
}
```

**Response:**
```json
{
  "success": true,
  "avatar": {
    "id": "avatar_123",
    "userId": "user_456",
    "imageUrl": "https://...",
    "customization": { ... },
    "isAIGenerated": true,
    "generatedAt": "2024-01-01T00:00:00Z",
    "isActive": false
  }
}
```

#### GET /api/v1/avatars/user/:userId
Get all avatars for a user.

#### GET /api/v1/avatars/active/:userId
Get the active avatar for a user.

#### PUT /api/v1/avatars/:avatarId/activate
Set an avatar as active.

#### DELETE /api/v1/avatars/:avatarId
Delete an avatar.

## Configuration

### Environment Variables

```env
# OpenAI API Key (optional - will use geometric fallback if not set)
OPENAI_API_KEY=sk-...
```

### Frontend Configuration

```env
# API URL
VITE_API_URL=http://localhost:5000/api/v1
```

## Usage in Notifications

The avatar system integrates seamlessly with the Ethereal Notification system:

```tsx
import { EtherealNotificationManager } from './components/notifications';

<EtherealNotificationManager
  notifications={[
    {
      id: '1',
      title: 'New Connection',
      message: 'Someone nearby shares your interests',
      type: 'info',
      timestamp: new Date(),
      avatar: user.profile.avatar, // Spirit avatar URL
    }
  ]}
/>
```

## Customization Options

### Styles
- **ethereal**: Ghostly, translucent with glowing edges
- **geometric**: Sacred geometry and symmetrical patterns
- **nature**: Organic forms and natural elements
- **abstract**: Surreal and dreamlike artistic style
- **traditional**: Aboriginal art inspired patterns

### Themes
- **light**: Bright, luminous, celestial colors
- **dark**: Dark, mysterious, deep shadows
- **earth**: Earthy tones, browns, ochres
- **water**: Aquatic blues, flowing, liquid
- **fire**: Warm reds, oranges, energetic
- **air**: Light blues, whites, airy

## Performance

- **AI Generation**: ~10-30 seconds (depends on OpenAI API)
- **Geometric Generation**: <100ms (instant)
- **Cache Hit**: <10ms
- **Image Size**: ~50-200KB (AI), ~5-10KB (geometric SVG)

## Accessibility

- **Alt Text**: All avatars include descriptive alt text
- **Keyboard Navigation**: Full keyboard support in gallery
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **High Contrast**: Works with high contrast mode
- **Reduced Motion**: Respects prefers-reduced-motion

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Future Enhancements

- [ ] Avatar animation options
- [ ] More style and theme combinations
- [ ] Avatar accessories and overlays
- [ ] Social sharing of avatars
- [ ] Avatar NFT minting integration
- [ ] Video avatar generation
- [ ] AR avatar preview

## Troubleshooting

### Avatar not generating
- Check OpenAI API key is set correctly
- Verify API quota and billing
- Check network connectivity
- System will automatically fall back to geometric patterns

### Geometric fallback always used
- This is expected if OPENAI_API_KEY is not set
- Check backend logs for API errors
- Verify OpenAI API is accessible from backend

### Avatar not displaying
- Check image URL is valid
- Verify CORS settings
- Check browser console for errors
- Component will show default user icon as fallback

## Related Components

- [Ethereal Notifications](../notifications/README.md)
- [User Profile](../UserProfile.tsx)
- [Blockchain Credentials](../blockchain/README.md)
