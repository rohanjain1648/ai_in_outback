# Accessibility & Multi-Language Support

This module provides comprehensive accessibility features and multi-language support for the Rural Connect AI platform, ensuring WCAG AAA compliance and inclusive design.

## Features

### 1. Visual Accessibility
- **High Contrast Mode**: WCAG AAA compliant color scheme with enhanced contrast ratios
- **Adjustable Text Size**: Four size options (small, medium, large, extra-large)
- **Reduced Motion**: Minimizes animations for users with motion sensitivity
- **Focus Indicators**: Enhanced keyboard focus visibility

### 2. Multi-Language Support
- **Language Selector**: Support for multiple languages including:
  - English (Australian)
  - Aboriginal language terms
  - Spanish
  - Chinese
  - Arabic
  - Vietnamese
- **Aboriginal Language**: Key terms and phrases in Aboriginal language
- **Translation Service**: Integration with Google Translate API for dynamic translation

### 3. Keyboard Navigation
- **Skip to Content**: Quick navigation to main content (Alt + M)
- **Keyboard Shortcuts**: 
  - Alt + A: Open accessibility panel
  - Ctrl + K: Search
  - Tab: Navigate between elements
- **Focus Management**: Proper focus trapping in modals and dialogs
- **ARIA Labels**: Comprehensive ARIA labels throughout the application

### 4. Screen Reader Support
- **Semantic HTML**: Proper use of semantic elements
- **ARIA Live Regions**: Dynamic content announcements
- **Screen Reader Optimization**: Toggle for enhanced screen reader experience
- **Descriptive Labels**: All interactive elements have descriptive labels

### 5. Sound & Voice
- **Sound Effects**: Toggle for notification sounds
- **Voice Feedback**: Toggle for text-to-speech feedback
- **Haptic Feedback**: Mobile device vibration support

## Components

### AccessibilityProvider
Context provider that manages accessibility settings across the application.

```tsx
import { AccessibilityProvider } from './contexts/AccessibilityContext';

<AccessibilityProvider>
  <App />
</AccessibilityProvider>
```

### AccessibilityButton
Floating button that opens the accessibility panel.

```tsx
import { AccessibilityButton } from './components/accessibility';

<AccessibilityButton />
```

### AccessibilityPanel
Comprehensive settings panel with three tabs:
- Visual: High contrast, text size, reduced motion
- Language: Language selection and translation
- Navigation: Keyboard shortcuts, screen reader optimization

### SkipToContent
Skip link for keyboard users to jump to main content.

```tsx
import { SkipToContent } from './components/accessibility';

<SkipToContent />
```

## Usage

### Using Accessibility Context

```tsx
import { useAccessibility } from './contexts/AccessibilityContext';

function MyComponent() {
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();
  
  // Check if high contrast is enabled
  if (settings.highContrastMode) {
    // Apply high contrast styles
  }
  
  // Announce to screen reader
  announceToScreenReader('Action completed successfully');
  
  return <div>...</div>;
}
```

### Translation Service

```tsx
import { translationService } from './services/translationService';

// Translate text
const translated = await translationService.translate(
  'Welcome to Rural Connect AI',
  'es' // Spanish
);

// Get Aboriginal term
const term = translationService.getAboriginalTerm('community'); // Returns 'Mob'
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Alt + M | Skip to main content |
| Alt + A | Open accessibility panel |
| Ctrl + K | Search |
| Tab | Navigate forward |
| Shift + Tab | Navigate backward |
| Enter/Space | Activate button/link |
| Escape | Close modal/panel |

## WCAG Compliance

This implementation follows WCAG 2.1 Level AAA guidelines:

- ✅ **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text, 3:1 for large text
- ✅ **1.4.6 Contrast (Enhanced)**: 7:1 for normal text, 4.5:1 for large text
- ✅ **1.4.12 Text Spacing**: Adjustable text size and spacing
- ✅ **2.1.1 Keyboard**: All functionality available via keyboard
- ✅ **2.4.1 Bypass Blocks**: Skip to content link
- ✅ **2.4.7 Focus Visible**: Enhanced focus indicators
- ✅ **3.1.1 Language of Page**: Language attribute on HTML element
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA labels and roles

## Aboriginal Language Support

The system includes translations for key terms in Aboriginal language:

- **Greetings**: Wudjari (hello), Kaya (welcome), Ngayu (thank you)
- **Community**: Mob (community), Yumari (family), Marlu (friend)
- **Nature**: Kapi (water), Waru (fire), Ngura (country)
- **Actions**: Palya (help), Yunti (share), Wangka (connect)

Note: Aboriginal language support is limited to key terms. Full translation is not available.

## Testing

### Manual Testing
1. Enable high contrast mode and verify all text is readable
2. Test keyboard navigation through all interactive elements
3. Use a screen reader (NVDA, JAWS, VoiceOver) to verify announcements
4. Test with different text sizes
5. Verify reduced motion disables animations

### Automated Testing
```bash
npm run test:accessibility
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch optimization

## Configuration

### Environment Variables

```env
# Google Translate API key (optional)
VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

If no API key is provided, the system will:
- Use Aboriginal language translations for supported terms
- Fall back to original text for unsupported languages

## Best Practices

1. **Always use semantic HTML**: Use proper heading hierarchy, lists, and landmarks
2. **Provide text alternatives**: All images should have alt text
3. **Test with keyboard only**: Ensure all functionality is accessible via keyboard
4. **Use ARIA sparingly**: Only when semantic HTML is insufficient
5. **Announce dynamic changes**: Use announceToScreenReader for important updates
6. **Maintain focus management**: Ensure focus is properly managed in modals and dialogs

## Future Enhancements

- [ ] Additional language support
- [ ] Voice command integration
- [ ] Dyslexia-friendly font option
- [ ] Color blindness simulation modes
- [ ] More Aboriginal language translations
- [ ] Sign language video support

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)
- [Aboriginal Language Resources](https://aiatsis.gov.au/)
