# Quick Reference

## 🚀 Quick Start
```bash
docker compose up --build
```
Visit: http://localhost:3000

## 🎮 Controls
- **Move**: Arrow Keys or WASD
- **Chat**: Type in chat box and press Send
- **Switch Chat**: Click Global or Proximity buttons

## 📡 Endpoints

### REST API
- `GET /api/workspaces` - List workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PATCH /api/users/{id}` - Update user
- `GET /api/zones` - List zones
- `GET /api/objects` - List objects

### WebSocket
- `ws://localhost:8000/ws/{workspace_id}/{user_id}`

## 💬 Message Types

### Send (Client → Server)
```json
{"type": "position", "data": {"x": 10, "y": 15}}
{"type": "chat", "data": {"message": "Hi", "chat_type": "global", "username": "Alice"}}
{"type": "request_state", "data": {}}
```

### Receive (Server → Client)
```json
{"type": "position", "data": {"user_id": 1, "x": 10, "y": 15}}
{"type": "chat", "data": {"user_id": 1, "username": "Alice", "message": "Hi"}}
{"type": "user_joined", "data": {"user_id": 2}}
{"type": "user_left", "data": {"user_id": 2}}
```

## 🐳 Docker Commands
```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f [service]

# Stop services
docker compose down

# Clean restart
docker compose down -v && docker compose up --build
```

## 🛠️ Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📊 Ports
- Frontend: 3000
- Backend: 8000
- PostgreSQL: 5432
- Redis: 6379

## 🎨 Avatars
- avatar1: Red (#FF6B6B)
- avatar2: Teal (#4ECDC4)
- avatar3: Blue (#45B7D1)
- avatar4: Orange (#FFA07A)
- avatar5: Green (#98D8C8)

## 📁 Key Files
```
/docker-compose.yml       # Service orchestration
/backend/app/main.py      # Backend entry point
/backend/app/api/         # API endpoints
/frontend/src/App.tsx     # Frontend entry point
/frontend/src/components/ # React components
```

## 🔍 Debugging
```bash
# Backend logs
docker compose logs -f backend

# Database access
docker compose exec postgres psql -U realoffice -d realoffice

# Frontend logs
Open browser console (F12)
```

## 📚 Documentation
- README.md - User guide
- ARCHITECTURE.md - System design
- DEVELOPMENT.md - Developer guide
- API.md - API reference
- FEATURES.md - Feature list
- UI_DESIGN.md - Visual design

## ✅ Validation
```bash
python3 validate.py
```

## 🌐 URLs
- App: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health: http://localhost:8000/health

## 💡 Tips
- Use global chat for workspace-wide messages
- Use proximity chat when near teammates
- Chat messages show distance badge (global/proximity)
- Gold outline indicates your avatar
- Grid helps with spatial awareness

## ⚠️ Troubleshooting
- **Connection failed**: Check backend is running
- **Can't move**: Ensure canvas has focus
- **WebSocket error**: Check console, verify URLs
- **Build fails**: Try `docker compose down -v`
