FROM node:18-slim

# Установка FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg python3 make g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем код и аудио
COPY . .

# Запускаем бота
CMD ["npm", "start"]
