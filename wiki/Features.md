# Süsteemi funktsioonid

Nutikas elektrivõrgu juhtimiskeskus sisaldab laia valikut funktsioone, mis on suunatud energiatõhususele ja kasutusmugavusele.

## ⚡ Reaalajas elektrihinna jälgimine
- **Elering integratsioon**: Ühendub ametliku Elering API-ga, et pärida Nord Pooli hindu Eesti regioonis.
- **WebSocket ülekanne**: Hinnad edastatakse kõikidele ühendatud klientidele koheselt nende muutumisel.
- **Värvikodeering**: Visuaalsed indikaatorid (Roheline/Kollane/Punane) aitavad kasutajatel mõista hetke hinnataset.

![Hinnagraafiku vaade](docs/screenshots/price_chart.png)
*Joonis 1. Reaalajas hinnagraafik ja prognoos*

## 🤖 Nutikas automatiseerimine
- **Lävendipõhine juhtimine**: Kasutajad saavad igale seadmele määrata hinnapiiri (nt 100€/MWh).
- **Automaatne lülitamine**: Süsteem jälgib pidevalt hindu ja lülitab seadmeid:
  - **VÄLJA**, kui hind ületab lävendi.
  - **SISSE**, kui hind langeb alla lävendi.
- **Töökindlus**: Sisaldab retry-loogikat ja ühenduse testimist seadmetega.

## 🕹️ Käsitsi juhtimine ja ülekirjutamine
- **Live-lülitid**: Seadmete sisse/välja lülitamine otse juhtpaneelilt.
- **Manual Override**: Võimalus lukustada seade kindlasse olekusse, peatades automaatika kuni luku eemaldamiseni.

![Seadmete haldus](docs/screenshots/device_management.png)
*Joonis 2. Seadmete loend ja lülitusnupud*

## 📈 24h hinnaprognoos
- **Visuaalne graafik**: Interaktiivne graafik järgmise 24 tunni hindadega.
- **Planeerimine**: Kasutajad näevad täpselt, millal nende seadmed on plaanitud töötama vastavalt hetke lävenditele.

## 💰 Säästukalkulaator
- **Fikseeritud vs Börs**: Võrdle, kui palju oled säästnud tänu automaatikale võrreldes fikseeritud paketiga.
- **Ajalooline analüüs**: Vaata säästusid päeva, nädala või kuu lõikes.

![Säästude aruanne](docs/screenshots/savings_report.png)
*Joonis 3. Kokkuhoiu analüüs ja graafikud*

## 🔔 Teavitused
- **Mitmekanaliline**: Toetab Telegrami ja Discordi teavitusi.
- **Nutikad triggerid**:
  - Kõrge hinna hoiatused.
  - Automaatse lülitamise teavitused.
  - Seadme ühenduse katkemise hoiatused.

## 🏝️ Puhkuse režiim
- **Pealüliti**: Ühe klikiga kõigi mittekriitiliste seadmete deaktiveerimine.
- **Kriitilisuse lipp**: Märgi seadmed nagu "Külmik" või "Turvasüsteem" kui `isCritical`, et puhkuse režiim neid kunagi välja ei lülitaks.

## 👥 Kasutajahaldus ja RBAC
- **Master roll**: Administraatori õigused kasutajate, rollide ja globaalsete seadete haldamiseks.
- **User roll**: Tavakasutaja õigused oma seadmete haldamiseks.
- **Turvalisus**: Turvaline JWT-põhine sessioonihaldus.
