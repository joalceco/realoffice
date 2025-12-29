# Technical Debt & Future Improvements

This document tracks technical debt and areas for improvement identified during code review and development.

## High Priority

### 1. Web Audio API for Speaking Detection
**Location**: `frontend/src/services/voice.ts:263`
**Issue**: Audio level detection uses `Math.random()` placeholder
**Impact**: Speaking indicators don't accurately reflect actual audio
**Solution**: Implement proper Web Audio API's AnalyserNode
```typescript
// Example implementation:
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaStreamSource(stream);
source.connect(analyser);
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);
// Use dataArray to detect audio levels
```

### 2. User Information Caching
**Location**: `frontend/src/App.tsx:126-141`
**Issue**: API calls inside WebSocket message handler for user lookups
**Impact**: Performance degradation with frequent position updates
**Solution**: Implement user information cache
```typescript
// Cache user data on join
const userCache = new Map<number, User>();
// Update cache on user_joined events
// Use cache for username lookups instead of API calls
```

### 3. Position Indexing
**Location**: `backend/app/api/websocket.py:147-153`
**Issue**: O(n) iteration through all positions for state requests
**Impact**: Slow state sync with many users
**Solution**: Index positions by workspace_id
```python
# In ConnectionManager:
self.positions_by_workspace: Dict[int, Dict[int, Position]] = {}
# Maintain separate index for faster workspace queries
```

## Medium Priority

### 4. TypeScript Type Safety
**Location**: `frontend/src/services/voice.ts:276-281`
**Issue**: Uses `as any` to bypass type checking for `displaySurface`
**Impact**: Loses type safety, potential runtime errors
**Solution**: Use proper TypeScript types or feature detection
```typescript
// Option 1: Define proper types
interface DisplayMediaOptions {
  video?: boolean | {
    displaySurface?: 'monitor' | 'window' | 'application';
  };
  audio?: boolean;
}

// Option 2: Feature detection
if ('getDisplayMedia' in navigator.mediaDevices) {
  // Use feature with proper type checking
}
```

### 5. Code Duplication in Validation
**Location**: `validate.py:12-19`
**Issue**: Duplicated validation functions for files/directories
**Impact**: Code maintenance burden
**Solution**: Create generic validation function
```python
def validate_path(path, description, path_type='file'):
    exists = os.path.isfile(path) if path_type == 'file' else os.path.isdir(path)
    # Rest of logic
```

## Low Priority

### 6. WebRTC Mesh Topology Scalability
**Current**: Mesh topology (everyone connects to everyone)
**Issue**: Doesn't scale beyond ~10 users
**Solution**: Implement SFU (Selective Forwarding Unit)
- Use library like mediasoup or Janus
- Single connection per user to SFU
- SFU forwards streams to other users

### 7. Chat Message Persistence
**Current**: Messages only in memory
**Issue**: Lost on page refresh
**Solution**: Store messages in database
- Add `messages` table
- Limit to last N messages per workspace
- Load history on join

### 8. Connection State Management
**Issue**: No explicit connection state machine
**Solution**: Implement connection state enum
```typescript
enum ConnectionState {
  Disconnected,
  Connecting,
  Connected,
  Reconnecting,
  Failed
}
```

### 9. Error Boundaries
**Issue**: No React error boundaries
**Solution**: Add error boundaries for graceful degradation
```tsx
<ErrorBoundary fallback={<ErrorUI />}>
  <App />
</ErrorBoundary>
```

### 10. Logging Infrastructure
**Issue**: Console.log for all logging
**Solution**: Implement proper logging library
- Frontend: Use structured logging (e.g., loglevel)
- Backend: Configure Python logging with levels
- Send errors to monitoring service

## Performance Optimizations

### 11. Position Update Throttling
**Current**: Sends position on every frame
**Optimization**: Throttle to 20 updates/second
```typescript
const throttledPositionUpdate = throttle((x, y) => {
  wsService.sendPosition(x, y);
}, 50); // 20 Hz
```

