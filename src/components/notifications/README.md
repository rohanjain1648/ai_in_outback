# Ethereal Notification System

A stunning notification system with holographic effects, animations, and contextual sounds for the Rural Connect AI platform.

## Features

- ✨ **Holographic Glow Effects**: CSS filters and animations create ethereal, glowing notifications
- 🎬 **Framer Motion Animations**: Smooth fade-in, pulse, and stack transitions
- 🔊 **Web Audio API Integration**: Contextual sound effects for different notification types
- 📱 **Haptic Feedback**: Vibration support on mobile devices
- 🎨 **Distinct Notification Types**: Info, Success, Warning, and Emergency with unique styles
- 📋 **Notification History**: Full management panel with filtering and actions
- ⚡ **Priority Queue**: Automatic sorting by priority and timestamp
- 🎯 **Auto-dismiss**: Non-emergency notifications auto-dismiss after 8 seconds

## Components

### EtherealNotification
Individual notification component with holographic effects and animations.

### EtherealNotificationManager
Queue manager that displays notifications in the top-right corner with priority handling.

### EtherealNotificationHistory
Full-screen history panel accessible via bell icon with filtering and management features.

### EtherealNotificationDemo
Demo component showcasing all notification types and features.

## Usage

### Basic Integration

Add the notification manager to your app:

```tsx
import { EtherealNotificationManager } from './components/notifications';
import { EtherealNotificationHistory } from './components/notifications';

function App() {
  return (
    <>
      {/* Your app content */}
      
      {/* Add notification manager for toast-style notifications */}
      <EtherealNotificationManager />
      
      {/* Add notification history in your header/nav */}
      <EtherealNotificationHistory />
    </>
  );
}
```

### Sending Notifications

Use the existing `notificationService`:

```tsx
import { notificationService } from './services/notificationService';

// Send an info notification
notificationService.addNotification({
  id: `notif_${Date.now()}`,
  title: 'New Message',
  message: 'You have a new message from the community',
  type: 'info',
  timestamp: new Date(),
  read: false
});

// Send an emergency alert
notificationService.addNotification({
  id: `emergency_${Date.now()}`,
  title: '🚨 Emergency Alert',
  message: 'Severe weather warning in your area',
  type: 'emergency',
  timestamp: new Date(),
  read: false,
  actions: [
    {
      action: 'acknowledge',
      title: 'Acknowledge',
      handler: () => console.log('Acknowledged')
    }
  ]
});
```

### Initializing Audio

Audio must be initialized on user interaction:

```tsx
import { initializeAudio } from './utils/notificationSounds';

// Call on first user click/touch
button.addEventListener('click', () => {
  initializeAudio();
});
```

## Notification Types

### Info
- **Color**: Blue
- **Sound**: Gentle single tone (A4)
- **Use**: General information, updates

### Success
- **Color**: Green
- **Sound**: Pleasant chord (C5 + E5)
- **Use**: Successful actions, confirmations

### Warning
- **Color**: Yellow
- **Sound**: Moderate alert tone
- **Use**: Important warnings, expiring sessions

### Emergency
- **Color**: Red
- **Sound**: Urgent alternating alarm
- **Haptic**: Strong vibration pattern
- **Use**: Critical alerts, safety warnings
- **Behavior**: Does not auto-dismiss

## Customization

### Notification Priority

Priorities are automatically assigned:
- Emergency: 100
- Warning: 75
- Success: 50
- Info: 25

### Max Visible Notifications

Default is 5. Modify in `EtherealNotificationManager.tsx`:

```tsx
const MAX_VISIBLE = 5; // Change this value
```

### Auto-dismiss Timeout

Default is 8 seconds. Modify in `EtherealNotificationManager.tsx`:

```tsx
setTimeout(() => {
  handleDismiss(etherealNotification.id);
}, 8000); // Change timeout here
```

## Browser Support

- **Web Audio API**: All modern browsers
- **Haptic Feedback**: Mobile browsers with vibration API
- **Framer Motion**: All browsers supporting React
- **CSS Filters**: All modern browsers

## Demo

To see all features in action:

```tsx
import EtherealNotificationDemo from './components/notifications/EtherealNotificationDemo';

// Render the demo component
<EtherealNotificationDemo />
```

## Requirements Validated

This implementation validates the following requirements from the design document:

- **2.1**: Holographic glow effects with smooth fade-in animations ✓
- **2.2**: Contextual sound effects and high-contrast visual indicators ✓
- **2.3**: Haptic feedback on supported devices ✓
- **2.4**: Stack notifications with ethereal animations ✓

## Technical Details

### Sound Generation

Sounds are generated using Web Audio API with oscillators:
- **Emergency**: Square wave, alternating 800Hz/600Hz
- **Warning**: Sine wave, 600Hz → 500Hz
- **Success**: Dual sine waves (C5 + E5 chord)
- **Info**: Single sine wave (A4)

### Animation Performance

- GPU-accelerated CSS transforms
- Framer Motion spring animations
- Particle effects with optimized rendering
- Automatic cleanup on unmount

### Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatible
- Reduced motion support (respects user preferences)
