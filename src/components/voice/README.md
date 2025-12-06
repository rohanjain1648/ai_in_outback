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


## Voice Command Router

### VoiceCommandRouter

Comprehensive voice command routing system that integrates with all app features.

**Features:**
- Centralized command processing for all features
- Multi-step voice workflows with context retention
- Confirmation dialogs for critical actions
- Context-aware command execution
- Integrated help system

**Usage:**
```tsx
import { VoiceCommandRouter } from '@/components/voice/VoiceCommandRouter';

<VoiceCommandRouter
  currentLocation={{ lat: -37.8136, lon: 144.9631 }}
  onNotification={(msg, type) => showNotification(msg, type)}
/>
```

## Feature-Specific Commands

### Gig Board Commands
- "post a job for [description]" - Create new job posting (requires confirmation)
- "search jobs for [query]" - Search available jobs
- "find gigs for [category]" - Find jobs by category
- "apply to job" - Apply to current job
- "show my jobs" - View your jobs and applications

### Service Navigator Commands
- "find [type] services" - Search for services
- "search for [type] services" - Search services by type
- "call [service] service" - Contact a service
- "show nearby [type]" - Find nearby services
- "open service navigator" - Open service directory

### Emergency Commands (Highest Priority)
- "report emergency" - Report an emergency (requires confirmation)
- "create emergency alert" - Create emergency alert
- "check alerts" - View emergency alerts
- "emergency" / "help" / "urgent" / "SOS" - Access emergency services

### Navigation Commands
- "go home" - Navigate to dashboard
- "go to profile" - View your profile
- "check notifications" - View notifications
- "go to [page]" - Navigate to any page (community, skills, resources, etc.)

## Multi-Step Voice Workflows

The system supports guided multi-step workflows that retain context:

### Post Job Workflow
```
User: "Start post job workflow"
System: "What type of job do you want to post?"
User: "Agriculture"
System: "What is the job title?"
User: "Farm hand needed"
System: "Describe the job"
User: "Help with harvest season"
System: "What is the payment amount?"
User: "25 dollars per hour"
System: "How many hours will it take?"
User: "40 hours"
System: "Post job completed. Submitting now."
```

### Report Emergency Workflow
```
User: "Start report emergency workflow"
System: "What type of emergency is this?"
User: "Fire"
System: "Describe the emergency"
User: "Bushfire approaching from the north"
System: "What is the severity? Say low, medium, high, or critical"
User: "Critical"
System: "Report emergency completed. Submitting now."
```

### Find Service Workflow
```
User: "Start find service workflow"
System: "What type of service are you looking for?"
User: "Medical"
System: "Do you want to search nearby or in a specific location?"
User: "Nearby"
System: "Find service completed. Submitting now."
```

## Voice Command Integration Service

### voiceCommandIntegration

Advanced command integration service providing:
- Feature-specific command handlers
- Multi-step workflow management
- Context retention across commands
- Command confirmation system
- Natural language processing

```tsx
import {
  processVoiceCommand,
  getCommandsByCategory,
  VoiceWorkflowManager,
  workflows
} from '@/services/voiceCommandIntegration';

// Process a command
const result = await processVoiceCommand(transcript, {
  navigate: (path) => navigate(path),
  showNotification: (msg, type) => notify(msg, type),
  currentLocation: { lat: -37.8136, lon: 144.9631 }
});

// Get all commands by category
const commands = getCommandsByCategory();

// Use workflow manager
const workflowManager = new VoiceWorkflowManager();
workflowManager.startWorkflow('postJob');
```

## Integration Guide

To add voice commands for a new feature:

1. **Define Command Handlers** in `voiceCommandIntegration.ts`:
```typescript
export const myFeatureCommands: VoiceCommandHandler[] = [
  {
    pattern: /do something with (.+)/i,
    handler: (match, context) => {
      const param = match[1];
      context.navigate(`/my-feature?param=${param}`);
      context.showNotification?.(`Processing ${param}`, 'info');
    },
    description: 'Do something with parameter',
    examples: ['do something with data', 'do something with info'],
    requiresConfirmation: false
  }
];
```

2. **Add to allVoiceCommands** array:
```typescript
export const allVoiceCommands: VoiceCommandHandler[] = [
  ...emergencyCommands,
  ...myFeatureCommands, // Add your commands
  ...gigBoardCommands,
  // ...
];
```

3. **Optional: Add Multi-Step Workflow**:
```typescript
export const workflows = {
  myWorkflow: {
    steps: [
      { prompt: 'First question?', field: 'field1' },
      { prompt: 'Second question?', field: 'field2' }
    ]
  }
};
```

## Command Confirmation

Critical actions require confirmation for safety:
- Job posting
- Emergency reporting
- Account changes
- Payment actions

When a command requires confirmation:
1. System shows confirmation dialog
2. User can confirm via button or voice ("yes"/"no")
3. Command executes only after confirmation

## Requirements Validation

This implementation satisfies all Task 11 requirements:

- ✓ Integrate voice commands with gig board (post job, search jobs, apply)
- ✓ Add voice navigation for service navigator (find services, call service)
- ✓ Implement voice-activated emergency alerts (report emergency, check alerts)
- ✓ Create voice shortcuts for common actions (go home, view profile, check notifications)
- ✓ Build voice command help system with available commands
- ✓ Add voice confirmation for critical actions
- ✓ Implement multi-step voice workflows with context retention

## Testing

Test voice commands in a supported browser:

1. Click microphone button to start listening
2. Speak a command clearly
3. Wait for visual/audio feedback
4. Confirm critical actions when prompted
5. Say "help" to see all available commands

## Troubleshooting

**Microphone not working:**
- Check browser permissions
- Ensure HTTPS connection (required for microphone access)
- Try a different browser

**Commands not recognized:**
- Speak clearly and naturally
- Check the help system for exact command patterns
- Ensure no background noise

**No voice feedback:**
- Check system volume
- Verify browser supports speech synthesis
- Check voice settings in the interface
