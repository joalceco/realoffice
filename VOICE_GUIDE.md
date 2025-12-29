# Voice Communications Guide

## Overview

RealOffice includes WebRTC-based peer-to-peer voice communications, allowing users to talk with each other in real-time. Voice chat is designed to be proximity-aware, enhancing the feeling of being in a shared virtual space.

## Features

### Core Voice Features
- **WebRTC Peer-to-Peer**: Direct audio connections between users
- **Proximity-Based**: Voice chat follows the same 5-tile proximity rules as text chat
- **Easy Controls**: Simple join/leave and mute/unmute buttons
- **Visual Indicators**: See who's speaking with green rings around avatars
- **No Server Processing**: Audio streams directly between browsers (low latency)

### Audio Quality
- **Echo Cancellation**: Built-in echo cancellation for clear audio
- **Noise Suppression**: Reduces background noise
- **Auto Gain Control**: Automatically adjusts microphone volume

## How to Use

### Joining Voice Chat

1. **Grant Microphone Permission**
   - Click "Join Voice Chat" button
   - Browser will request microphone access
   - Click "Allow" to grant permission

2. **Automatic Connections**
   - When you join, the system establishes connections with other voice users
   - New users joining voice will automatically connect to you

### Muting/Unmuting

- **Mute Button**: Click to mute your microphone (red icon 🔇)
- **Unmute**: Click again to unmute (green icon 🎤)
- **Others can't hear you**: When muted, no audio is transmitted

### Leaving Voice Chat

- Click "Leave Voice" button to disconnect
- All peer connections are closed
- Microphone access is released

### Speaking Indicators

- **Green Ring**: Appears around avatars when they're speaking
- **Microphone Icon**: Shows below speaking users
- **Real-Time**: Updates as users talk

## Technical Architecture

### WebRTC Connection Flow

```
User A joins voice
    ↓
Server notified (WebSocket)
    ↓
Server broadcasts to workspace
    ↓
User B receives notification
    ↓
User B creates WebRTC offer
    ↓
Signaling via WebSocket
    ↓
User A receives offer
    ↓
User A creates answer
    ↓
Signaling via WebSocket
    ↓
ICE candidates exchanged
    ↓
Direct P2P audio connection established
```

### Signaling Server

The backend acts as a WebRTC signaling server:
- Exchanges SDP offers/answers
- Exchanges ICE candidates
- Manages connection lifecycle
- No audio data passes through server

### STUN Servers

Uses Google's public STUN servers for NAT traversal:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

## Message Protocol

### Client → Server

#### Join Voice
```json
{
  "type": "voice_join",
  "data": {}
}
```

#### Leave Voice
```json
{
  "type": "voice_leave",
  "data": {}
}
```

#### WebRTC Signaling
```json
{
  "type": "webrtc_signal",
  "data": {
    "target_user_id": 2,
    "signal_type": "offer|answer|ice_candidate",
    "signal": {
      "sdp": "...",
      "type": "offer"
    }
  }
}
```

#### Voice State (Speaking/Muted)
```json
{
  "type": "voice_state",
  "data": {
    "is_speaking": true
  }
}
```

### Server → Client

