# Nutika Elektrivõrgu Juhtimiskeskus — Спецификация проекта для разработки

## Контекст

Ты разрабатываешь **полнофункциональное fullstack веб-приложение** — центр управления умными устройствами на основе биржевых цен на электроэнергию Nord Pool. Это студенческий дипломный проект, который будет оцениваться по техническому заданию (ТЗ). Приложение должно **строго соответствовать всем требованиям ТЗ**, описанным в этом документе.

---

## Технический стек (СТРОГО СОБЛЮДАТЬ)

### Монорепо
```
Bun workspaces
├── apps/
│   ├── frontend/   — Vinext (https://github.com/cloudflare/vinext)
│   └── backend/    — Bun + Elysia
└── packages/
    └── shared/     — общие TypeScript типы + Drizzle схема + TypeBox схемы
```

- **Package manager:** Bun (не npm, не pnpm)
- **Язык:** TypeScript везде, strict mode
- **Linter/Formatter:** Biome
- **Тесты:** Vitest

### Frontend
- **Framework:** Vinext — Vite-плагин реализующий Next.js API. Устанавливается как `vinext`, запускается через `vinext dev` / `vinext build` / `vinext start`. Поддерживает App Router и Pages Router Next.js. Деплоится как обычный Node.js/Bun HTTP-сервер в Docker-контейнере.
- **UI:** React 19 + Tailwind CSS + shadcn/ui
- **Стейт:** Zustand (клиентский) + React Query (серверный стейт / кеш)
- **Real-time:** WebSocket (нативный браузерный API)
- **Форм:** react-hook-form + `@hookform/resolvers/typebox`

### Backend
- **Runtime:** Bun
- **Framework:** Elysia
- **Auth:** JWT (библиотека `@elysiajs/jwt`) + bcrypt/argon2 для паролей
- **WebSocket:** встроенный WebSocket в Elysia
- **Валидация:** TypeBox (`@sinclair/typebox`) — нативная интеграция с Elysia, схемы компилируются в JSON Schema, автогенерация OpenAPI. Shared схемы переиспользуются на фронте и бэке.
- **Cron:** `node-cron` или встроенный Bun scheduler — для периодического фетча цен

### База данных
- **ORM:** DrizzleORM
- **Прод:** PostgreSQL (`DATABASE_URL` в env)
- **Локальная разработка:** PGLite (`@electric-sql/pglite`) — если `DATABASE_URL` не задан, используется автоматически

```typescript
// packages/shared/src/db.ts — ОБЯЗАТЕЛЬНЫЙ паттерн
import { drizzle } from 'drizzle-orm/pglite'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { PGlite } from '@electric-sql/pglite'
import * as schema from './schema'

export const db = process.env.DATABASE_URL
  ? drizzlePg(process.env.DATABASE_URL, { schema })
  : drizzle(new PGlite('./local.db'), { schema })
```

### Паттерн валидации с TypeBox (ОБЯЗАТЕЛЬНО)

TypeBox схемы определяются в `packages/shared` и переиспользуются на бэке (Elysia) и фронте (react-hook-form).

```typescript
// packages/shared/src/validators.ts
import { Type, Static } from '@sinclair/typebox'

// Определяем схему один раз
export const CreateDeviceSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100 }),
  description: Type.Optional(Type.String()),
  connectionType: Type.Union([Type.Literal('http'), Type.Literal('mqtt')]),
  host: Type.String({ minLength: 1 }),
  port: Type.Optional(Type.Number({ minimum: 1, maximum: 65535 })),
  topic: Type.Optional(Type.String()),
  threshold: Type.Optional(Type.Number({ minimum: -500 })),
  isCritical: Type.Boolean({ default: false }),
})

// TypeScript тип выводится автоматически из схемы
export type CreateDeviceDto = Static<typeof CreateDeviceSchema>
```

```typescript
// apps/backend/src/routes/devices.ts — Elysia использует схему напрямую
import { CreateDeviceSchema } from '@smartgrid/shared/validators'

app.post('/api/devices', ({ body }) => {
  // body уже провалидирован и типизирован как CreateDeviceDto
}, { body: CreateDeviceSchema })
```

