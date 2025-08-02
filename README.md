# QuietTube

QuietTube is a NextJS project designed to provide a seamless and enjoyable experience for listening to YouTube music without distractions. It features advanced background playback capabilities for Android devices.

## 🎵 Features

- **Playlist Management**: Create, edit, and organize your YouTube music playlists
- **Background Playback**: Music continues playing when screen is off or app is in background
- **Media Controls**: Native Android media controls in notification shade
- **PWA Support**: Install as a Progressive Web App for app-like experience
- **Import/Export**: Save and load playlists as `.music` files
- **Queue System**: Add songs to play next
- **Shuffle & Loop**: Standard music player features
- **Cross-platform**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Quiet-Tube.git
   cd Quiet-Tube
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:9002`

## 📱 Android Background Playback

QuietTube includes advanced background playback features for Android devices. The music will continue playing even when:
- Screen is turned off
- Switching to another app
- Switching to another browser tab
- App goes to background

### Installation as PWA (Recommended)

For the best background playback experience on Android:

1. **Open QuietTube in Chrome**
2. **Tap the menu** (three dots in top-right)
3. **Select "Add to Home screen"**
4. **Launch from home screen** for app-like behavior

### Features

- **Wake Lock API**: Prevents device from sleeping during playback
- **Audio Context Management**: Keeps audio pipeline active
- **Service Worker**: Handles background tasks and notifications
- **Media Session API**: Native Android media controls
- **Silent Background Audio**: Maintains audio session without affecting quality

### Troubleshooting

If music stops in background:

1. **Ensure PWA installation**: Install as described above
2. **Grant permissions**: Allow notifications when prompted
3. **Check browser**: Chrome works best for background playback
4. **Battery optimization**: Disable battery optimization for the app
5. **Recent apps**: Keep the app in recent apps list

## 🛠️ Project Structure

```
Quiet-Tube/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── _components/        # App-specific components
│   │   │   ├── Player.tsx      # Enhanced audio player
│   │   │   ├── PlayerControls.tsx
│   │   │   ├── PlaylistSidebar.tsx
│   │   │   └── TrackList.tsx
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable UI components
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/               # React contexts
│   │   └── PlayerContext.tsx   # Audio player state
│   ├── hooks/                  # Custom React hooks
│   │   ├── usePlayer.ts        # Player state management
│   │   └── useBackgroundAudio.ts # Background playback
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript definitions
├── public/
│   ├── sw.js                   # Service Worker
│   ├── manifest.json           # PWA manifest
│   └── favicon.svg
└── docs/
    └── android-background-playback.md # Detailed guide
```

## 🎯 Key Components

### Player.tsx
Enhanced audio player with background playback support:
- Wake Lock API integration
- Audio Context management
- Service Worker communication
- Media Session API for native controls

### useBackgroundAudio.ts
Custom hook for background audio management:
- Service Worker registration
- Silent audio techniques
- Periodic audio context resume
- Event handling for Android

### PlayerContext.tsx
Global state management for:
- Playlist management
- Playback controls
- Import/export functionality
- Queue system

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run genkit:dev       # Start Genkit AI development server
npm run genkit:watch     # Start Genkit with file watching

# Production
npm run build            # Build for production
npm run start            # Start production server

# Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
```

## 🧪 Testing Background Playback

### On Android Device:

1. **Start playing music**
2. **Turn off screen** - Music should continue
3. **Switch to another app** - Music should continue
4. **Switch browser tabs** - Music should continue
5. **Check notification controls** - Pull down notification shade

### Debugging:

Check browser console for:
- Service Worker registration status
- Audio context state changes
- Wake lock acquisition/release
- Background audio events

## 🌐 Browser Compatibility

### ✅ **Fully Supported**
- Chrome (Android) - Best experience
- Samsung Internet
- Edge (Android)

### ⚠️ **Limited Support**
- Firefox (Android) - Some features may not work
- Safari (iOS) - Different restrictions apply

### ❌ **Not Supported**
- Older Android browsers
- Internet Explorer

## 📚 Documentation

- [Android Background Playback Guide](./docs/android-background-playback.md) - Detailed technical guide
- [Component Documentation](./docs/blueprint.md) - Architecture overview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Player](https://github.com/cookpete/react-player) - YouTube player integration
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 🐛 Known Issues

- **iOS Safari**: Background playback not supported due to platform restrictions
- **Battery Optimization**: Some Android devices may still pause background audio
- **Older Browsers**: Service Worker and Wake Lock APIs not available

## 🔮 Future Roadmap

- [ ] Offline playback support
- [ ] Push notifications for remote control
- [ ] Advanced audio processing with Web Audio API
- [ ] Cross-device sync
- [ ] Social features (sharing playlists)
- [ ] Audio visualization
- [ ] Voice commands

---

**Enjoy your distraction-free music experience! 🎶**