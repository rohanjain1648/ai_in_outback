# Testing Documentation - Rural Connect AI

This document provides comprehensive information about the testing strategy, test suites, and how to run tests for the Rural Connect AI platform.

## Overview

The Rural Connect AI platform implements a comprehensive testing strategy that includes:

- **Unit Tests**: Testing individual components and functions
- **Integration Tests**: Testing API endpoints and service interactions
- **End-to-End Tests**: Testing complete user workflows
- **Performance Tests**: Testing Three.js rendering and application performance
- **Accessibility Tests**: Ensuring WCAG 2.1 compliance
- **Mobile Device Tests**: Testing mobile-specific functionality

## Test Structure

```
__tests__/
├── integration/           # API integration tests
├── e2e/                  # End-to-end user journey tests
├── performance/          # Performance and Three.js tests
├── accessibility/        # Accessibility compliance tests
├── mobile/              # Mobile device specific tests
├── App.test.tsx         # Main app component tests
└── three/               # Three.js component tests

src/__tests__/           # Frontend unit tests
├── components/          # Component tests
├── hooks/              # Custom hook tests
├── services/           # Service layer tests
└── utils/              # Utility function tests

backend/src/__tests__/   # Backend unit tests
├── routes/             # API route tests
├── services/           # Business logic tests
├── models/             # Data model tests
└── middleware/         # Middleware tests
```

## Running Tests

### Quick Start

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:frontend      # Frontend unit tests only
npm run test:backend       # Backend unit tests only
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:performance  # Performance tests
npm run test:accessibility # Accessibility tests
npm run test:mobile       # Mobile device tests

# Run with coverage
npm run test:coverage
```

### Individual Test Commands

```bash
# Frontend tests
npm test                   # Run all frontend tests
npm run test:watch        # Run in watch mode
jest src/__tests__/components/  # Run specific component tests

# Backend tests
cd backend
npm test                   # Run all backend tests
npm run test:watch        # Run in watch mode
npm run test:unit         # Run unit tests only

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:accessibility

# Mobile tests
npm run test:mobile

# End-to-end tests
npm run test:e2e
```

## Test Categories

### 1. Unit Tests

**Frontend Unit Tests** (`src/__tests__/`)
- React component rendering and behavior
- Custom hook functionality
- Service layer methods
- Utility functions
- State management

**Backend Unit Tests** (`backend/src/__tests__/`)
- API route handlers
- Business logic services
- Data model validation
- Middleware functionality
- Database operations

### 2. Integration Tests

**API Integration Tests** (`__tests__/integration/`)
- Complete API workflows
- Database interactions
- Authentication flows
- Resource management
- Community matching
- Error handling
- Rate limiting
- Concurrent operations

### 3. End-to-End Tests

**User Journey Tests** (`__tests__/e2e/`)
- User registration and onboarding
- Resource discovery and management
- Community matching and connections
- Agricultural dashboard usage
- Emergency alert workflows
- Offline functionality
- Mobile responsiveness

### 4. Performance Tests

**Three.js Performance Tests** (`__tests__/performance/`)
- Scene rendering performance
- Animation frame rates
- Memory management
- LOD (Level of Detail) optimization
- Particle system performance
- Mobile performance optimization
- Adaptive quality system

### 5. Accessibility Tests

**WCAG 2.1 Compliance Tests** (`__tests__/accessibility/`)
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management
- ARIA attributes
- Alternative content for 3D scenes
- Mobile accessibility
- Reduced motion support

### 6. Mobile Device Tests

**Mobile-Specific Tests** (`__tests__/mobile/`)
- Responsive design
- Touch interactions
- Swipe gestures
- Geolocation services
- Device orientation
- Virtual keyboard handling
- Mobile performance optimization
- Offline functionality
- Network condition handling

## Test Configuration

### Jest Configuration

**Frontend** (`jest.config.js`)
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    // Path aliases for imports
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

**Backend** (`backend/jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
}
```

### Test Environment Setup

**Frontend Setup** (`src/setupTests.ts`)
```typescript
import '@testing-library/jest-dom';

// Mock Three.js for testing
jest.mock('three', () => ({
  // Three.js mocks
}));

// Mock React Three Fiber
jest.mock('@react-three/fiber', () => ({
  // R3F mocks
}));
```

**Backend Setup**
- Database connection mocking
- Redis connection mocking
- External API mocking
- Authentication middleware testing

## Writing Tests

### Frontend Component Tests

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });
  });
});
```

