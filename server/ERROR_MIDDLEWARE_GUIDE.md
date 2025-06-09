# Error Middleware Guide

This guide explains how to use the comprehensive error handling middleware in your Express.js application.

## Features

✅ **Centralized Error Handling** - All errors are handled in one place  
✅ **MongoDB/Mongoose Error Handling** - Automatic handling of validation, cast, and duplicate key errors  
✅ **JWT Error Handling** - Handles token validation and expiration errors  
✅ **Development vs Production** - Different error responses for different environments  
✅ **Common Error Utilities** - Pre-built error types for common scenarios  
✅ **Async Error Catching** - Automatic error catching for async functions  
✅ **404 Route Handling** - Automatic handling of undefined routes  

## Setup

The error middleware is already integrated into your `app.js` file:

```javascript
import errorHandler, { notFound } from "./middlewares/error.middleware.js"

// ... your routes ...

// Handle undefined routes (404 errors)
app.all('*', notFound)

// Global error handling middleware (must be last)
app.use(errorHandler)
```

## Usage Examples

### 1. Using `catchAsync` for Async Routes

```javascript
import { catchAsync, commonErrors } from "../middlewares/error.middleware.js";

router.get("/users/:id", catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        throw commonErrors.notFound('User');
    }
    
    res.json({ status: 'success', data: { user } });
}));
```

### 2. Using `next()` to Pass Errors

```javascript
router.post("/users", (req, res, next) => {
    if (!req.body.email) {
        return next(commonErrors.missingFields(['email']));
    }
    
    // ... rest of your logic
});
```

### 3. Custom Errors with `AppError`

```javascript
import { AppError } from "../middlewares/error.middleware.js";

router.get("/custom", (req, res, next) => {
    const customError = new AppError('Custom error message', 400);
    next(customError);
});
```

## Common Error Types

### Authentication Errors
- `commonErrors.unauthorized()` - 401: Not logged in
- `commonErrors.forbidden()` - 403: No permission

### Resource Errors
- `commonErrors.notFound('User')` - 404: Resource not found
- `commonErrors.alreadyExists('Email')` - 409: Resource already exists

### Validation Errors
- `commonErrors.invalidInput('Invalid email')` - 400: Invalid input
- `commonErrors.missingFields(['email', 'password'])` - 400: Missing required fields

### Server Errors
- `commonErrors.serverError()` - 500: Internal server error
- `commonErrors.databaseError()` - 500: Database connection error

### Rate Limiting
- `commonErrors.tooManyRequests()` - 429: Too many requests

## Error Response Format

### Development Environment
```json
{
    "status": "error",
    "error": { /* full error object */ },
    "message": "Error message",
    "stack": "Error stack trace"
}
```

### Production Environment
```json
{
    "status": "error",
    "message": "Error message"
}
```

## Automatic Error Handling

The middleware automatically handles these error types:

- **MongoDB CastError** - Invalid ObjectId
- **MongoDB Duplicate Key** - Duplicate field values
- **Mongoose ValidationError** - Schema validation failures
- **JWT Errors** - Invalid or expired tokens

## Environment Configuration

Set `NODE_ENV=development` for detailed error information during development.
Set `NODE_ENV=production` for secure error responses in production.

## Best Practices

1. **Always use `catchAsync`** for async route handlers
2. **Use specific error types** from `commonErrors` when possible
3. **Don't expose sensitive information** in error messages
4. **Log errors appropriately** for debugging
5. **Test error scenarios** to ensure proper handling

## Testing Your Error Middleware

You can test the error middleware by visiting these example endpoints:

- `GET /api/test/error-types/unauthorized` - Test 401 error
- `GET /api/test/error-types/forbidden` - Test 403 error
- `GET /api/test/error-types/not-found` - Test 404 error
- `GET /api/test/error-types/validation` - Test 400 validation error
- `GET /nonexistent-route` - Test 404 for undefined routes

## Integration with Your Existing Routes

Update your existing route files to use the error middleware:

```javascript
// Before
router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// After
router.get("/users/:id", catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        throw commonErrors.notFound('User');
    }
    
    res.json({ status: 'success', data: { user } });
}));
```

This error middleware will make your API more robust, consistent, and easier to debug!
