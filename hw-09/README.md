# Task Tracker - Курсовий проєкт

Повноцінний трекер для задач з фронтендом на React + TypeScript та бекендом на Node.js + TypeScript.

## Структура проєкту

```
hw-09/
├── backend/          # Backend (Node.js + Express + Sequelize)
│   ├── src/
│   │   ├── config/   # Конфігурація БД
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── tests/
├── frontend/         # Frontend (React + Vite)
│   └── src/
│       └── features/
│           └── tasks/
└── docker-compose.yml
```

## Функціональність

### Frontend
- ✅ Створення задач
- ✅ Відображення та редагування задач
- ✅ Сортування задач по колонках за статусом (To Do, In Progress, Review, Done)
- ✅ Зміна статусу задач через drag'n'drop
- ✅ Валідація форм з відображенням помилок

### Backend
- ✅ REST API для CRUD-операцій із задач
- ✅ Фільтрація за статусом, пріоритетом, датою
- ✅ Зберігання даних у PostgreSQL через Sequelize
- ✅ Валідація request body і query params через zod
- ✅ Обробка помилок і статусів (400 / 404 / 500)
- ✅ Middleware: morgan (у dev mode), cors

## Швидкий старт

### Варіант 1: Автоматичний запуск (рекомендовано)

```bash
# 1. Запустіть базу даних через Docker
docker-compose up -d

# 2. Запустіть проєкт одним скриптом
chmod +x start.sh
./start.sh
```

Скрипт автоматично:
- Перевірить наявність Docker та Node.js
- Запустить PostgreSQL через Docker
- Встановить залежності (якщо потрібно)
- Запустить backend на http://localhost:3000
- Запустить frontend на http://localhost:5173

### Варіант 2: Ручний запуск

#### 1. Налаштування бази даних

**Через Docker (рекомендовано):**
```bash
docker-compose up -d
```

**Або вручну:**
```bash
createdb tasks
```

#### 2. Встановлення залежностей

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. Запуск проєкту

**Термінал 1 - Backend:**
```bash
cd backend
npm run dev
# Сервер запуститься на http://localhost:3000
```

**Термінал 2 - Frontend:**
```bash
cd frontend
npm run dev
# Додаток відкриється на http://localhost:5173
```

#### 4. Створення тестового користувача

Для створення задач потрібен користувач в БД:

```bash
# Через Docker
docker-compose exec postgres psql -U postgres -d tasks

# Або локально
psql -U postgres -d tasks
```

В psql виконайте:
```sql
INSERT INTO users (name, email, "createdAt", "updatedAt") 
VALUES ('Test User', 'test@example.com', NOW(), NOW());
```

## Команди

### Backend

```bash
npm run dev      # Запуск в режимі розробки
npm test         # Запуск тестів
npm run build    # Білд для production
npm start        # Запуск production версії
npm run lint     # Перевірка коду
npm run lint:fix # Автоматичне виправлення
```

### Frontend

```bash
npm run dev      # Запуск в режимі розробки
npm test         # Запуск тестів
npm run test:ui  # Тести з UI
npm run build    # Білд для production
npm run preview  # Перегляд production build
npm run lint     # Перевірка коду
npm run lint:fix # Автоматичне виправлення
```

## Тестування

### Frontend тести (Vitest + RTL)
- Валідація форми створення/оновлення деталей завдання
- Перевірка обов'язкових полів, формату та довжини
- Відображення помилок валідації
- Стан кнопки submit (disabled/enabled)

### Backend тести (Jest + Supertest)
- Тести для всіх CRUD-ендпоінтів
- Перевірка успішних та неуспішних запитів
- Валідація помилок (400/404/500)

## API Endpoints

- `GET /tasks` - Отримати всі задачі (з фільтрацією)
- `GET /tasks/:id` - Отримати задачу за ID
- `POST /tasks` - Створити нову задачу
- `PUT /tasks/:id` - Оновити задачу
- `DELETE /tasks/:id` - Видалити задачу

### Query параметри для фільтрації:
- `status` - фільтр за статусом (todo, in_progress, review, done)
- `priority` - фільтр за пріоритетом (low, medium, high)
- `createdAt` - фільтр за датою створення

### Приклад використання API:

```bash
# Створити задачу
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "status": "todo", "priority": "medium", "userId": 1}'

# Отримати всі задачі
curl http://localhost:3000/tasks

# Фільтрація за статусом
curl http://localhost:3000/tasks?status=todo

# Оновити задачу
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Task", "status": "in_progress"}'

# Видалити задачу
curl -X DELETE http://localhost:3000/tasks/1
```

## Технології

### Backend
- Node.js
- Express
- TypeScript
- Sequelize (PostgreSQL)
- Zod (валідація)
- Jest + Supertest (тестування)
- Morgan (логування)
- CORS

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- React Hook Form + Zod
- @dnd-kit (drag'n'drop)
- Vitest + React Testing Library

## Налаштування

### Змінні оточення

Backend використовує значення за замовчуванням, але можна налаштувати через `.env` файл:

```bash
# backend/.env
DB_NAME=tasks
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
PORT=3000
```

### ESLint + Prettier

Проєкт налаштований з ESLint та Prettier для обох частин (frontend та backend).

```bash
# Перевірка
npm run lint

# Автоматичне виправлення
npm run lint:fix
```

### Docker

Корисні команди для роботи з Docker:

```bash
# Запуск
docker-compose up -d

# Зупинка
docker-compose down

# Перегляд логів
docker-compose logs postgres

# Підключення до БД
docker-compose exec postgres psql -U postgres -d tasks

# Видалення даних
docker-compose down -v
```

## Вирішення проблем

### Помилка підключення до БД
- Перевірте, чи запущений Docker контейнер: `docker-compose ps`
- Перевірте налаштування в `.env` файлі

### Порт зайнятий
- Змініть порт в `.env` файлі або зупиніть інший процес

### Помилки валідації
- Перевірте формат даних відповідно до схем валідації (zod)
