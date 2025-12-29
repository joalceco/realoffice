# RealOffice - Virtual Office MVP

A Gather-like virtual office web application where users can join workspaces, move around in a 2D tile-based environment, and interact with others in real-time.

## Features

- 🎮 **2D Tile-Based Movement** - Navigate through the office space using arrow keys or WASD
- 👥 **Real-Time Multiplayer** - See other users moving around in real-time via WebSockets
- 💬 **Dual Chat System**
  - Global chat: Message everyone in the workspace
  - Proximity chat: Talk to users nearby (within 5 tiles)
- 🎨 **Avatar Selection** - Choose from 5 colorful avatars
- 🏢 **Zones & Rooms** - Designated areas like meeting rooms and lounges
- 🪑 **Interactive Objects** - Desks, chairs, and other office furniture
- 📊 **Live Presence** - See who's online in real-time

## Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Canvas API** for 2D rendering
- WebSocket client for real-time communication
- Responsive UI with inline styles

### Backend
- **FastAPI** (Python) - High-performance async web framework
- **WebSockets** for real-time bidirectional communication
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Real-time presence and caching

### Infrastructure
- **Docker Compose** - Container orchestration
- Multi-service architecture with health checks

## Architecture

```
┌─────────────┐         WebSocket          ┌─────────────┐
│   React     │◄─────────────────────────►│   FastAPI   │
│  Frontend   │         REST API           │   Backend   │
└─────────────┘◄─────────────────────────►└─────────────┘
                                                   │
                                      ┌────────────┴────────────┐
                                      ▼                         ▼
                               ┌──────────┐            ┌──────────┐
                               │PostgreSQL│            │  Redis   │
                               │    DB    │            │ Presence │
                               └──────────┘            └──────────┘
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation & Running

1. **Clone the repository**
```bash
git clone https://github.com/joalceco/realoffice.git
cd realoffice
```

2. **Start all services with Docker Compose**
```bash
docker-compose up --build
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:8000
- PostgreSQL on port 5432
- Redis on port 6379

3. **Access the application**

Open your browser and navigate to http://localhost:3000

4. **Create your user**
- Enter a username
- Select an avatar
- Click "Join Workspace"

5. **Start exploring!**
- Use arrow keys or WASD to move around
- Try the global chat to message everyone
- Move close to other users and use proximity chat
- Explore different zones and rooms

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Key Endpoints

#### Workspaces
- `GET /api/workspaces` - List all workspaces
- `POST /api/workspaces` - Create a new workspace
- `GET /api/workspaces/{id}` - Get workspace details

#### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `GET /api/users/{id}` - Get user details
- `PATCH /api/users/{id}` - Update user information

#### Zones & Objects
- `GET /api/zones` - List zones
- `POST /api/zones` - Create a zone
- `GET /api/objects` - List interactive objects
- `POST /api/objects` - Create an object

#### WebSocket
- `WS /ws/{workspace_id}/{user_id}` - Real-time communication

## WebSocket Messages

### Client → Server

**Position Update**
```json
{
  "type": "position",
  "data": { "x": 10.5, "y": 15.2 }
}
```

**Chat Message**
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

**Request State**
```json
{
  "type": "request_state",
  "data": {}
}
```

### Server → Client

**Position Update**
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

**Chat Message**
```json
{
  "type": "chat",
  "data": {
    "user_id": 1,
    "username": "Alice",
    "message": "Hello!",
    "chat_type": "global",
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

**User Joined/Left**
```json
{
  "type": "user_joined",
  "data": {
    "user_id": 2,
    "timestamp": "2024-01-01T12:00:00"
  }
}
```

## Development

### Running Locally Without Docker

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
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
npm install

# Set environment variables
export REACT_APP_API_URL="http://localhost:8000"
export REACT_APP_WS_URL="ws://localhost:8000/ws"

# Run the dev server
npm start
```

### Project Structure

```
realoffice/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Configuration and database
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI application
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API and WebSocket clients
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx       # Main application
│   │   └── index.tsx     # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
└── docker-compose.yml
```

## Features Explained

### Zones and Rooms
Zones are designated areas on the map with different purposes:
- **Meeting Rooms** - Collaborative spaces for team discussions
- **Lounges** - Casual areas for informal chats
- Each zone is visually highlighted on the map

### Proximity Chat
Messages sent via proximity chat are only visible to users within a 5-tile radius, simulating real-world conversations where only nearby people can hear you.

### Interactive Objects
- **Desks** - Work areas scattered around the office
- **Chairs** - Seating locations
- Objects are rendered on the map and can be used for spatial reference

## Future Enhancements

- 🎥 Video/Audio chat integration
- 📅 Calendar integration for meetings
- 🎯 Status indicators (busy, available, away)
- 🖼️ Custom backgrounds and themes
- 📱 Mobile support
- 🔐 Authentication and user accounts
- 👔 Custom avatar creation
- 🎪 Screen sharing capabilities
- 📊 Analytics and usage statistics

## Troubleshooting

### Connection Issues
- Ensure all Docker containers are running: `docker-compose ps`
- Check backend health: `curl http://localhost:8000/health`
- Verify WebSocket connection in browser console

### Database Issues
- Reset database: `docker-compose down -v && docker-compose up --build`

### Port Conflicts
- If ports are already in use, modify the ports in `docker-compose.yml`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.