```typescript
// apps/frontend/src/components/DeviceForm.tsx — react-hook-form + TypeBox resolver
import { typeboxResolver } from '@hookform/resolvers/typebox'
import { CreateDeviceSchema, type CreateDeviceDto } from '@smartgrid/shared/validators'

const form = useForm<CreateDeviceDto>({
  resolver: typeboxResolver(CreateDeviceSchema),
})
```

**Ключевые правила TypeBox:**
- `t` / `Type` — одно и то же, импортировать как `Type` для ясности
- Никогда не дублировать схемы — одна схема в `shared`, используется везде
- `Static<typeof Schema>` — всегда выводить TypeScript тип из схемы, не писать вручную
- В Elysia передавать схему в `{ body: Schema }`, не валидировать вручную

### Инфраструктура (реализовать, но не приоритет MVP)
- **Деплой:** Coolify (self-hosted PaaS) + Docker
- **CI/CD:** GitHub Actions → тесты + сборка + деплой
- **Мониторинг:** Grafana + Loki (добавить позже, но структурированные JSON логи писать с самого начала)

---

## Схема базы данных (DrizzleORM)

```typescript
// packages/shared/src/schema.ts

// Пользователи
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'master' | 'user'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Устройства
export const devices = pgTable('devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  connectionType: varchar('connection_type', { length: 20 }).notNull(), // 'http' | 'mqtt'
  host: varchar('host', { length: 255 }).notNull(),
  port: integer('port'),
  topic: varchar('topic', { length: 255 }), // для MQTT
  threshold: numeric('threshold', { precision: 10, scale: 2 }), // €/МВт·ч
  isCritical: boolean('is_critical').notNull().default(false),
  overrideActive: boolean('override_active').notNull().default(false),
  overrideState: boolean('override_state'), // true=on, false=off
  currentState: boolean('current_state').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Лог команд устройствам
export const deviceCommandsLog = pgTable('device_commands_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  deviceId: uuid('device_id').notNull().references(() => devices.id, { onDelete: 'cascade' }),
  command: varchar('command', { length: 10 }).notNull(), // 'on' | 'off'
  triggeredBy: varchar('triggered_by', { length: 20 }).notNull(), // 'auto' | 'manual' | 'override'
  priceAtTime: numeric('price_at_time', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// История цен
export const prices = pgTable('prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  timestamp: timestamp('timestamp').notNull().unique(),
  priceEurMwh: numeric('price_eur_mwh', { precision: 10, scale: 2 }).notNull(),
  source: varchar('source', { length: 50 }).notNull().default('elering'),
})

// Конфиг экономии (фиксированный тариф пользователя)
export const savingsConfig = pgTable('savings_config', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fixedRateEurKwh: numeric('fixed_rate_eur_kwh', { precision: 10, scale: 4 }).notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Настройки уведомлений
export const notificationSettings = pgTable('notification_settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 20 }), // 'telegram' | 'discord' | null
  telegramChatId: varchar('telegram_chat_id', { length: 100 }),
  discordWebhookUrl: varchar('discord_webhook_url', { length: 500 }),
  criticalPriceThreshold: numeric('critical_price_threshold', { precision: 10, scale: 2 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

**ВАЖНО:** Использовать `crypto.randomUUID()` на уровне приложения ИЛИ `.defaultRandom()` в Drizzle — не использовать `gen_random_uuid()` в SQL напрямую (несовместимо с PGLite без расширений).

---

## API эндпоинты (Elysia backend)

### Auth — `/api/auth`
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Создание первого Master-пользователя (только если нет ни одного пользователя) |
| POST | `/api/auth/login` | Логин → возвращает JWT |
| POST | `/api/auth/logout` | Инвалидация сессии |
| GET | `/api/auth/me` | Текущий пользователь |

### Users — `/api/users` (только role=master)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/users` | Список всех пользователей |
| POST | `/api/users` | Создать пользователя |
| PATCH | `/api/users/:id` | Обновить пользователя |
| DELETE | `/api/users/:id` | Удалить пользователя |
| PATCH | `/api/users/:id/deactivate` | Деактивировать |

