# Discord Voice Bot

Бот для Discord, который постоянно проигрывает один трек в голосовом канале.

## Установка

1. Установи зависимости:
```bash
npm install
```

2. Установи FFmpeg (если еще не установлен):
   - Windows: скачай с https://ffmpeg.org/download.html
   - Или через Chocolatey: `choco install ffmpeg`
   - Или через winget: `winget install FFmpeg`

3. Создай бота в Discord Developer Portal:
   - Зайди на https://discord.com/developers/applications
   - Нажми "New Application"
   - Перейди в раздел "Bot"
   - Включи следующие Privileged Gateway Intents:
     - MESSAGE CONTENT INTENT
     - SERVER MEMBERS INTENT
   - Скопируй токен бота

4. Пригласи бота на сервер:
   - В разделе OAuth2 → URL Generator выбери:
     - Scopes: `bot`
     - Bot Permissions: `Connect`, `Speak`, `Send Messages`, `Read Messages/View Channels`
   - Перейди по сгенерированной ссылке

5. Настрой `.env` файл:
   - Открой файл `.env`
   - Замени `your_bot_token_here` на токен твоего бота

6. Положи аудиофайл `audio.mp3` в корень проекта

## Запуск

```bash
npm start
```

## Команды

- `!join` - бот подключится к твоему голосовому каналу и начнёт проигрывать трек
- `!leave` - бот отключится от голосового канала

## Как это работает

- Бот подключается к голосовому каналу по команде `!join`
- Начинает проигрывать файл `audio.mp3` в бесконечном цикле
- Остаётся в канале пока не получит команду `!leave`
- Автоматически переподключается при разрыве соединения
