# Nutika Elektrivõrgu Juhtimiskeskus

[![CI](https://github.com/kortex-test-org/nutika-elektrivorgu-Juhtimiskeskus/actions/workflows/ci.yml/badge.svg)](https://github.com/kortex-test-org/nutika-elektrivorgu-Juhtimiskeskus/actions/workflows/ci.yml)
[![Deployment](https://github.com/kortex-test-org/nutika-elektrivorgu-Juhtimiskeskus/actions/workflows/deploy.yml/badge.svg)](https://github.com/kortex-test-org/nutika-elektrivorgu-Juhtimiskeskus/actions/workflows/deploy.yml)

Professionaalne nutivõrgu juhtimiskeskus, mis on loodud koduse energiatarbimise optimeerimiseks, hallates nutiseadmeid reaalajas Nord Pooli elektrienergia börsihindade alusel ([Elering API](https://dashboard.elering.ee/api)).

---

## 📸 Süsteemi vaade

![Juhtimispaneeli vaade](docs/screenshots/dashboard_main.png)
*Joonis 1. Peamine juhtpaneel reaalajas hindade ja seadmete olekutega*

---

## 🌟 Põhifunktsioonid

### ⚡ Reaalajas hinna jälgimine
- **Live-uuendused:** Elektri börsihinnad uuenevad reaalajas WebSocketi kaudu.
- **24h prognoos:** Visuaalne 24-tunnine hinnaprognoosi graafik tarbimise planeerimiseks.
- **Hinnapiiri teavitused:** Automaatsed teavitused, kui hind ületab kasutaja määratud limiidi.

### 🤖 Nutikas automatiseerimine
- **Automaatne lülitus:** Seadmed lülituvad sisse/välja vastavalt elektrihinnale ja määratud lävendile.
- **Käsitsi juhtimine:** Täielik kontroll seadmete üle koos override-režiimiga, mis eirab automaatikat.
- **Puhkuse režiim:** Ühe klikiga mittekriitiliste seadmete väljalülitamine, hoides samal ajal olulised seadmed (nt turvasüsteem, külmik) töös.

### 📊 Analüütika ja säästmine
- **Säästukalkulaator:** Reaalajas arvutatav sääst võrreldes fikseeritud paketiga.
- **Detailne aruandlus:** Päeva, nädala ja kuu säästuaruanded koos visuaalsete graafikutega.
- **Toimingute ajalugu:** Täielik logi kõikidest seadme lülitustest (nii automaatsed kui käsitsi).

### 🛡️ Turvalisus ja kasutajahaldus
- **Rollipõhine ligipääs:** Toetus `Master` (admin) ja `User` rollidele.
- **Turvaline autentimine:** JWT-põhine autentimine ja Argon2 paroolide räsimine.
- **Seadmete testimine:** Ühenduse kontroll HTTP ja MQTT seadmetele.

---

## 🛠️ Tehnoloogiline pinu

| Kiht | Tehnoloogia |
|---|---|
| **Frontend** | [Vinext](https://github.com/cloudflare/vinext) (React 19, Tailwind CSS, shadcn/ui) |
| **Backend** | [Bun](https://bun.sh) + [Elysia](https://elysiajs.com) |
| **Andmebaas** | PostgreSQL (Prod) / [PGLite](https://pglite.dev) (Dev) |
| **ORM** | [DrizzleORM](https://orm.drizzle.team) |
| **Valideerimine** | TypeBox (Jagatud skeemid) |
| **Monorepo** | Turborepo + Bun Workspaces |

---

## 🚀 Alustamine

### Eeltingimused
- **Bun** ≥ 1.3

### Paigaldus
```sh
# 1. Klooni repositoorium
git clone https://github.com/kortex-test-org/nutika-elektrivorgu-Juhtimiskeskus.git
cd nutika-elektrivorgu-Juhtimiskeskus

# 2. Paigalda sõltuvused
bun install

# 3. Seadista keskkonnamuutujad
cp .env.example .env
# Muuda .env faili ja määra JWT_SECRET
```

### Arendus
```sh
# Käivita arendusserverid
bun run dev

# Genereeri ja rakenda migratsioonid (PGLite)
bun run db:generate
bun run db:migrate
```

## 📜 Dokumentatsioon

- [Arhitektuur ja disain](docs/architecture.md)
- [API viide](docs/api.md)
- [Projekti tegevuskava (TODO)](docs/TODO.md)

---
Valmistatud ❤️ osana nutika elektrivõrgu juhtimislahendusest.

**Autorid:** Artur Panitšev, Denys Dunaiev