### Devices — `/api/devices`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/devices` | Устройства текущего пользователя |
| POST | `/api/devices` | Добавить устройство + тест соединения |
| PATCH | `/api/devices/:id` | Обновить устройство |
| DELETE | `/api/devices/:id` | Удалить |
| GET | `/api/devices/:id/status` | Текущее состояние устройства |
| POST | `/api/devices/:id/toggle` | Ручное вкл/выкл |
| POST | `/api/devices/:id/override` | Включить/выключить override-режим |
| GET | `/api/devices/:id/logs` | История команд устройству |

### Prices — `/api/prices`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/prices/current` | Текущая цена |
| GET | `/api/prices/forecast` | Прогноз на 24 часа (из Elering API) |
| GET | `/api/prices/history` | История цен (query: from, to) |

### Savings — `/api/savings`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/savings` | Расчёт экономии (query: period=day/week/month) |
| GET | `/api/savings/config` | Текущий фиксированный тариф пользователя |
| PUT | `/api/savings/config` | Обновить фиксированный тариф |

### Notifications — `/api/notifications`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/notifications/settings` | Текущие настройки |
| PUT | `/api/notifications/settings` | Обновить канал и пороги |

### WebSocket — `/ws`
Один WebSocket канал с событиями:
```typescript
type WSEvent =
  | { type: 'price_update'; data: { priceEurMwh: number; timestamp: string } }
  | { type: 'device_state_changed'; data: { deviceId: string; state: boolean; triggeredBy: string } }
  | { type: 'device_disconnected'; data: { deviceId: string } }
  | { type: 'price_threshold_alert'; data: { priceEurMwh: number; threshold: number } }
```

---

## Страницы frontend (Vinext / Next.js App Router)

| Путь | Описание | Доступ |
|------|----------|--------|
| `/login` | Форма входа | Публичный |
| `/` | Control Center — текущая цена, статус всех устройств, override | Авторизованный |
| `/devices` | Список устройств, CRUD | Авторизованный |
| `/devices/new` | Форма добавления устройства | Авторизованный |
| `/devices/[id]` | Детали устройства + лог команд | Авторизованный |
| `/forecast` | График прогноза цен 24ч + план переключений | Авторизованный |
| `/savings` | Отчёт об экономии с графиками | Авторизованный |
| `/settings` | Уведомления, фиксированный тариф, режим отпуска | Авторизованный |
| `/admin/users` | Управление пользователями | Только Master |

---

## Функциональные требования (обязательно реализовать)

### 1. Управление пользователями (User Master)
- Первый зарегистрированный пользователь автоматически получает роль `master`
- Master может добавлять, редактировать, деактивировать других пользователей
- Обычный пользователь видит только свои устройства
- Проверка роли **обязательно** как в middleware backend, так и в UI

### 2. Управление устройствами
- При добавлении устройства — обязательный тест соединения (HTTP ping или MQTT connect)
- Поддержка двух типов подключения: HTTP API и MQTT
- Логирование каждой команды с timestamp и причиной (auto/manual/override)
- Запрос текущего состояния устройства

### 3. Control Center (главная страница)
- Текущая биржевая цена обновляется в реальном времени через WebSocket
- Для каждого устройства: текущее состояние, порог, кнопка override
- Manual override: устройство переходит в ручной режим, игнорирует автоматику до ручного снятия
- Автоматическое переключение: cron-job каждый час проверяет все устройства и их пороги

### 4. Сохранение экономии
- Пользователь вводит свой фиксированный тариф (€/кВт·ч)
- Расчёт: (фиксированная_цена - реальная_биржевая_цена) × потребление × время_работы
- Отображение по периодам: день / неделя / месяц
- Детализация по каждому периоду (прозрачный расчёт)

