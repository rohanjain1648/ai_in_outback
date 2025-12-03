# Voice Interface Component

A comprehensive voice interface implementation using the Web Speech API for speech-to-text and text-to-speech functionality.

## Features

- **Speech Recognition**: Convert voice input to text using Web Speech API
- **Text-to-Speech**: Provide voice feedback with customizable voice settings
- **Command Parsing**: Intelligent parsing of voice commands with pattern matching
- **Browser Compatibility**: Automatic detection and graceful degradation
- **Microphone Permissions**: Proper handling of microphone access requests
- **Visual Indicators**: Real-time visual feedback for listening and speaking states
- **Voice Settings**: Customizable voice, pitch, rate, and volume
- **Natural Language**: Support for natural language commands

## Components

### VoiceInterface

Main component providing the complete voice interface UI.

```tsx
import { VoiceInterface } from '@/components/voice/VoiceInterface';

<VoiceInterface
  onCommand={(result) => console.log('Command:', result)}
  onTranscript={(transcript) => console.log('Transcript:', transcript)}
  onError={(error) => console.error('Error:', error)}
  showVisualIndicator={true}
  autoStart={false}
/>
```

### VoiceDemo

Demo component showcasing voice interface capabilities.

```tsx
import { VoiceDemo } from '@/components/voice/VoiceDemo';

<VoiceDemo />
```

## Hooks

### useVoice

Custom hook for programmatic voice control.

```tsx
import { useVoice } from '@/hooks/useVoice';

const {
  voiceState,
  startListening,
  stopListening,
  speak,
  stopSpeaking,
  onCommand,
  updateSettings,
  getVoices,
} = useVoice();

// Start listening
await startListening();

// Speak text
await speak('Hello, world!');

// Handle commands
onCommand((result) => {
  console.log('Command received:', result);
});
```

## Services

### voiceService

Core service providing voice functionality.

```tsx
import {
  checkVoiceSupport,
  getSpeechRecognition,
  parseVoiceCommand,
  SpeechService,
  requestMicrophonePermission,
  generateResponse,
} from '@/services/voiceService';

// Check browser support
const support = checkVoiceSupport();

// Parse voice command
const result = parseVoiceCommand('search for farmers');

// Create speech service
const speechService = new SpeechService({
  language: 'en-AU',
  pitch: 1,
  rate: 1,
  volume: 1,
});

await speechService.speak('Hello!');
```

## Supported Commands

### Search
- "Search for [query]"
- "Find [query]"
- "Look for [query]"
- "Show me [query]"

### Navigate
- "Go to [page]"
- "Open [page]"
- "Navigate to [page]"
- "Take me to [page]"

### Post
- "Post [content]"
- "Create [content]"
- "Add [content]"
- "New [content]"

### Quick Actions
- "Home" - Go to home page
- "Profile" - Open profile
- "Notifications" - Show notifications
- "Emergency" - Open emergency services
- "Help" - Show available commands

## Browser Compatibility

The voice interface requires:
- **Speech Recognition**: Chrome, Edge, Safari (with webkit prefix)
- **Speech Synthesis**: All modern browsers

Unsupported browsers will show a graceful fallback message.

## Requirements Validation

This implementation satisfies the following requirements from the spec:

- **1.1**: Web Speech API integration for speech-to-text ✓
- **1.2**: Natural language query processing ✓
- **1.3**: Text-to-speech output for notifications ✓
- **1.4**: Voice command clarification options ✓
- **1.5**: Graceful degradation for unsupported browsers ✓

## Usage Example

```tsx
import React from 'react';
import { VoiceInterface } from '@/components/voice/VoiceInterface';
import { CommandResult } from '@/types/voice';

function MyComponent() {
  const handleCommand = (result: CommandResult) => {
    switch (result.command) {
      case 'search':
        // Perform search with result.parameters?.query
        break;
      case 'navigate':
        // Navigate to result.parameters?.query
        break;
      case 'emergency':
        // Open emergency services
        break;
      default:
        console.log('Unknown command');
    }
  };

  return (
    <div>
      <h1>My App</h1>
      <VoiceInterface
        onCommand={handleCommand}
        showVisualIndicator={true}
      />
    </div>
  );
}
```

## Accessibility

- Full keyboard navigation support
- ARIA labels for all interactive elements
- Screen reader compatible
- Visual indicators for all states
- Clear error messaging

## Performance

- Debounced voice input processing
- Efficient command pattern matching
- Minimal re-renders with proper state management
- Cleanup of resources on unmount
