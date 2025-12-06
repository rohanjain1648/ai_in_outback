---
inclusion: fileMatch
fileMatchPattern: "**/*.tsx"
---

# Accessibility Standards for Rural Connect AI

## WCAG AAA Compliance Required

All React components must meet WCAG AAA standards for accessibility.

## Required Practices

### Semantic HTML
- Use proper HTML5 semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- Use `<button>` for actions, `<a>` for navigation
- Use proper heading hierarchy (h1 → h2 → h3)

### ARIA Labels
```typescript
// Good
<button aria-label="Close notification">
  <X className="w-4 h-4" />
</button>

// Bad
<button>
  <X className="w-4 h-4" />
</button>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Implement proper focus management
- Use `tabIndex` appropriately
- Provide skip links for navigation

```typescript
// Example
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
>
  Action
</button>
```

### Color Contrast
- Text must have 7:1 contrast ratio (AAA)
- Large text must have 4.5:1 contrast ratio
- Use tools to verify contrast ratios

### Focus Indicators
- Visible focus indicators required
- Use outline or custom focus styles
- Never use `outline: none` without replacement

```css
button:focus-visible {
  outline: 2px solid #4F46E5;
  outline-offset: 2px;
}
```

### Screen Reader Support
- Provide descriptive labels
- Use `aria-live` for dynamic content
- Use `aria-describedby` for additional context
- Hide decorative elements with `aria-hidden="true"`

```typescript
<div 
  role="alert" 
  aria-live="polite"
  aria-atomic="true"
>
  {message}
</div>
```

### Form Accessibility
- Label all form inputs
- Provide error messages
- Use `aria-invalid` and `aria-describedby`

```typescript
<div>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <span id="email-error" role="alert">
      Please enter a valid email
    </span>
  )}
</div>
```

### Testing
- Use jest-axe for automated testing
- Test with keyboard only
- Test with screen reader (NVDA/JAWS)
- Verify with Lighthouse accessibility audit

## Voice Interface Accessibility
- Provide text alternatives for voice commands
- Show visual feedback during voice input
- Allow switching between voice and text input
- Provide clear error messages

## Mobile Accessibility
- Touch targets minimum 44x44px
- Support pinch-to-zoom
- Provide haptic feedback where appropriate
- Test with mobile screen readers (TalkBack/VoiceOver)
