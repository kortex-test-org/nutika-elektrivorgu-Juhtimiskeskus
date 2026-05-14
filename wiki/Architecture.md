# Süsteemi arhitektuur

Projekt on üles ehitatud kaasaegse TypeScript monorepo arhitektuurina, prioritiseerides koodi taaskasutust ja tüübiturvalisust.

## 🏗️ Monorepo struktuur

Kasutame **Turborepo** ja **Bun Workspaces** lahendust järgmiste komponentide haldamiseks:

- **`apps/backend`**: Elysia raamistikul põhinev API teenus.
- **`apps/frontend`**: Vinext (React 19) baasil loodud kasutajaliides.
- **`packages/shared`**: Ühine loogika, andmebaasi skeemid (Drizzle) ja valideerimine (TypeBox).
- **`packages/config`**: Ühised konfiguratsioonid TypeScripti ja ehitustööriistade jaoks.

![Arhitektuuri skeem](docs/screenshots/architecture_diagram.png)
*Joonis 1. Komponentide vaheline suhtlus ja andmevood*

## 💻 Backend disain

### Elysia raamistik
Valitud tänu selle suurele jõudlusele ja natiivsele Bun integratsioonile. Kasutab **TypeBox** skeeme otsast-lõpuni tüübiturvalisuse tagamiseks.

### Teenuste kiht
- **`EleringService`**: Suhtlus väliste API-dega hindade pärimiseks.
- **`DeviceControlService`**: Abstraktsioon seadmetele käskluste saatmiseks (HTTP/MQTT).
- **`AutomationService`**: Cron-põhine mootor, mis kontrollib seadmete lävesid igal täistunnil.
- **`NotificationService`**: Teavituste saatmine erinevatesse kanalitesse.

### Andmebaas
- **DrizzleORM**: Kergekaaluline ORM, mis tagab SQL päringute tüübiturvalisuse.
- **PostgreSQL**: Kasutuses toodangukeskkonnas.
- **PGLite**: WASM-põhine Postgres, mida kasutatakse lokaalseks arenduseks ilma Dockerita.

## 🎨 Frontend disain

### Vinext
Vite-põhine Next.js App Routeri implementatsioon, mis võimaldab kiiret arendust tuttavate mustritega.

### Olekuhaldus
- **Zustand**: Kliendipoolne olek (autentimine, UI eelistused).
- **React Query**: Serveripoolne olek (vahemälu, andmete sünkroniseerimine).

### Reaalajas ühenduvus
Natiivne WebSocketi klient ühendub backendiga, et võtta vastu `price_update` ja `device_state_changed` sündmusi.

## 🛡️ Turvalisus

- **JWT autentimine**: Tokenid hoitakse turvalistes küpsistes.
- **Argon2**: Paroolide räsimise standard.
- **RBAC**: Rollipõhine ligipääsu kontroll `Master` ja `User` rollidele.

## 🔄 Andmevoog

1. **Hinna pärimine**: `EleringService` pärib hinnad igal tunnil.
2. **Salvestamine**: Hinnad salvestatakse andmebaasi.
3. **Levitamine**: Backend saadab WebSocketi sündmuse kõikidele klientidele.
4. **Automatiseerimine**: `AutomationService` kontrollib seadmete lävesid.
5. **Täitmine**: Vajadusel saadab `DeviceControlService` käsu seadmele.
6. **UI uuendamine**: Kasutajaliides saab WebSocketi sündmuse ja uuendab vaadet koheselt.
