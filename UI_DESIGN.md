# Visual Design & UI Components

## Login Screen

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│              🏢 Welcome to RealOffice                        │
│                                                               │
│    A virtual office where you can collaborate with your      │
│              team in real-time                                │
│                                                               │
│    ┌─────────────────────────────────────────────┐          │
│    │ Choose your username                          │          │
│    │ ┌───────────────────────────────────────┐    │          │
│    │ │ Enter your username                   │    │          │
│    │ └───────────────────────────────────────┘    │          │
│    └─────────────────────────────────────────────┘          │
│                                                               │
│    ┌─────────────────────────────────────────────┐          │
│    │ Choose your avatar                            │          │
│    │  🔴   🟢   🔵   🟠   🟣                      │          │
│    │  Red  Teal Blue Orange Green                  │          │
│    └─────────────────────────────────────────────┘          │
│                                                               │
│    ┌─────────────────────────────────────────────┐          │
│    │         [ Join Workspace ]                    │          │
│    └─────────────────────────────────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Main Workspace View

```
┌──────────────────────────────────────────────────────────────────────────┐
│ RealOffice - Default Office                          👥 5 online         │
│ Welcome, Alice!                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬──────────────────────────────────┐
│                                 │  Chat                             │
│  Game Canvas (800x600)          │  ┌──────────┬──────────┐        │
│                                 │  │ Global   │Proximity │        │
│  ┌─────────────────────────┐   │  └──────────┴──────────┘        │
│  │ Meeting Room            │   │                                   │
│  │  ┌──┐  ┌──┐            │   │  ┌─────────────────────────────┐│
│  │  │😀│  │😊│            │   │  │ Alice: Hey everyone!        ││
│  │  └──┘  └──┘            │   │  │ 10:30 AM          [global]   ││
│  └─────────────────────────┘   │  └─────────────────────────────┘│
│                                 │  ┌─────────────────────────────┐│
│     ┌────┐                      │  │ Bob: Working on the docs    ││
│     │Desk│  😎 You (Alice)     │  │ 10:31 AM          [global]   ││
│     └────┘     ┌──┐            │  └─────────────────────────────┘│
│                │🌟│            │  ┌─────────────────────────────┐│
│                └──┘            │  │ Carol: Hi!                  ││
│                                 │  │ 10:32 AM       [proximity]   ││
│  ┌─────────────────────────┐   │  └─────────────────────────────┘│
│  │ Lounge                  │   │                                   │
│  │    😄                   │   │  ┌─────────────────────────────┐│
│  │                         │   │  │ Type a message...    [Send] ││
│  └─────────────────────────┘   │  └─────────────────────────────┘│
│                                 │                                   │
│  Use Arrow Keys or WASD         │                                   │
└────────────────────────────────┴──────────────────────────────────┘
```

## UI Components

### Avatar Colors
- **Red (#FF6B6B)** - avatar1
- **Teal (#4ECDC4)** - avatar2
- **Blue (#45B7D1)** - avatar3
- **Orange (#FFA07A)** - avatar4
- **Green (#98D8C8)** - avatar5

### Zones
- **Meeting Room** - Light blue background (rgba(100, 150, 255, 0.2))
- **Lounge** - Light blue background (rgba(100, 150, 255, 0.2))
- Zone borders are blue (#6496FF) with 2px stroke

### Interactive Objects
- **Desk** - Brown rectangle (#8B4513)
- **Chair** - Blue rectangle (#4169E1)
- All objects are smaller than a tile for visual clarity

### Map
- **Background** - Light gray (#F0F0F0)
- **Grid** - Light gray lines (#E0E0E0)
- **Tile Size** - 32x32 pixels
- **Default Map** - 50x50 tiles (1600x1600 pixels total)
- **Viewport** - 800x600 pixels (camera follows player)

### Chat Messages
- **Global** - Blue badge (#E0F0FF)
- **Proximity** - Red badge (#FFE0E0)
- **Own messages** - Light blue background (#E3F2FD)
- **Others' messages** - Gray background (#F5F5F5)

### Player Rendering
- **Avatar** - Colored circle (24px diameter)
- **Current player** - Gold outline (#FFD700)
- **Username** - Bold text above avatar
- **Position** - Center of tile

### Movement
- **Speed** - 3 pixels per frame (at 60fps)
- **Controls** - Arrow keys or WASD
- **Collision** - None (MVP - players can overlap)

## Responsive Behavior
- Canvas is fixed size (800x600)
- Chat panel is fixed width (350px)
- Layout is side-by-side on desktop
- Mobile optimization is a future enhancement

## Animation & Feedback
- Smooth movement with requestAnimationFrame
- Chat messages slide in
- Online count updates in real-time
- Visual feedback on button hover
- Loading states during connection

## Accessibility Considerations
- Keyboard navigation for movement
- Clear visual hierarchy
- Readable fonts and sizes
- Color contrast for text
- Form labels for inputs