### 5. Прогноз на 24 часа
- Получить из публичного API Elering: `https://dashboard.elering.ee/api/nps/price`
- Визуализировать на графике (recharts или chart.js)
- Показать когда какие устройства будут включены/выключены по текущим порогам

### 6. Уведомления
- **Telegram Bot API:** отправка сообщений в чат пользователя
- **Discord Webhook:** отправка в канал
- Пользователь сам вводит токен/webhook URL в настройках
- Триггеры: цена > критического порога, устройство auto-переключилось, устройство потеряло связь

### 7. Режим отпуска
- Кнопка на странице настроек — деактивирует все некритичные устройства
- Критичные устройства (флаг `isCritical`) остаются включёнными
- Выход из режима восстанавливает предыдущие состояния

---

## Тестирование (обязательные требования ТЗ)

Тесты **обязательны**, проект без тестов критической бизнес-логики не принимается.

### Обязательный coverage ≥ 80% для:
1. **Алгоритм порога** — логика `price >= threshold → device off`
2. **Калькулятор экономии** — расчёт разницы фиксированный vs биржевой тариф
3. **Авторизация** — middleware проверки роли (master/user)
4. **Логика отправки команды устройству** — включая retry и обработку ошибок

### Edge cases (обязательно покрыть тестами):
- Elering API не отвечает → использовать последнюю известную цену + warn лог
- База данных недоступна → логировать ошибку, не отправлять команды устройствам
- Биржевая цена < 0 → применять заранее определённое правило (не уходить в цикл)

### Инструменты:
```bash
bun test              # запуск всех тестов
bun test --coverage   # с coverage отчётом
```

---

## Логирование (готовиться к Grafana/Loki)

С самого начала писать **структурированные JSON логи**. Это нужно для последующей интеграции с Loki.

```typescript
// packages/shared/src/logger.ts
const log = (level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL', message: string, context?: object) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }))
}

// Использование:
log('INFO', 'Device toggled', { deviceId, command: 'on', triggeredBy: 'auto' })
log('WARNING', 'Elering API slow response', { latencyMs: 3200 })
log('ERROR', 'Database connection lost', { error: err.message })
log('CRITICAL', 'System startup failed', { error: err.message })
```

**Обязательные события для логирования:**
- `INFO`: переключение устройства, вход пользователя, API запрос
- `WARNING`: медленный ответ Elering API (>2s), высокая биржевая цена
- `ERROR`: таймаут API Elering, потеря соединения с БД, ошибка аутентификации
- `CRITICAL`: сбой при запуске системы, повреждение данных

---

## Структура проекта

```
/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts              # Elysia app entry
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── devices.ts
│   │   │   │   ├── prices.ts
│   │   │   │   ├── savings.ts
│   │   │   │   └── notifications.ts
│   │   │   ├── services/
│   │   │   │   ├── elering.ts        # Фетч цен из Elering API
│   │   │   │   ├── device-control.ts # Отправка команд устройствам
│   │   │   │   ├── automation.ts     # Cron-логика автопереключений
│   │   │   │   ├── savings.ts        # Расчёт экономии
│   │   │   │   └── notifications.ts  # Telegram/Discord
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # JWT проверка
│   │   │   │   └── role.ts           # Проверка роли master
│   │   │   └── ws/
│   │   │       └── handler.ts        # WebSocket events
│   │   ├── tests/
│   │   │   ├── automation.test.ts
│   │   │   ├── savings.test.ts
│   │   │   ├── auth.test.ts
│   │   │   └── device-control.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx              # Control Center
│       │   ├── login/page.tsx
│       │   ├── devices/
│       │   │   ├── page.tsx
│       │   │   ├── new/page.tsx
│       │   │   └── [id]/page.tsx
│       │   ├── forecast/page.tsx
│       │   ├── savings/page.tsx
│       │   ├── settings/page.tsx
│       │   └── admin/users/page.tsx
│       ├── components/
│       │   ├── devices/
│       │   ├── dashboard/
│       │   └── ui/                   # shadcn/ui компоненты
│       ├── hooks/
│       │   ├── useWebSocket.ts       # WebSocket подключение
│       │   └── useDevices.ts
│       ├── lib/
│       │   └── api.ts                # fetch-обёртка для API
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── schema.ts             # Drizzle схема
│       │   ├── db.ts                 # PGLite/PostgreSQL адаптер
│       │   ├── types.ts              # Общие TypeScript типы
│       │   ├── validators.ts         # TypeBox схемы (переиспользуются на фронте и бэке)
│       │   └── logger.ts             # JSON logger
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                      # Bun workspaces root
├── biome.json                        # Biome конфиг
├── drizzle.config.ts                 # Drizzle Kit конфиг (PostgreSQL)
├── drizzle.config.local.ts           # Drizzle Kit конфиг (PGLite)
├── .env.example
├── .gitignore                        # включая local.db
└── README.md
```

