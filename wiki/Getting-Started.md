# Alustamine

Järgi neid samme, et projekt oma arvutis tööle panna.

## 📋 Eeltingimused

- **Bun**: Veendu, et sul on paigaldatud [Bun](https://bun.sh) (versioon 1.3 või uuem).

## 🛠️ Paigaldamine

1. **Klooni repositoorium**:
   ```sh
   git clone https://github.com/kortex-test-org/nutika-elektrivorgu-Juhtimiskeskus.git
   cd nutika-elektrivorgu-Juhtimiskeskus
   ```

2. **Paigalda sõltuvused**:
   ```sh
   bun install
   ```

3. **Seadista keskkond**:
   Kopeeri näidisfail:
   ```sh
   cp .env.example .env
   ```
   Ava `.env` ja määra järgmised väärtused:
   - `JWT_SECRET`: Pikk suvaline sõne (vähemalt 32 märki).
   - `DATABASE_URL`: (Valikuline) Jäta tühjaks, et kasutada lokaalset **PGLite** andmebaasi.

## 🚀 Rakenduse käivitamine

Käivita arenduskeskkond Turborepo abil:
```sh
bun run dev
```

See käivitab:
- **Backend**: [http://localhost:3001](http://localhost:3001)
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Swagger UI**: [http://localhost:3001/docs](http://localhost:3001/docs)

![Rakendus töös](docs/screenshots/app_running.png)
*Joonis 1. Töötav rakendus lokaalses arenduskeskkonnas*

## 🗄️ Andmebaasi seadistamine

Projekt kasutab DrizzleORM-i. PGLite puhul rakendatakse migratsioonid automaatselt, kuid saad neid ka käsitsi hallata:

1. **Genereeri migratsioonid**:
   ```sh
   bun run db:generate
   ```

2. **Rakenda migratsioonid**:
   ```sh
   bun run db:migrate
   ```

## 🧪 Testide käivitamine

Veendu, et kõik töötab korrektselt:
```sh
bun test
```
Katvuse kontrollimiseks:
```sh
bun test --coverage
```
