// index.js

// --- Imports and Setup ---
const { Client, GatewayIntentBits } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  VoiceConnectionStatus 
} = require('@discordjs/voice');
const playdl = require('play-dl');
playdl.setToken({
    youtube: {
        cookie: "YOUR_YOUTUBE_COOKIE"
    }
})
// If you don't have ffmpeg in your system PATH, install ffmpeg-static and uncomment:
// const ffmpegPath = require('ffmpeg-static');
// process.env.FFMPEG_PATH = ffmpegPath;

const TOKEN = 'YOUR_BOT_TOKEN';
const PREFIX = '!';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

// A Map to store the music queue for each guild
const queue = new Map();

// --- Client Events ---
client.once('ready', () => {
  console.log('🎵 Music bot is online!');
});

client.on('messageCreate', async (message) => {
  // Ignore messages without the prefix or from bots
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'play') {
    await execute(message, args);
  } else if (command === 'skip') {
    skip(message);
  } else if (command === 'stop') {
    stop(message);
  }
});

// --- Command Functions ---

// !play command: Searches for a song and adds it to the queue
async function execute(message, args) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply("❌ You need to be in a voice channel!");
  }

  const searchQuery = args.join(' ');
  if (!searchQuery) {
    return message.reply("❌ Please provide a song name!");
  }

  // Use play-dl to search YouTube
  const ytResults = await playdl.search(searchQuery, { limit: 1 });
  if (!ytResults || ytResults.length === 0) {
    return message.reply("❌ No results found.");
  }

  const songInfo = ytResults[0];
  const song = {
    title: songInfo.title,
    url: songInfo.url,
  };

  let serverQueue = queue.get(message.guild.id);
  if (!serverQueue) {
    // Create a new serverQueue object
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    
    // Log voice connection state changes for debugging
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log("✅ Voice connection is ready!");
    });
    connection.on(VoiceConnectionStatus.Disconnected, () => {
      console.log("⚠️ Voice connection disconnected.");
    });

    const player = createAudioPlayer();
    
    serverQueue = {
      voiceChannel: voiceChannel,
      connection: connection,
      player: player,
      songs: [],
    };

    queue.set(message.guild.id, serverQueue);
  }

  serverQueue.songs.push(song);
  message.reply(`✅ Added **${song.title}** to the queue!`);

  // If the player isn't already playing, start playback.
  if (serverQueue.player.state.status !== AudioPlayerStatus.Playing) {
    playSong(message.guild.id);
  }
}

// playSong: Plays the first song in the queue and then continues to the next
async function playSong(guildId) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue) return;

  if (serverQueue.songs.length === 0) {
    console.log("Queue is empty. Leaving voice channel.");
    serverQueue.connection.destroy();
    queue.delete(guildId);
    return;
  }

  const song = serverQueue.songs[0];
  console.log(`🎵 Fetching stream for: ${song.title}`);

  try {
    // Get the stream data from play-dl
    const streamData = await playdl.stream(song.url, { quality: 2 });
    console.log("✅ Stream data:", streamData);

    // Create an audio resource from the stream
    const resource = createAudioResource(streamData.stream, { inputType: streamData.type,
        inlineVolume: true,
     });
     resource.volume.setVolume(1.0)
    // Play the resource and subscribe the connection to the player
    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);
    console.log(`🎵 Now playing: ${song.title}`);
     console.log("Player state:", serverQueue.player.state.status);
    // When the song finishes, remove it from the queue and play the next song
    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
      console.log(`🎵 Finished playing: ${song.title}`);
      serverQueue.songs.shift();
      playSong(guildId);
    });

    // Log any errors from the audio player
    serverQueue.player.on('error', (error) => {
      console.error("❌ AudioPlayer encountered an error:", error);
      serverQueue.songs.shift();
      playSong(guildId);
    });
    serverQueue.player.on(AudioPlayerStatus.Playing, () => console.log("🎶 Audio is playing!"));
    serverQueue.player.on(AudioPlayerStatus.Idle, () => console.log("⚠️ Audio stopped (idle)!"));
    serverQueue.player.on("error", (error) => console.error("❌ Player error:", error));

  } catch (error) {
    console.error("❌ Error fetching/playing song:", error);
    serverQueue.songs.shift();
    playSong(guildId);
  }
}

// !skip command: Skips the current song
function skip(message) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue || serverQueue.songs.length === 0) {
    return message.reply("❌ No song to skip!");
  }
  serverQueue.player.stop();
  message.reply("⏭ Skipped!");
}

// !stop command: Stops playback and leaves the voice channel
function stop(message) {
  const serverQueue = queue.get(message.guild.id);
  if (!serverQueue) return message.reply("❌ No music playing!");
  serverQueue.songs = [];
  serverQueue.player.stop();
  serverQueue.connection.destroy();
  queue.delete(message.guild.id);
  message.reply("🛑 Stopped the music and left the channel.");
}

// --- Client Login ---
client.login(TOKEN);
