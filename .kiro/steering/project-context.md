---
inclusion: always
---

# Rural Connect AI - Project Context

## Project Overview
Rural Connect AI is an intelligent community platform designed for regional and rural Australia, addressing social isolation, limited service access, and economic challenges through AI-powered features and voice-first accessibility.

## Key Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + MongoDB
- **3D Graphics**: Three.js + React Three Fiber
- **Blockchain**: ethers.js + Polygon Mumbai testnet
- **Real-time**: Socket.io
- **Voice**: Web Speech API
- **Testing**: Jest + React Testing Library + Playwright

## Code Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` or proper types

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Add ARIA labels for accessibility
- Use semantic HTML elements
- Implement keyboard navigation

### API Design
- RESTful endpoints with proper HTTP methods
- Consistent error responses with status codes
- Input validation using express-validator
- Rate limiting on all endpoints
- JWT authentication where needed

### Testing
- Unit tests for utilities and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Accessibility tests with jest-axe
- Aim for 80%+ coverage

## Feature Patterns

### Voice Interface
- Always provide text fallback
- Handle microphone permission errors
- Show visual feedback during listening
- Support natural language commands
- Provide voice output for key actions

### Blockchain Integration
- Queue transactions for offline mode
- Show clear transaction status
- Handle network errors gracefully
- Provide public verification links
- Cache credentials locally

### Accessibility
- WCAG AAA compliance required
- Support keyboard navigation
- Provide screen reader labels
- High contrast mode support
- Adjustable text sizes

## Common Patterns

### Error Handling
```typescript
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

### API Service Pattern
```typescript
export const serviceAPI = {
  async getAll(): Promise<ApiResponse<Item[]>> {
    const response = await fetch('/api/items');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }
};
```

### Component Structure
```typescript
interface Props {
  // Props with JSDoc comments
}

export const Component: React.FC<Props> = ({ prop }) => {
  // Hooks at top
  const [state, setState] = useState();
  
  // Event handlers
  const handleAction = () => {};
  
  // Render
  return <div>...</div>;
};
```

## Development Workflow
1. Check requirements in `.kiro/specs/hackathon-enhancements/requirements.md`
2. Review design in `.kiro/specs/hackathon-enhancements/design.md`
3. Follow tasks in `.kiro/specs/hackathon-enhancements/tasks.md`
4. Write tests first (TDD)
5. Implement feature
6. Run linting and tests
7. Update documentation

## Demo Credentials
- Email: demo@ruralconnect.au
- Password: demo2024

## Important Notes
- This is a hackathon project showcasing Kiro's spec-driven development
- Focus on demonstrating features over production-ready infrastructure
- Mock data is acceptable for demo purposes
- Prioritize user experience and accessibility
