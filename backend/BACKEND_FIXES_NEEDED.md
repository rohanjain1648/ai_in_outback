# Backend Fixes Required

## Critical Issues to Fix

### 1. Chat Routes - FIXED
- ✅ Changed `authenticateToken` to `authenticate`
- ✅ Added proper TypeScript types
- ⚠️ Need to add type casting for static methods

### 2. Missing Dependencies
```bash
npm install express-validator
```

### 3. Response Utility Functions
The `successResponse` and `errorResponse` functions have inconsistent signatures across files.

### 4. Redis Client Methods
The RedisClient wrapper uses `setEx` but should use the `set` method with expiration parameter.

### 5. User Model Export
Some files import `User` as default export, but it should be named export.

## Quick Fix Commands

Run these in the backend directory:

```bash
# Install missing dependencies
npm install express-validator

# Build to see remaining errors
npm run build
```

## Files That Need Manual Review

1. `src/routes/chat.ts` - Type casting for Mongoose static methods
2. `src/routes/skills.ts` - Response utility function signatures
3. `src/routes/resources.ts` - Response utility function signatures
4. `src/routes/services.ts` - Missing validate middleware
5. `src/services/socketService.ts` - Redis method calls
6. `src/services/wellbeingService.ts` - User import
7. `src/validation/wellbeingValidation.ts` - express-validator import

## Recommended Approach

For now, to get the backend running:

1. Install express-validator
2. Comment out problematic routes temporarily
3. Start with core functionality (auth, users, resources)
4. Gradually uncomment and fix routes one by one
