# Architecture Overview

## System Components

### Frontend (React + TypeScript)
- **Technology**: React 18, TypeScript, Canvas API
- **Port**: 3000
- **Key Features**:
  - 2D tile-based rendering
  - Real-time position updates
  - Dual chat system (global + proximity)
  - Avatar customization

### Backend (FastAPI)
- **Technology**: Python 3.11, FastAPI, SQLAlchemy
- **Port**: 8000
- **Key Features**:
  - REST API for CRUD operations
  - WebSocket server for real-time communication
  - Database ORM with PostgreSQL
  - Redis integration for presence

### Database (PostgreSQL)
- **Port**: 5432
- **Tables**:
  - `workspaces` - Virtual office spaces
  - `users` - User accounts and positions
  - `zones` - Defined areas (rooms, meeting spaces)
  - `interactive_objects` - Desks, chairs, etc.

### Cache (Redis)
- **Port**: 6379
- **Usage**: Real-time presence tracking

## Data Flow

### User Movement
```
User Input (WASD/Arrows)
    ↓
React State Update
    ↓
WebSocket Send (position)
    ↓
FastAPI WebSocket Handler
    ↓
Connection Manager
    ↓
Broadcast to all users in workspace
    ↓
Other clients receive update
    ↓
Canvas re-render
```

### Chat Messages
```
User types message
    ↓
React ChatBox component
    ↓
WebSocket Send (chat message)
    ↓
FastAPI WebSocket Handler
    ↓
Proximity check (if proximity chat)
    ↓
Send to appropriate users
    ↓
Clients receive and display message
```

## WebSocket Protocol

### Connection
- URL: `ws://localhost:8000/ws/{workspace_id}/{user_id}`
- Automatic reconnection on disconnect

### Message Types

#### Position Update (Client → Server)
```json
{
  "type": "position",
  "data": {
    "x": 10.5,
    "y": 15.2
  }
}
```

#### Chat Message (Client → Server)
```json
{
  "type": "chat",
  "data": {
    "message": "Hello!",
    "chat_type": "global",
    "username": "Alice"
  }
}
```

#### State Request (Client → Server)
```json
{
  "type": "request_state",
  "data": {}
}
```

#### Position Broadcast (Server → Client)
```json
{
  "type": "position",
  "data": {
    "user_id": 1,
    "x": 10.5,
    "y": 15.2,
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

#### User Events (Server → Client)
```json
{
  "type": "user_joined",
  "data": {
    "user_id": 2,
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

## Security Considerations

### Current Implementation (MVP)
- No authentication/authorization
- No input sanitization
- No rate limiting
- Open CORS policy

### Production Recommendations
1. Add JWT-based authentication
2. Implement rate limiting on WebSocket messages
3. Sanitize user inputs
4. Restrict CORS to specific domains
5. Add SSL/TLS certificates
6. Implement proper session management
7. Add CSRF protection

## Scalability Considerations

### Current Limitations
- Single backend instance
- In-memory connection management
- No horizontal scaling

### Improvements for Scale
1. Use Redis pub/sub for cross-server communication
2. Implement load balancing
3. Add sticky sessions for WebSocket connections
4. Use a message queue (RabbitMQ/Kafka)
5. Implement database connection pooling
6. Add caching layers
7. Use CDN for static assets

## Performance Optimizations

### Frontend
- Canvas rendering uses requestAnimationFrame
- Delta-time based movement
- Only render visible entities
- Debounce position updates

### Backend
- Async/await throughout
- Connection pooling for database
- WebSocket connection reuse
- Efficient proximity calculations

## Monitoring & Debugging

### Health Checks
- Backend: `GET /health`
- Database: Container health checks
- Redis: Container health checks

### Logs
- Backend: uvicorn console output
- Frontend: Browser console
- Docker: `docker compose logs [service]`

### Metrics to Track
- Active WebSocket connections
- Messages per second
- API response times
- Database query times
- User session duration
