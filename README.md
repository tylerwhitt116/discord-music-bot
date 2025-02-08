# 🎵 Discord Music Bot

A powerful and feature-rich Discord music bot built using Node.js, Discord.js, and Play-DL. This bot allows users to request songs, manage a queue, shuffle, loop, and control playback in a Discord voice channel.

## 🚀 Features
- Play songs from YouTube and Spotify
- Queue system with song management
- Shuffle and loop (single song or entire queue)
- Pause, resume, skip, stop playback
- Volume control
- Vote-skip functionality
- DJ role for restricted control
- Rich embed UI for displaying queue and now playing info
- Real-time status updates

## 🛠️ Installation

### 1. Clone the repository
```sh
git clone https://github.com/yourusername/discord-music-bot.git
cd discord-music-bot
```

### 2. Install dependencies
```sh
npm install
```

### 3. Install FFmpeg
- **Windows**: [Download FFmpeg](https://ffmpeg.org/download.html) and add it to your system PATH.
- **Linux (Ubuntu/Debian)**:
  ```sh
  sudo apt install ffmpeg
  ```
- **macOS**:
  ```sh
  brew install ffmpeg
  ```

### 4. Set up the bot
Create a `.env` file and add your bot token:
```sh
DISCORD_TOKEN=your_bot_token_here
```

### 5. Run the bot
```sh
node index.js
```

## 🎮 Commands
| Command | Description |
|---------|-------------|
| `!play <song>` | Play a song from YouTube/Spotify |
| `!queue` | View the current queue |
| `!skip` | Skip the current song |
| `!pause` | Pause the music |
| `!resume` | Resume playback |
| `!stop` | Stop the music and clear the queue |
| `!shuffle` | Shuffle the queue |
| `!loop <song/queue/off>` | Loop a song or the entire queue |
| `!volume <1-100>` | Adjust the volume |
| `!voteskip` | Vote to skip the current song |

## 🎤 Permissions
Make sure the bot has the following permissions in your Discord server:
- Connect
- Speak
- Read Messages
- Send Messages

## 🛠️ Troubleshooting
### Bot is online but not playing sound
- Ensure FFmpeg is installed and accessible via the command line (`ffmpeg -version`).
- Check if the bot has `Speak` permissions in the voice channel.
- Restart the bot (`CTRL + C` then `node index.js`).

### `Error: Cannot find module '@discordjs/opus'`
Install the required module manually:
```sh
npm install @discordjs/opus
```

### `Sign in to confirm you're not a bot`
Try forcing `play-dl` to use legacy authentication:
```javascript
const playdl = require("play-dl");
playdl.setToken({ youtube: { enableLegacy: true } });
```

## 🏗️ Future Enhancements
- Add support for SoundCloud
- Implement lyrics fetching
- Enhance error handling and logging

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).