### 12. Canvas Rendering Optimization
**Current**: Redraws everything every frame
**Optimization**: Use dirty rectangles or layers
```typescript
// Only redraw changed regions
if (playerMoved || chatUpdate) {
  redrawDirtyRegion(x, y, width, height);
}
```

### 13. Bundle Size Optimization
**Current**: ~500 KB production bundle
**Optimization**: Code splitting and lazy loading
```typescript
const ScreenViewer = lazy(() => import('./components/ScreenViewer'));
// Load only when needed
```

## Security Hardening

### 14. Input Sanitization
**Priority**: HIGH for production
**Required**:
- Sanitize username input (prevent XSS)
- Validate position coordinates (prevent out of bounds)
- Rate limit WebSocket messages

### 15. Authentication & Authorization
**Priority**: HIGH for production
**Required**:
- JWT-based authentication
- Session management
- Role-based access control
- Secure password storage

### 16. CORS Configuration
**Current**: Allows all origins in development
**Required**: Restrict to specific domains in production
```python
CORS_ORIGINS = "https://app.realoffice.com,https://www.realoffice.com"
```

## Testing Infrastructure

### 17. Unit Tests
**Missing**: No unit tests
**Recommended**:
- Backend: pytest for API endpoints
- Frontend: Jest + React Testing Library
- Coverage target: >80%

### 18. Integration Tests
**Missing**: No integration tests
**Recommended**:
- WebSocket connection tests
- WebRTC connection tests
- End-to-end user flows

### 19. Load Testing
**Missing**: No performance testing
**Recommended**:
- Use Locust for backend load testing
- Test with 50, 100, 200 concurrent users
- Identify breaking points

## Documentation Improvements

### 20. API Versioning
**Current**: No API versioning
**Recommended**: Add version prefix `/api/v1/`

### 21. OpenAPI Schema
**Current**: Auto-generated
**Recommended**: Add detailed descriptions and examples

### 22. Inline Code Comments
**Current**: Minimal comments
**Recommended**: Add JSDoc/docstrings for complex functions

## Monitoring & Observability

### 23. Application Metrics
**Missing**: No metrics collection
**Recommended**:
- Prometheus metrics
- Grafana dashboards
- Alert on error rates

### 24. Distributed Tracing
**Missing**: No request tracing
**Recommended**: OpenTelemetry for request tracing

### 25. Health Checks
**Current**: Basic `/health` endpoint
**Recommended**: Detailed health checks
- Database connection
- Redis connection
- WebSocket server status

## Mobile Support

### 26. Touch Controls
**Missing**: No mobile touch support
**Recommended**: Add touch event handlers
```typescript
// Touch-based movement
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
```

### 27. Responsive Layout
**Current**: Fixed viewport sizes
**Recommended**: Media queries and flexible layouts

## Accessibility

### 28. Keyboard Navigation
**Current**: Movement only
**Recommended**: Full keyboard navigation
- Tab through UI elements
- Keyboard shortcuts
- Screen reader support

### 29. ARIA Labels
**Missing**: No ARIA labels
**Recommended**: Add semantic HTML and ARIA attributes

### 30. Color Contrast
**Current**: May not meet WCAG AA
**Recommended**: Audit and fix contrast ratios

## DevOps & Deployment

### 31. CI/CD Pipeline
**Missing**: No automated deployment
**Recommended**: GitHub Actions workflow
- Run tests
- Build Docker images
- Deploy to staging/production

### 32. Environment Configuration
**Current**: .env files
**Recommended**: Use secrets management
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

### 33. Database Migrations
**Missing**: No migration system
**Recommended**: Use Alembic
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Conclusion

This technical debt is manageable and doesn't prevent the MVP from being functional. However, addressing these items would improve:
- **Performance**: Caching, throttling, indexing
- **Scalability**: SFU topology, better data structures
- **Security**: Authentication, input validation
- **Maintainability**: Tests, documentation, monitoring
- **User Experience**: Mobile support, accessibility

Priority should be given to security hardening before production deployment.