### Backend API Tests

```typescript
import request from 'supertest';
import server from '../server';

describe('API Routes', () => {
  let app: any;

  beforeAll(async () => {
    app = server.getApp();
  });

  it('should handle GET requests', async () => {
    const response = await request(app)
      .get('/api/v1/resources')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('Resource Management Flow', () => {
  it('should handle complete resource lifecycle', async () => {
    // 1. Create resource
    const createResponse = await request(app)
      .post('/api/v1/resources')
      .set('Authorization', `Bearer ${authToken}`)
      .send(resourceData)
      .expect(201);

    // 2. Search for resource
    const searchResponse = await request(app)
      .get('/api/v1/resources?search=test')
      .expect(200);

    // 3. Update resource
    const updateResponse = await request(app)
      .put(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);

    // 4. Delete resource
    await request(app)
      .delete(`/api/v1/resources/${resourceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
```

### Accessibility Tests

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Frontend**: 80% coverage for branches, functions, lines, and statements
- **Backend**: 85% coverage for branches, functions, lines, and statements
- **Integration Tests**: Cover all critical user workflows
- **E2E Tests**: Cover primary user journeys
- **Accessibility**: 100% compliance with WCAG 2.1 AA standards

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Console**: Summary displayed after test runs
- **HTML**: Detailed interactive reports in `coverage/` directory
- **LCOV**: For CI/CD integration
- **JSON**: Machine-readable format for tooling

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
      
      - name: Run all tests
        run: npm run test:all
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Data Management

### Test Database

- Separate test database for integration tests
- Database seeding for consistent test data
- Cleanup after each test suite
- Transaction rollback for isolated tests

### Mock Data

- Realistic test data that mirrors production
- Factories for generating test objects
- Fixtures for complex scenarios
- Anonymized production data samples

## Performance Benchmarks

### Frontend Performance Targets

- **Component Render Time**: < 16ms (60 FPS)
- **Three.js Scene Load**: < 2 seconds
- **Bundle Size**: < 2MB gzipped
- **First Contentful Paint**: < 1.5 seconds

### Backend Performance Targets

- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 100ms (average)
- **Memory Usage**: < 512MB per process
- **Concurrent Users**: 1000+ simultaneous connections

## Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor` and proper async/await
2. **Mock Cleanup**: Clear mocks between tests
3. **DOM Cleanup**: Use proper cleanup in React tests
4. **Database State**: Ensure clean state between tests
5. **Network Requests**: Mock external API calls

### Debugging Tools

- **Jest Debug Mode**: `node --inspect-brk node_modules/.bin/jest`
- **React DevTools**: For component debugging
- **Network Tab**: For API request debugging
- **Console Logs**: Strategic logging in tests

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how
2. **Arrange, Act, Assert**: Structure tests clearly
3. **One Assertion Per Test**: Keep tests focused
4. **Descriptive Test Names**: Make intent clear
5. **Independent Tests**: No dependencies between tests

### Frontend Testing

1. **User-Centric Tests**: Test from user perspective
2. **Accessibility First**: Include accessibility in all tests
3. **Mobile Considerations**: Test responsive behavior
4. **Performance Awareness**: Monitor render performance

### Backend Testing

1. **API Contract Testing**: Verify request/response formats
2. **Error Handling**: Test all error scenarios
3. **Security Testing**: Validate authentication and authorization
4. **Data Validation**: Test input validation thoroughly

## Maintenance

### Regular Tasks

- **Update Dependencies**: Keep testing libraries current
- **Review Coverage**: Identify gaps in test coverage
- **Performance Monitoring**: Track test execution times
- **Flaky Test Detection**: Identify and fix unreliable tests

### Test Refactoring

- **Remove Duplicate Tests**: Consolidate similar tests
- **Update Obsolete Tests**: Keep tests current with code changes
- **Improve Test Readability**: Make tests easier to understand
- **Optimize Test Performance**: Reduce test execution time

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)

### Tools

- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing utilities
- **Playwright**: End-to-end testing framework
- **jest-axe**: Accessibility testing with axe-core
- **Supertest**: HTTP assertion library

### Community

- [Testing JavaScript](https://testingjavascript.com/) - Kent C. Dodds
- [React Testing Patterns](https://react-testing-examples.com/)
- [Accessibility Testing Guide](https://web.dev/accessibility-testing/)

---

For questions or issues with testing, please refer to the project documentation or create an issue in the repository.