---

## Правила разработки (СТРОГО СОБЛЮДАТЬ)

### Общие
1. **TypeScript strict mode везде.** Никаких `any`, никаких `@ts-ignore` без объяснения.
2. **Все зависимости — последние стабильные версии.** Проверять `bun audit` перед коммитом.
3. **Lockfile в репозитории** — `bun.lockb` всегда коммитится.
4. **Никаких захардкоженных секретов** — только через `.env`. Все ключи API, URL баз данных, JWT секреты — в environment variables.
5. **Код проходит Biome** — нет ошибок lint и format перед коммитом.
6. **`local.db` в `.gitignore`** — файл PGLite не попадает в репозиторий.

### Backend
7. **Серверная валидация обязательна для каждого эндпоинта** — независимо от frontend валидации. Использовать Zod схемы из `packages/shared`.
8. **Никогда не возвращать stack trace клиенту** — только `{ error: string }` с человекочитаемым сообщением.
9. **Graceful degradation для Elering API** — если API не отвечает, использовать последнюю цену из БД + писать WARNING лог. Не крашиться.
10. **Проверка роли в middleware, не в роутах** — роуты не должны содержать `if (user.role !== 'master')`.
11. **Cron-job автоматики**: при старте сервиса запускать фетч текущей цены, затем каждый час обновлять и проверять пороги всех устройств.
12. **Транзакции для связанных операций** — команда устройству и запись в лог — в одной транзакции.

### Frontend
13. **Защищённые роуты через middleware** — `middleware.ts` Vinext/Next.js проверяет JWT, редиректит неавторизованных на `/login`.
14. **WebSocket переподключение** — при обрыве соединения автоматически переподключаться с exponential backoff.
15. **Оптимистичные обновления UI** — toggle устройства обновляет UI мгновенно, откатывает при ошибке.
16. **Загрузочные состояния и ошибки** — каждый запрос имеет loading/error состояние, пользователь видит понятные сообщения.
17. **Mobile-first** — интерфейс работает на мобильных устройствах.

### База данных
18. **Миграции через Drizzle Kit** — никаких прямых SQL ALTER TABLE в коде.
19. **UUID для первичных ключей** — не serial/autoincrement.
20. **Индексы** — добавить индексы на `devices.userId`, `deviceCommandsLog.deviceId`, `prices.timestamp`.

### Тесты
21. **Тесты запускаются без внешних зависимостей** — мокировать Elering API, мокировать БД (через PGLite in-memory или моки).
22. **Каждый edge case из ТЗ покрыт тестом** — Elering timeout, цена < 0, потеря БД.
23. **Тесты в CI** — `bun test` должен проходить в GitHub Actions.

---

## Интеграция с Elering API

Публичный API для цен Nord Pool (Эстония):

```
GET https://dashboard.elering.ee/api/nps/price?start={ISO8601}&end={ISO8601}
```

Пример ответа:
```json
{
  "success": true,
  "data": {
    "ee": [
      { "timestamp": 1700000000, "price": 85.23 }
    ]
  }
}
```

- Цена в **€/МВт·ч**
- При конвертации в €/кВт·ч делить на 1000
- Запрашивать текущий час и следующие 24 часа для прогноза
- Обработать случай когда API недоступен (см. правило 9)

