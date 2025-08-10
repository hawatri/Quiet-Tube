# 🎵 QuietTube

**Listen to YouTube music without distractions - A beautiful, minimalist music player**

QuietTube transforms YouTube videos into a clean, audio-focused listening experience. Create playlists, manage your music library, and enjoy seamless playback with a stunning interface designed for music lovers.

## ✨ Features

### 🎶 Core Music Experience
- **Audio-Only Playback**: Extract and play audio from YouTube videos without video distractions
- **Smart Playlist Management**: Create, organize, and manage custom music libraries
- **Advanced Playback Controls**: Play, pause, skip, shuffle, repeat, and volume control
- **Background Playback**: Continue listening even when the screen is off (mobile optimized)
- **Queue Management**: Add songs to play next with smart queueing

### 🎨 Beautiful Design
- **Liquid Gradient Background**: Dynamic, flowing gradients that respond to your music
- **Responsive Design**: Optimized for all devices - mobile, tablet, and desktop
- **Dark/Light Theme**: Automatic theme switching with system preference support
- **Smooth Animations**: Polished micro-interactions and transitions
- **Album Art Integration**: YouTube thumbnails as dynamic backgrounds

### 🔍 Smart Features
- **Instant Search**: Search your library or paste YouTube URLs directly
- **Auto-Title Fetching**: Automatically retrieves video titles from YouTube
- **Lyrics Display**: View song lyrics with AI-powered fetching
- **Keyboard Shortcuts**: Quick controls for power users
- **Media Session API**: Control playback from lock screen and notifications

### 💾 Data Management
- **Local Storage**: All data stored locally - no cloud dependencies
- **Import/Export**: Save and share playlists as `.music` files
- **Backup & Restore**: Easy playlist backup and migration
- **Data Validation**: Robust error handling and data integrity

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quiettube.git
   cd quiettube
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
   Navigate to `http://localhost:3000`

## 🎯 How to Use

### Creating Your First Playlist
1. Click **"New Playlist"** in the sidebar
2. Give your playlist a memorable name
3. Start adding songs by pasting YouTube URLs or searching your library

### Adding Songs
- **From YouTube**: Paste any YouTube URL in the search bar
- **Quick Add**: Use the "Add Song" button in any playlist
- **Bulk Import**: Import existing playlists from `.music` files

### Playback Controls
- **Space**: Play/Pause
- **Arrow Keys**: Skip tracks
- **Cmd/Ctrl + B**: Toggle sidebar
- **Volume Slider**: Adjust playback volume
- **Progress Bar**: Seek to any position

### Managing Playlists
- **Rename**: Right-click any playlist to rename
- **Export**: Download playlists as `.music` files
- **Delete**: Remove playlists you no longer need
- **Reorder**: Drag and drop songs within playlists

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **Audio**: React Player for YouTube integration
- **State Management**: React Context with local storage
- **TypeScript**: Full type safety throughout
- **AI Integration**: Google AI for lyrics fetching

## 🎨 Design Philosophy

QuietTube follows a **"calm technology"** approach:

- **Minimal Distractions**: Clean interface focused on music
- **Intuitive Navigation**: Everything where you expect it
- **Responsive Design**: Beautiful on any screen size
- **Accessibility First**: Keyboard navigation and screen reader support
- **Performance Optimized**: Fast loading and smooth interactions

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for optional features:

```env
# Optional: Google AI API key for enhanced lyrics
GOOGLE_AI_API_KEY=your_api_key_here
```

### Customization
- **Colors**: Modify `src/app/globals.css` for custom color schemes
- **Fonts**: Update `tailwind.config.ts` for different typography
- **Layout**: Adjust component layouts in `src/app/_components/`

## 📱 Mobile Experience

QuietTube is optimized for mobile devices:

- **Touch-Friendly**: Large tap targets and gesture support
- **Responsive Layout**: Adaptive sidebar and controls
- **Background Playback**: Continue playing when app is backgrounded
- **Lock Screen Controls**: Media session integration
- **PWA Ready**: Install as a native app

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Test thoroughly**: Ensure all features work
5. **Submit a pull request**: Describe your changes

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing component structure
- Add proper error handling
- Test on multiple devices
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **YouTube**: For providing the content platform
- **React Player**: For seamless video integration
- **Radix UI**: For accessible component primitives
- **Tailwind CSS**: For the utility-first styling approach
- **Next.js**: For the amazing React framework

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? We'd love to hear from you!

- **Bug Reports**: [Create an issue](https://github.com/yourusername/quiettube/issues)
- **Feature Requests**: [Start a discussion](https://github.com/yourusername/quiettube/discussions)
- **Security Issues**: Email us at security@quiettube.app

---

**Made with ❤️ for music lovers everywhere**

*QuietTube - Where music meets minimalism*