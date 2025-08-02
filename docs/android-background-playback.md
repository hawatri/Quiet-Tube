# Android Background Playback Guide

## Problem
Your music stops playing when:
- Screen turns off
- Switching to another app
- Switching to another browser tab
- App goes to background

## Solutions Implemented

### 1. **Service Worker Registration**
- Created `/public/sw.js` to handle background tasks
- Registers service worker on app startup
- Keeps audio context alive in background
- Handles push notifications for media controls

### 2. **Wake Lock API**
- Prevents device from sleeping during playback
- Automatically requests screen wake lock when playing
- Releases wake lock when paused or stopped

### 3. **Audio Context Management**
- Creates and maintains Web Audio API context
- Automatically resumes suspended audio context
- Periodic checks to ensure audio context stays active
- Handles audio context state changes

### 4. **Background Audio Techniques**
- Creates silent audio buffer to keep audio pipeline active
- Uses muted background audio element
- Periodic audio context resume (every 10 seconds)
- Service worker keep-alive messages (every 30 seconds)

### 5. **Media Session API**
- Provides native Android media controls
- Shows track info in notification
- Handles play/pause/next/previous from notification
- Updates playback position for scrubbing

### 6. **Event Listeners for Android**
- `visibilitychange`: Handles tab switching
- `pagehide`/`pageshow`: Handles app backgrounding
- `focus`/`blur`: Handles window focus changes
- `resume`/`pause`: Android WebView specific events

### 7. **PWA Manifest Updates**
- Changed display to "standalone" for better app-like experience
- Added background sync permissions
- Added wake lock permissions
- Added notification permissions

### 8. **Custom Hook: useBackgroundAudio**
- Centralized background audio management
- Handles service worker communication
- Manages silent audio playback
- Coordinates all background techniques

## Key Files Modified

### `src/app/_components/Player.tsx`
- Enhanced with multiple background audio techniques
- Added service worker integration
- Improved event handling for Android

### `src/hooks/useBackgroundAudio.ts` (New)
- Custom hook for background audio management
- Service worker registration and communication
- Silent audio creation and management

### `public/sw.js` (New)
- Service worker for background tasks
- Handles media control notifications
- Keeps audio context alive

### `public/manifest.json`
- Updated for better PWA support
- Added necessary permissions
- Changed display mode to standalone

## Testing on Android

### 1. **Install as PWA**
- Open your app in Chrome
- Tap the menu (three dots)
- Select "Add to Home screen"
- This gives you app-like behavior

### 2. **Test Background Playback**
1. Start playing music
2. Turn off screen
3. Switch to another app
4. Switch to another browser tab
5. Music should continue playing

### 3. **Check Media Controls**
- Pull down notification shade
- You should see media controls
- Test play/pause/next/previous buttons

## Browser Compatibility

### ✅ **Supported**
- Chrome (Android)
- Samsung Internet
- Edge (Android)
- Firefox (Android) - Limited support

### ❌ **Not Supported**
- Safari (iOS) - Different restrictions
- Older Android browsers

## Additional Tips

### 1. **User Education**
Tell users to:
- Install as PWA for best experience
- Grant notification permissions
- Keep the app in recent apps list

### 2. **Fallback Strategy**
If background playback fails:
- Show user-friendly error message
- Suggest installing as PWA
- Provide manual resume option

### 3. **Performance Optimization**
- Silent audio is very low volume and muted
- Periodic checks are lightweight
- Service worker is efficient

### 4. **Debugging**
Check browser console for:
- Service worker registration status
- Audio context state changes
- Wake lock acquisition/release
- Background audio events

## Common Issues & Solutions

### Issue: Music still stops
**Solution:**
1. Ensure app is installed as PWA
2. Grant all permissions
3. Check if device has battery optimization enabled
4. Try different browser (Chrome works best)

### Issue: No media controls in notification
**Solution:**
1. Grant notification permissions
2. Ensure Media Session API is working
3. Check if track metadata is set correctly

### Issue: Audio quality issues
**Solution:**
1. Background audio is silent and doesn't affect quality
2. Main audio stream is unchanged
3. Only keeps audio pipeline active

## Future Improvements

1. **Web Audio API Worklet** - For more advanced audio processing
2. **Background Sync API** - For offline playback
3. **Push Notifications** - For remote control
4. **Audio Focus API** - For better audio session management

## Code Examples

### Basic Implementation
```typescript
// In your Player component
useBackgroundAudio({
  isPlaying,
  onPlay: togglePlay,
  onPause: togglePlay,
  onNext: playNext,
});
```

### Manual Wake Lock
```typescript
if ('wakeLock' in navigator) {
  const wakeLock = await navigator.wakeLock.request('screen');
  // Remember to release when done
  wakeLock.release();
}
```

### Audio Context Resume
```typescript
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}
```

This comprehensive solution should resolve your Android background playback issues. The combination of multiple techniques ensures maximum compatibility across different Android devices and browsers. 