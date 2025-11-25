#!/bin/bash

echo "🚀 Запуск Task Tracker"
echo ""

# Перевірка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не встановлено. Будь ласка, встановіть Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не встановлено. Будь ласка, встановіть Docker Compose"
    exit 1
fi

# Перевірка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не встановлено. Будь ласка, встановіть Node.js 18+"
    exit 1
fi

echo "✅ Docker знайдено"
echo "✅ Node.js знайдено: $(node --version)"
echo ""

# Запуск PostgreSQL
echo "📦 Запуск PostgreSQL через Docker..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Помилка запуску Docker контейнера"
    exit 1
fi

echo "✅ PostgreSQL запущено"
echo ""

# Очікування готовності БД
echo "⏳ Очікування готовності бази даних..."
sleep 3

# Перевірка статусу
if docker-compose ps | grep -q "Up"; then
    echo "✅ База даних готова"
else
    echo "⚠️  Перевірте статус: docker-compose ps"
fi

echo ""

# Встановлення залежностей
echo "📦 Перевірка залежностей..."

if [ ! -d "backend/node_modules" ]; then
    echo "  Встановлення залежностей backend..."
    cd backend && npm install && cd ..
else
    echo "  ✅ Backend залежності встановлені"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "  Встановлення залежностей frontend..."
    cd frontend && npm install && cd ..
else
    echo "  ✅ Frontend залежності встановлені"
fi

echo ""

# Створення тестового користувача (якщо не існує)
echo "👤 Перевірка тестового користувача..."
USER_EXISTS=$(docker-compose exec -T postgres psql -U postgres -d tasks -tAc "SELECT 1 FROM users LIMIT 1" 2>/dev/null || echo "")

if [ -z "$USER_EXISTS" ]; then
    echo "  Створення тестового користувача..."
    docker-compose exec -T postgres psql -U postgres -d tasks <<EOF
INSERT INTO users (name, email, "createdAt", "updatedAt") 
VALUES ('Test User', 'test@example.com', NOW(), NOW())
ON CONFLICT DO NOTHING;
EOF
    echo "  ✅ Тестовий користувач створено"
else
    echo "  ✅ Тестовий користувач вже існує"
fi

echo ""

# Запуск Backend
echo "🔙 Запуск Backend на http://localhost:3000"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Запуск Frontend
echo "🎨 Запуск Frontend на http://localhost:5173"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Сервери запущені!"
echo ""
echo "📍 Адреси:"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "💡 Натисніть Ctrl+C для зупинки"
echo ""

# Обробка завершення
trap "echo ''; echo '🛑 Зупинка серверів...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Чекаємо завершення
wait
