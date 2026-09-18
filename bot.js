import { Client, GatewayIntentBits } from 'discord.js';
import { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection
} from '@discordjs/voice';
import { config } from 'dotenv';
import { createReadStream, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setDefaultResultOrder } from 'dns';

// Форсируем IPv4
setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let connection = null;
let player = null;

const audioPath = join(__dirname, 'audio.mp3');

// Функция для проигрывания трека
function playAudio(connection) {
  console.log('=== Попытка проиграть аудио ===');
  console.log('Путь к файлу:', audioPath);
  console.log('Файл существует?', existsSync(audioPath));
  
  if (!existsSync(audioPath)) {
    console.error('❌ ОШИБКА: Файл audio.mp3 не найден!');
    console.error('Положи файл audio.mp3 в папку:', __dirname);
    return;
  }
  
  try {
    const resource = createAudioResource(createReadStream(audioPath));
    
    if (!player) {
      console.log('Создаю новый аудио плеер...');
      player = createAudioPlayer();
      connection.subscribe(player);
      
      // Логируем все состояния плеера
      player.on(AudioPlayerStatus.Idle, () => {
        console.log('🔄 Трек закончился, начинаю заново...');
        playAudio(connection);
      });
      
      player.on(AudioPlayerStatus.Playing, () => {
        console.log('▶️ Трек проигрывается!');
      });
      
      player.on(AudioPlayerStatus.Paused, () => {
        console.log('⏸️ Трек на паузе');
      });
      
      player.on(AudioPlayerStatus.Buffering, () => {
        console.log('⏳ Буферизация...');
      });

      player.on('error', error => {
        console.error('❌ Ошибка проигрывания:', error);
      });
    }
    
    player.play(resource);
    console.log('✅ Команда на проигрывание отправлена');
  } catch (error) {
    console.error('❌ Ошибка при создании ресурса:', error);
  }
}

client.on('ready', () => {
  console.log(`\n✅ Бот запущен как ${client.user.tag}`);
  console.log('\n📋 Доступные команды:');
  console.log('  !join  - подключиться к голосовому каналу');
  console.log('  !leave - отключиться от голосового канала');
  console.log('\n🎵 Путь к аудио:', audioPath);
  console.log('📁 Файл существует?', existsSync(audioPath) ? '✅ Да' : '❌ НЕТ');
  
  if (!existsSync(audioPath)) {
    console.log('\n⚠️  ВНИМАНИЕ: Положи файл audio.mp3 в папку проекта!\n');
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Команда подключения к голосовому каналу
  if (message.content === '!join') {
    console.log('\n🎤 Получена команда !join от:', message.author.tag);
    
    const voiceChannel = message.member?.voice?.channel;
    
    if (!voiceChannel) {
      console.log('❌ Пользователь не в голосовом канале');
      return message.reply('Ты должен быть в голосовом канале!');
    }

    console.log('✅ Пользователь в канале:', voiceChannel.name);

    try {
      console.log('🔌 Подключаюсь к каналу...');
      console.log('Guild ID:', voiceChannel.guild.id);
      console.log('Channel ID:', voiceChannel.id);
      
      // Уничтожаем старое подключение если есть
      const existingConnection = getVoiceConnection(voiceChannel.guild.id);
      if (existingConnection) {
        console.log('⚠️  Уничтожаю старое подключение...');
        existingConnection.destroy();
      }
      
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
        debug: true,
      });

      // Отслеживаем все состояния подключения
      connection.on('stateChange', (oldState, newState) => {
        console.log(`🔄 Состояние: ${oldState.status} -> ${newState.status}`);
        
        // Если состояние Ready - сразу запускаем музыку
        if (newState.status === VoiceConnectionStatus.Ready) {
          console.log('✅ Подключение готово (из события)!');
          message.reply('Подключился к голосовому каналу! Начинаю проигрывать трек...');
          playAudio(connection);
        }
      });

      connection.on('error', (error) => {
        console.error('❌ Ошибка соединения:', error);
      });

      console.log('⏳ Жду готовности подключения (до 60 секунд)...');
      
      // Увеличим таймаут до 60 секунд
      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 60_000);
        console.log('✅ Подключение готово через await!');
      } catch (err) {
        console.error('⏰ Таймаут ожидания подключения:', err.message);
        console.log('Текущее состояние:', connection.state.status);
        throw err;
      }
      
      message.reply('Подключился к голосовому каналу! Начинаю проигрывать трек...');
      playAudio(connection);

      // Переподключение при разрыве связи
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        console.log('⚠️  Соединение потеряно, пытаюсь переподключиться...');
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch (error) {
          console.log('❌ Не удалось переподключиться');
          connection.destroy();
          connection = null;
          player = null;
        }
      });

    } catch (error) {
      console.error('❌ Ошибка подключения:', error);
      message.reply('Не удалось подключиться к каналу! Проверь консоль для деталей.');
    }
  }

  // Команда отключения от голосового канала
  if (message.content === '!leave') {
    if (connection) {
      connection.destroy();
      connection = null;
      player = null;
      message.reply('Отключился от голосового канала!');
    } else {
      message.reply('Я не нахожусь в голосовом канале!');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
