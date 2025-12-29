# API Reference

## Base URL
```
http://localhost:8000
```

## Authentication
Currently no authentication required (MVP). All endpoints are public.

---

## Workspaces

### List All Workspaces
```http
GET /api/workspaces
```

**Response**
```json
[
  {
    "id": 1,
    "name": "Default Office",
    "map_width": 50,
    "map_height": 50,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### Get Workspace
```http
GET /api/workspaces/{workspace_id}
```

**Response**
```json
{
  "id": 1,
  "name": "Default Office",
  "map_width": 50,
  "map_height": 50,
  "created_at": "2024-01-01T10:00:00Z"
}
```

### Create Workspace
```http
POST /api/workspaces
```

**Request Body**
```json
{
  "name": "My Office",
  "map_width": 50,
  "map_height": 50
}
```

**Response**
```json
{
  "id": 2,
  "name": "My Office",
  "map_width": 50,
  "map_height": 50,
  "created_at": "2024-01-01T10:00:00Z"
}
```

---

## Users

### List All Users
```http
GET /api/users?workspace_id={workspace_id}
```

**Query Parameters**
- `workspace_id` (optional) - Filter by workspace

**Response**
```json
[
  {
    "id": 1,
    "username": "alice",
    "avatar": "avatar1",
    "workspace_id": 1,
    "position_x": 10.5,
    "position_y": 15.2,
    "is_online": true,
    "last_seen": "2024-01-01T10:30:00Z"
  }
]
```

### Get User
```http
GET /api/users/{user_id}
```

**Response**
```json
{
  "id": 1,
  "username": "alice",
  "avatar": "avatar1",
  "workspace_id": 1,
  "position_x": 10.5,
  "position_y": 15.2,
  "is_online": true,
  "last_seen": "2024-01-01T10:30:00Z"
}
```

### Create User
```http
POST /api/users
```

**Request Body**
```json
{
  "username": "alice",
  "workspace_id": 1,
  "avatar": "avatar1"
}
```

**Response**
```json
{
  "id": 1,
  "username": "alice",
  "avatar": "avatar1",
  "workspace_id": 1,
  "position_x": 5.0,
  "position_y": 5.0,
  "is_online": false,
  "last_seen": "2024-01-01T10:00:00Z"
}
```

**Error Response** (409 Conflict)
```json
{
  "detail": "Username already exists"
}
```

### Update User
```http
PATCH /api/users/{user_id}
```

**Request Body** (all fields optional)
```json
{
  "position_x": 12.0,
  "position_y": 18.5,
  "avatar": "avatar2"
}
```

**Response**
```json
{
  "id": 1,
  "username": "alice",
  "avatar": "avatar2",
  "workspace_id": 1,
  "position_x": 12.0,
  "position_y": 18.5,
  "is_online": true,
  "last_seen": "2024-01-01T10:30:00Z"
}
```

---

## Zones

### List Zones
```http
GET /api/zones?workspace_id={workspace_id}
```

**Query Parameters**
- `workspace_id` (optional) - Filter by workspace

**Response**
```json
[
  {
    "id": 1,
    "name": "Meeting Room",
    "workspace_id": 1,
    "x": 10.0,
    "y": 10.0,
    "width": 8.0,
    "height": 6.0,
    "zone_type": "meeting_area"
  }
]
```

### Create Zone
```http
POST /api/zones
```

**Request Body**
```json
{
  "name": "Conference Room",
  "workspace_id": 1,
  "x": 20.0,
  "y": 15.0,
  "width": 10.0,
  "height": 8.0,
  "zone_type": "meeting_area"
}
```

**Response**
```json
{
  "id": 2,
  "name": "Conference Room",
  "workspace_id": 1,
  "x": 20.0,
  "y": 15.0,
  "width": 10.0,
  "height": 8.0,
  "zone_type": "meeting_area"
}
```

---

## Interactive Objects

### List Objects
```http
GET /api/objects?workspace_id={workspace_id}
```

**Query Parameters**
- `workspace_id` (optional) - Filter by workspace

**Response**
```json
[
  {
    "id": 1,
    "name": "Desk 1",
    "workspace_id": 1,
    "x": 5.0,
    "y": 25.0,
    "object_type": "desk"
  }
]
```

### Create Object
```http
POST /api/objects
```

**Request Body**
```json
{
  "name": "Water Cooler",
  "workspace_id": 1,
  "x": 30.0,
  "y": 20.0,
  "object_type": "amenity"
}
```

**Response**
```json
{
  "id": 2,
  "name": "Water Cooler",
  "workspace_id": 1,
  "x": 30.0,
  "y": 20.0,
  "object_type": "amenity"
}
```

---

## WebSocket Connection

### Connect
```
ws://localhost:8000/ws/{workspace_id}/{user_id}
```

**Connection Parameters**
- `workspace_id` - ID of the workspace to join
- `user_id` - ID of the user connecting

**Connection Example (JavaScript)**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/1/1');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

---

## WebSocket Messages

### Client → Server

#### Update Position
```json
{
  "type": "position",
  "data": {
    "x": 10.5,
    "y": 15.2
  }
}
```

#### Send Chat Message
```json
{
  "type": "chat",
  "data": {
    "message": "Hello everyone!",
    "chat_type": "global",
    "username": "Alice"
  }
}
```
- `chat_type`: "global" or "proximity"

#### Request State
```json
{
  "type": "request_state",
  "data": {}
}
```

### Server → Client

#### Position Update
```json
{
  "type": "position",
  "data": {
    "user_id": 1,
    "x": 10.5,
    "y": 15.2,
    "timestamp": "2024-01-01T10:30:00.000Z"
  }
}
```

#### Chat Message
```json
{
  "type": "chat",
  "data": {
    "user_id": 1,
    "username": "Alice",
    "message": "Hello everyone!",
    "chat_type": "global",
    "timestamp": "2024-01-01T10:30:00.000Z"
  }
}
```

#### User Joined
```json
{
  "type": "user_joined",
  "data": {
    "user_id": 2,
    "timestamp": "2024-01-01T10:30:00.000Z"
  }
}
```

#### User Left
```json
{
  "type": "user_left",
  "data": {
    "user_id": 2,
    "timestamp": "2024-01-01T10:30:00.000Z"
  }
}
```

#### State Update (Response to request_state)
```json
{
  "type": "state_update",
  "data": {
    "positions": [
      {
        "user_id": 1,
        "x": 10.5,
        "y": 15.2
      },
      {
        "user_id": 2,
        "x": 12.0,
        "y": 18.5
      }
    ]
  }
}
```

---

## Health Check

### Check API Health
```http
GET /health
```

**Response**
```json
{
  "status": "healthy"
}
```

---

## Interactive API Documentation

Visit http://localhost:8000/docs for Swagger UI with interactive API testing.

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 409 Conflict
```json
{
  "detail": "Username already exists"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "username"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Rate Limits
Currently no rate limiting (MVP).

## CORS
Configured to allow requests from `http://localhost:3000`.

## Future Endpoints (Roadmap)
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/workspaces/{id}/analytics` - Workspace analytics
- `POST /api/video/start` - Start video call
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/zones/{id}` - Update zone
- `DELETE /api/zones/{id}` - Delete zone