---

## Docker (подготовить, не приоритет MVP)

### Backend Dockerfile
```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lockb ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
RUN bun install --frozen-lockfile
WORKDIR /app/apps/backend
EXPOSE 3001
CMD ["bun", "run", "src/index.ts"]
```

### Frontend Dockerfile
```dockerfile
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
RUN bun install --frozen-lockfile
WORKDIR /app/apps/frontend
RUN bun run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/package.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml (для локальной разработки с реальным PostgreSQL)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: smartgrid
      POSTGRES_USER: smartgrid
      POSTGRES_PASSWORD: smartgrid
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      DATABASE_URL: postgresql://smartgrid:smartgrid@postgres:5432/smartgrid
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## .env.example

```env
# База данных (если не задан — используется PGLite локально)
DATABASE_URL=postgresql://user:password@localhost:5432/smartgrid

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Telegram (опционально)
TELEGRAM_BOT_TOKEN=

# Discord (опционально — пользователь вводит webhook URL сам в настройках)

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## Порядок разработки (рекомендуемый)

1. **Scaffold монорепо** — `package.json` с workspaces, tsconfigs, Biome конфиг
2. **`packages/shared`** — Drizzle схема, db адаптер (PGLite/PostgreSQL), TypeBox схемы валидации, logger
3. **Backend: Auth** — регистрация, логин, JWT middleware
4. **Backend: Devices** — CRUD + логика команд + лог
5. **Backend: Elering сервис** — фетч цен + cron-job автоматики
6. **Backend: WebSocket** — real-time события
7. **Frontend: Auth** — страница логина, middleware защиты роутов
8. **Frontend: Control Center** — главная страница с WebSocket
9. **Frontend: Devices** — CRUD устройств
10. **Backend + Frontend: Savings** — расчёт и отображение экономии
11. **Frontend: Forecast** — прогноз на 24 часа
12. **Notifications** — Telegram/Discord
13. **Vacation mode** — режим отпуска
14. **Тесты** — покрыть критическую бизнес-логику
15. **Docker** — Dockerfile + docker-compose

---

## Чеклист соответствия ТЗ

Перед сдачей убедиться что **всё** отмечено:

### Инфраструктура
- [ ] Приложение запускается в Docker контейнере
- [ ] `docker-compose.yml` с корректной конфигурацией
- [ ] CI/CD pipeline (GitHub Actions): тесты → build → deploy
- [ ] Все секреты в env, не в коде
- [ ] `bun audit` без критических уязвимостей

### Функциональность
- [ ] Регистрация первого Master пользователя
- [ ] Многопользовательский режим (Master/User роли)
- [ ] CRUD устройств с тестом соединения при добавлении
- [ ] Автоматическое переключение по ценовому порогу
- [ ] Manual override режим
- [ ] Real-time обновление цены (WebSocket)
- [ ] Прогноз цен на 24 часа (Elering API)
- [ ] Отчёт об экономии (день/неделя/месяц)
- [ ] Уведомления (Telegram или Discord)
- [ ] Режим отпуска

### Надёжность
- [ ] Серверная валидация на каждом эндпоинте
- [ ] Graceful degradation при недоступности Elering API
- [ ] Обработка потери соединения с БД
- [ ] Обработка отрицательных цен
- [ ] Никогда не возвращать stack trace клиенту

### Тесты
- [ ] Юнит-тесты: алгоритм порога
- [ ] Юнит-тесты: калькулятор экономии
- [ ] Юнит-тесты: проверка ролей
- [ ] Юнит-тесты: логика команды устройству
- [ ] Coverage ≥ 80% на критических модулях
- [ ] Тесты запускаются без внешних зависимостей

### Мониторинг (базовая подготовка)
- [ ] Все логи в структурированном JSON формате
- [ ] Уровни: INFO / WARNING / ERROR / CRITICAL
- [ ] Edge case ситуации генерируют ERROR лог с контекстом