#### User Joined Voice
```json
{
  "type": "voice_joined",
  "data": {
    "user_id": 2,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### User Left Voice
```json
{
  "type": "voice_left",
  "data": {
    "user_id": 2,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### WebRTC Signal Relay
```json
{
  "type": "webrtc_signal",
  "data": {
    "from_user_id": 1,
    "signal_type": "answer",
    "signal": {
      "sdp": "...",
      "type": "answer"
    }
  }
}
```

#### Voice State Update
```json
{
  "type": "voice_state",
  "data": {
    "user_id": 1,
    "is_speaking": true,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+ (full support)
- ✅ Firefox 88+ (full support)
- ✅ Safari 14+ (full support)
- ✅ Edge 90+ (full support)

### Required Features
- WebRTC support (RTCPeerConnection)
- MediaDevices API (getUserMedia)
- WebSocket support

### Mobile Support
- iOS Safari 14.3+ (with user gesture)
- Chrome Android 90+

## Troubleshooting

### "Microphone access denied"
**Solution**: 
- Check browser permissions in settings
- Look for microphone icon in address bar
- Try HTTPS instead of HTTP (required for some browsers)

### "Can't hear other users"
**Solution**:
- Check system audio output
- Ensure audio element isn't blocked by browser
- Check if other user is muted
- Try refreshing the page

### "Others can't hear me"
**Solution**:
- Check if you're muted (red icon)
- Verify microphone is working in system settings
- Check browser microphone permissions
- Try speaking louder or adjust gain

### "Choppy or delayed audio"
**Solution**:
- Check internet connection
- Close bandwidth-heavy applications
- Reduce number of simultaneous voice connections
- Consider using wired connection instead of WiFi

### "Connection fails repeatedly"
**Solution**:
- Check firewall settings
- Verify STUN server accessibility
- Try different network (corporate firewalls may block)
- Check WebSocket connection is stable

## Limitations

### Current MVP Limitations
1. **Audio Only**: No video support yet
2. **No Recording**: Conversations aren't recorded
3. **No Volume Control**: Can't adjust individual user volumes
4. **No Audio Devices Selection**: Uses system default
5. **Mesh Topology**: All users connect to all users (doesn't scale beyond ~10 users)

### Network Requirements
- **Bandwidth**: ~50 kbps per connection (both up and down)
- **Latency**: <200ms recommended
- **Ports**: UDP 3478 for STUN (usually not blocked)

### Firewall Considerations
- Corporate firewalls may block peer-to-peer connections
- VPNs may add latency
- TURN server would be needed for restricted networks (not implemented)

## Privacy & Security

### Current State (MVP)
- ⚠️ No encryption beyond browser WebRTC defaults
- ⚠️ No authentication required
- ⚠️ Anyone can join any workspace
- ✅ Peer-to-peer (no server recording)
- ✅ Audio only sent when not muted

### Production Recommendations
- [ ] Implement workspace authentication
- [ ] Add DTLS-SRTP encryption validation
- [ ] Implement user permissions
- [ ] Add audit logging
- [ ] Deploy TURN server for NAT traversal
- [ ] Add end-to-end encryption option

## Performance

### Resource Usage
- **CPU**: ~2-5% per connection (encoding/decoding)
- **Memory**: ~10-20 MB per connection
- **Bandwidth**: ~50 kbps per connection

### Scalability
- **Recommended**: Up to 5-6 concurrent voice users
- **Maximum**: ~10 users before quality degrades
- **Solution for scale**: Implement SFU (Selective Forwarding Unit)

## Advanced Configuration

### Changing STUN Servers
Edit `frontend/src/services/voice.ts`:

```typescript
private iceServers = {
  iceServers: [
    { urls: 'stun:your-stun-server.com:3478' }
  ]
};
```

### Adding TURN Server
```typescript
private iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'password'
    }
  ]
};
```

### Adjusting Audio Constraints
Edit `VoiceService.joinVoiceChat()`:

```typescript
this.localStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,  // Higher quality
    channelCount: 1,     // Mono
  },
  video: false
});
```

## Future Enhancements

### Short Term
- [ ] Individual volume controls
- [ ] Audio device selection
- [ ] Better speaking detection
- [ ] Audio visualizations

### Medium Term
- [ ] Push-to-talk mode
- [ ] Spatial audio (3D positioning)
- [ ] Recording capability
- [ ] Noise gate

### Long Term
- [ ] Video support
- [ ] Screen sharing
- [ ] SFU for better scaling
- [ ] AI noise cancellation
- [ ] Live transcription

## Development

### Testing Voice Locally

1. **Open Two Browser Windows**
   ```bash
   # Start the app
   docker compose up
   
   # Open in two browsers or incognito windows
   # Join as different users
   # Both join voice chat
   ```

2. **Test Connection**
   - Speak in one window
   - Check audio in other window
   - Verify speaking indicators

3. **Test Muting**
   - Mute in one window
   - Verify no audio transmitted
   - Check icon changes

### Debugging

Enable verbose logging in browser console:

```javascript
// In voice.ts, add:
RTCPeerConnection.prototype.addEventListener('iceconnectionstatechange', (e) => {
  console.log('ICE state:', e.target.iceConnectionState);
});
```

### Monitoring

Watch WebSocket messages:
```javascript
// In browser console
webSocket.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type.includes('voice') || msg.type === 'webrtc_signal') {
    console.log('Voice message:', msg);
  }
});
```

## Support

For issues with voice chat:
1. Check browser console for errors
2. Verify microphone permissions
3. Test with different browsers
4. Check network connectivity
5. Review troubleshooting section above

## References

- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)
