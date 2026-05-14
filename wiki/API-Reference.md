# API Viide

Smart Grid Control Center API on RESTful teenus, mis on loodud Elysia raamistikuga.

## 🔐 Autentimine

Kõik kaitstud marsruudid nõuavad `Authorization: Bearer <JWT>` päist või kehtivat `auth_token` küpsist.

### `POST /api/auth/register`
Süsteemi esimese kasutaja (Master) registreerimine.
- **Keha**: `{ email, password }`
- **Vastus**: `{ token, user }`

### `POST /api/auth/login`
Kasutaja autentimine.
- **Keha**: `{ email, password }`
- **Vastus**: `{ token, user }`

---

## 👥 Kasutajad (Ainult Master)

### `GET /api/users`
Kõikide registreeritud kasutajate loetelu.

### `POST /api/users`
Uue kasutajakonto loomine.

---

## 🔌 Seadmed

### `GET /api/devices`
Autenditud kasutajale kuuluvate seadmete pärimine.

### `POST /api/devices`
Uue seadme lisamine.

![Seadme lisamise vorm](docs/screenshots/add_device_form.png)
*Joonis 1. Seadme lisamine ja ühenduse testimine*

### `POST /api/devices/:id/toggle`
Seadme oleku käsitsi lülitamine.

### `POST /api/devices/:id/override`
Manuaalse ülekirjutamise (override) režiimi aktiveerimine.

---

## 💶 Hinnad ja säästud

### `GET /api/prices/current`
Viimase elektrihinna pärimine.

### `GET /api/prices/forecast`
24-tunni hinnaprognoosi pärimine.

### `GET /api/savings`
Säästude arvutamine teatud perioodi kohta.

---

## 📢 Teavitused

### `PUT /api/notifications/settings`
Teavituste seadete uuendamine (Telegram/Discord).

---

## 🔌 WebSockets

Ühendu aadressil `ws://localhost:3001/ws` reaalajas sündmuste saamiseks.

### Väljastatavad sündmused:
- `price_update`: Uued hinnandmed.
- `device_state_changed`: Seade lülitus (auto/manual).
- `device_disconnected`: Süsteem kaotas ühenduse seadmega.
- `price_threshold_alert`: Hind ületas seadme lävendi.

![Swagger dokumentatsioon](docs/screenshots/swagger_ui.png)
*Joonis 2. Interaktiivne API dokumentatsioon (Swagger)*
