# Development Guide

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Git
- (Optional) Node.js 18+ and Python 3.11+ for local development

### Project Structure
```
realoffice/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   │   ├── users.py       # User CRUD operations
│   │   │   ├── workspaces.py  # Workspace management
│   │   │   ├── zones_objects.py # Zones and objects
│   │   │   └── websocket.py   # WebSocket handler
│   │   ├── core/              # Core configuration
│   │   │   ├── config.py      # Settings management
│   │   │   ├── database.py    # Database connection
│   │   │   └── redis.py       # Redis connection
│   │   ├── models/            # Database models
│   │   │   └── models.py      # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   │   └── schemas.py     # Request/response models
│   │   ├── services/          # Business logic
│   │   │   └── websocket.py   # Connection manager
│   │   └── main.py            # Application entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── init_db.py            # Database initialization
├── frontend/                  # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AvatarSelector.tsx
│   │   │   ├── ChatBox.tsx
│   │   │   ├── GameCanvas.tsx
│   │   │   └── LoginScreen.tsx
│   │   ├── services/         # API clients
│   │   │   ├── api.ts        # REST API client
│   │   │   └── websocket.ts  # WebSocket client
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx           # Main application
│   │   ├── index.tsx         # Entry point
│   │   └── index.css         # Global styles
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml        # Service orchestration
├── README.md                 # User documentation
├── ARCHITECTURE.md           # Architecture overview
└── DEVELOPMENT.md           # This file
```

## Development Workflow

### Starting the Application
```bash
# Start all services
docker compose up --build

# Start in detached mode
docker compose up -d --build

# View logs
docker compose logs -f [service_name]

# Stop services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

### Local Development (Without Docker)

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://realoffice:realoffice@localhost:5432/realoffice"
export REDIS_URL="redis://localhost:6379"
export CORS_ORIGINS="http://localhost:3000"

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export REACT_APP_API_URL="http://localhost:8000"
export REACT_APP_WS_URL="ws://localhost:8000/ws"

# Start dev server
npm start
```

## Adding New Features

### Adding a New API Endpoint

1. **Define the Pydantic schema** in `backend/app/schemas/schemas.py`
```python
class NewFeature(BaseModel):
    name: str
    value: int
```

2. **Create the database model** in `backend/app/models/models.py`
```python
class NewFeature(Base):
    __tablename__ = "new_features"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    value = Column(Integer)
```

3. **Create the API endpoint** in `backend/app/api/new_feature.py`
```python
from fastapi import APIRouter
router = APIRouter(prefix="/api/features", tags=["features"])

@router.post("/")
def create_feature(feature: NewFeature):
    # Implementation
    pass
```

4. **Register the router** in `backend/app/main.py`
```python
from app.api import new_feature
app.include_router(new_feature.router)
```

### Adding a New React Component

1. **Create the component** in `frontend/src/components/NewComponent.tsx`
```tsx
import React from 'react';

interface NewComponentProps {
  title: string;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title }) => {
  return <div>{title}</div>;
};
```

2. **Use the component** in your app
```tsx
import { NewComponent } from './components/NewComponent';

function App() {
  return <NewComponent title="Hello" />;
}
```

### Adding WebSocket Message Types

1. **Define the message type** in backend `app/api/websocket.py`
```python
elif message_type == "new_action":
    data = data.get("data", {})
    # Handle new action
    await manager.broadcast_to_workspace(workspace_id, {
        "type": "new_action",
        "data": data
    })
```

2. **Handle in frontend** `src/services/websocket.ts`
```typescript
// Add method to WebSocketService
sendNewAction(actionData: any) {
  if (this.ws && this.ws.readyState === WebSocket.OPEN) {
    this.ws.send(JSON.stringify({
      type: 'new_action',
      data: actionData
    }));
  }
}
```

3. **Listen in App.tsx**
```typescript
ws.onMessage((message) => {
  if (message.type === 'new_action') {
    // Handle the new action
  }
});
```

## Testing

### Backend Testing
```bash
cd backend

# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests (once tests are created)
pytest
```

### Frontend Testing
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Common Issues & Solutions

### Issue: Docker build fails with SSL errors
**Solution**: Network/proxy configuration issue. Try building without Docker or check proxy settings.

### Issue: WebSocket connection fails
**Solution**: 
- Check backend is running on port 8000
- Verify CORS settings in backend
- Check browser console for errors

### Issue: Database migration needed
**Solution**:
```bash
# Delete and recreate containers
docker compose down -v
docker compose up --build
```

### Issue: Frontend won't compile
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Code Style Guidelines

### Python (Backend)
- Follow PEP 8
- Use type hints
- Keep functions small and focused
- Use async/await for I/O operations

### TypeScript (Frontend)
- Use functional components
- Prefer `const` over `let`
- Use TypeScript types, not `any`
- Keep components small and reusable

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)

### Frontend
- `REACT_APP_API_URL` - Backend API base URL
- `REACT_APP_WS_URL` - WebSocket server URL

## Debugging

### Backend Debugging
```bash
# View backend logs
docker compose logs -f backend

# Access backend container
docker compose exec backend bash

# Check database
docker compose exec postgres psql -U realoffice -d realoffice
```

### Frontend Debugging
- Use browser DevTools (F12)
- Check Console for errors
- Use Network tab for API calls
- Use Application tab for WebSocket messages

### Database Inspection
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U realoffice -d realoffice

# List tables
\dt

# Describe table
\d users

# Query
SELECT * FROM users;
```

## Performance Tips

### Backend
- Use database indexes for frequently queried fields
- Implement connection pooling
- Cache frequently accessed data
- Use async operations

### Frontend
- Minimize re-renders with React.memo
- Use useCallback and useMemo hooks
- Optimize Canvas rendering
- Debounce frequent operations

## Deployment

### Production Considerations
1. Remove or secure debugging endpoints
2. Set secure CORS origins
3. Use environment secrets management
4. Enable HTTPS/WSS
5. Set up logging and monitoring
6. Configure database backups
7. Use production-grade web server (nginx)
8. Implement rate limiting
9. Add authentication/authorization

### Docker Production Build
```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Run in production mode
docker compose -f docker-compose.prod.yml up -d
```

## Contributing
1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Code review
6. Merge to main
