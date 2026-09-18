# Деплой Discord бота на Railway.app

## Шаг 1: Подготовка

1. Зарегистрируйся на https://railway.app (можно через GitHub)
2. Убедись что файл `audio.mp3` находится в папке проекта
3. У тебя должен быть токен Discord бота

## Шаг 2: Деплой через GitHub

### Вариант A: Через GitHub (рекомендуется)

1. **Создай GitHub репозиторий:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   ```

2. **Создай репозиторий на GitHub:**
   - Зайди на https://github.com/new
   - Создай новый репозиторий (например, `discord-voice-bot`)
   - НЕ добавляй README, .gitignore или лицензию

3. **Запуш код:**
   ```bash
   git remote add origin https://github.com/твой-username/discord-voice-bot.git
   git push -u origin main
   ```

4. **Деплой на Railway:**
   - Зайди на https://railway.app
   - Нажми "New Project" → "Deploy from GitHub repo"
   - Выбери свой репозиторий `discord-voice-bot`
   - Railway автоматически обнаружит Dockerfile

5. **Добавь переменные окружения:**
   - В Railway проекте зайди в Variables
   - Добавь `DISCORD_TOKEN` = твой токен бота
   - Сохрани

6. **Готово!** Бот автоматически задеплоится и запустится

### Вариант B: Через Railway CLI

1. **Установи Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Залогинься:**
   ```bash
   railway login
   ```

3. **Инициализируй проект:**
   ```bash
   railway init
   ```

4. **Добавь переменную окружения:**
   ```bash
   railway variables --set DISCORD_TOKEN=твой_токен
   ```

5. **Задеплой:**
   ```bash
   railway up
   ```

## Шаг 3: Проверка

1. В Railway дашборде открой "Deployments" — должен быть статус "Success"
2. Открой "Logs" — должно быть `✅ Бот запущен как ГОЛОСОВАНИЕ#7289`
3. В Discord зайди в голосовой канал
4. Напиши `!join` — бот подключится и начнёт играть музыку!

## Troubleshooting

### Бот не запускается
- Проверь логи в Railway
- Убедись что `DISCORD_TOKEN` правильный
- Проверь что файл `audio.mp3` закоммичен в git

### Бот запустился но не подключается к голосовому каналу
- Проверь права бота на сервере (Connect, Speak)
- Убедись что MESSAGE CONTENT INTENT включён в Discord Developer Portal

### Большой размер аудиофайла
- Railway free tier имеет лимиты на размер
- Если аудио больше 100 МБ, лучше использовать URL вместо файла

## Обновление бота

После изменений в коде:
```bash
git add .
git commit -m "Update bot"
git push
```

Railway автоматически задеплоит новую версию!

## Альтернативные VPS

Если Railway не подходит, можешь использовать:
- **Heroku** - https://heroku.com
- **Render** - https://render.com  
- **Fly.io** - https://fly.io
- **Oracle Cloud** (всегда бесплатно) - https://cloud.oracle.com

Все они поддерживают Dockerfile.
