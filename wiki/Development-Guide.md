# Arendusjuhend

Tere tulemast Nutika elektrivõrgu juhtimiskeskuse arendusjuhendisse!

## 🛠️ Tööriistad

- **Biome**: Kasutame Biome-i lintimiseks ja vormindamiseks. Veendu, et su redaktor on seadistatud seda kasutama või käivita:
  ```sh
  bunx biome check . --write
  ```
- **Turborepo**: Haldab meie monorepo ülesandeid. Kasuta `bun run dev` kõige käivitamiseks või `bun run build` ehitamiseks.

## 📦 Sõltuvuste lisamine

Paketi lisamiseks kindlasse tööalasse:
```sh
bun add <package-name> --filter <app-or-package-name>
```

## 🧪 Testimise strateegia

Kasutame **Vitest** (läbi `bun test`) testimiseks.

- **Backend**: Fookus teenuste loogikal, lävendite algoritmidel ja API otspunktidel.
- **Frontend**: Testi utiliitfunktsioone ja keerulisi olekuüleminekuid.
- **Katvus**: Eesmärk on vähemalt 80% katvus kriitilisele äriloogikale.

![Testide tulemused](docs/screenshots/test_results.png)
*Joonis 1. Testide katvuse aruande näidis*

## 🚀 Deployment protsess

1. **Docker**: Igal rakendusel on oma `Dockerfile`.
2. **Docker Compose**: Orkestreerib kogu stacki (Postgres + Backend + Frontend).
3. **CI/CD**: GitHub Actions käivitab testid ja ehitab image-id automaatselt `main` harusse pushimisel.

## 📜 Kodeerimise standardid

1. **Tüübiturvalisus**: Kasuta `TypeBox` skeeme kõige jaoks, mis liigub üle API piiri.
2. **Logimine**: Kasuta struktureeritud JSON logijat `packages/shared` paketi seest.
   - `INFO`: Tavapärane töö.
   - `WARNING`: Taastatavad vead (nt API timeout).
   - `ERROR`: Taastamatud vead, mis ei peata rakendust.
3. **Nimetamine**: Kasuta camelCase-i muutujate/funktsioonide jaoks ja PascalCase-i komponentide/tüüpide jaoks.

## 🗃️ Andmebaasi migratsioonid

Kasuta alati `drizzle-kit` tööriista:
1. Muuda `packages/shared/src/schema.ts`.
2. Käivita `bun run db:generate`.
3. Kontrolli genereeritud SQL faili `drizzle/` kaustas.
4. Käivita `bun run db:migrate` rakendamiseks.
