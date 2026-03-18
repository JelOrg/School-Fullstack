# Management System

A web-based management application with real-time updates, role-based access control, and secure authentication.

---

## Tech Stack

| Onderdeel        | Technologie                                               |
| ---------------- | --------------------------------------------------------- |
| Frontend         | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3.8           |
| Backend          | Node.js met Express 5                                     |
| Database         | MySQL via Prisma ORM                                      |
| Database-adapter | @prisma/adapter-mariadb                                   |
| Authenticatie    | JSON Web Tokens (JWT), bcrypt                             |
| Realtime updates | Server-Sent Events (SSE)                                  |
| Databeveiliging  | DOMPurify (isomorphic-dompurify)                          |
| Autorisatie      | Rolgebaseerde toegangscontrole (employee, manager, admin) |
| Configuratie     | dotenv                                                    |

---

## Vereisten

| Software   | Minimale versie         | Toelichting                                                                                               |
| ---------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Node.js    | 18.0 of hoger           | Express 5 en bcrypt 6 vereisen minimaal versie 18                                                         |
| npm        | Meegeleverd met Node.js | Wordt gebruikt om alle dependencies te installeren                                                        |
| MySQL      | 8.0                     | De database waarin alle gegevens worden opgeslagen. De applicatie maakt verbinding via de MariaDB-adapter |
| Webbrowser | Moderne versie          | Google Chrome, Firefox, Edge of Safari. De frontend maakt gebruik van JavaScript (ES6+)                   |

---

## Installatie

1. Clone de repository

```bash
git clone https://github.com/JelOrg/School-Fullstack.git
```

2. Installeer dependencies

```bash
cd backend
npm install
```

3. Maak een `.env` bestand aan in de `backend` map met de volgende variabelen:

```env
DATABASE_URL="mysql://gebruiker:wachtwoord@localhost:3306/management_system"

DATABASE_USER="Your username"
DATABASE_PASSWORD="Your db password"
DATABASE_NAME="management_system"
DATABASE_HOST="localhost"

SERVER_PORT=5500
BACK_END_PORT=3000
DATABASE_PORT=3306
```

4. Voer Prisma migraties of database push uit om de tabellen aan te maken

```bash
npx prisma migrate deploy
```

of

```bash
npx prisma db push
```

5. Start de applicatie (vanuit de `/backend` map)

```bash
npm start
```

---

## Database

De applicatie verwacht een MySQL-database met de naam `management_system`. Deze database moet aangemaakt worden voordat de applicatie gestart kan worden.

Het SQL-bestand `DB setup.sql` in de hoofdmap bevat:

- Het aanmaken van de database
- De tabellen zelf worden aangemaakt via Prisma aan de hand van het schema dat in de applicatie is gedefinieerd.

&

- Een trigger `after_request_insert` die de voorraad automatisch verlaagt wanneer een aanvraag wordt ingediend
- Een trigger `after_shipment_insert` die de voorraad automatisch verhoogt wanneer een levering wordt geregistreerd

---

## Dependencies

| Package                 | Versie  | Omschrijving                                         |
| ----------------------- | ------- | ---------------------------------------------------- |
| express                 | ^5.2.1  | Webserver en API-routing                             |
| @prisma/client          | ^7.4.2  | Databasecommunicatie via Prisma ORM                  |
| @prisma/adapter-mariadb | ^7.4.2  | Verbindingsadapter voor MariaDB/MySQL                |
| bcrypt                  | ^6.0.0  | Wachtwoordversleuteling                              |
| jsonwebtoken            | ^9.0.3  | Aanmaken en controleren van inlogtokens (JWT)        |
| isomorphic-dompurify    | ^3.0.0  | Beveiliging van invoer en uitvoer tegen XSS          |
| dotenv                  | ^17.3.1 | Laadt environment variables uit het .env-bestand     |
| cors                    | ^2.8.6  | Afhandeling van Cross-Origin Resource Sharing (CORS) |
| cookie-parser           | ^1.4.7  | Uitlezen van cookies uit inkomende HTTP-requests     |

---

## Projectstructuur

```
├── frontend/
│   ├── css/
│   ├── html/
|   ├── img/
│   └── javascript/
└── backend/
    ├── api/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   ├── services/
    │   └── utils/
    ├── generated/          # Prisma gegenereerde bestanden
    ├── prisma/             # Prisma schema en migraties
    ├── node_modules/
    └── server.js (The entry point)
```

---

## Endpoints

### Pagina's

| Method | Route              | Toegang   | Omschrijving        |
| ------ | ------------------ | --------- | ------------------- |
| GET    | `/`                | Publiek   | Inlogpagina         |
| GET    | `/login`           | Publiek   | Inlogpagina         |
| GET    | `/dashboard`       | Employee+ | Dashboard           |
| GET    | `/aanvraag`        | Employee+ | Aanvragen overzicht |
| GET    | `/totale-voorraad` | Employee+ | Voorraad overzicht  |
| GET    | `/statistieken`    | Manager+  | Statistieken        |
| GET    | `/geschiedenis`    | Admin     | Geschiedenis        |
| GET    | `/profile`         | Employee+ | Profiel             |
| GET    | `/settings`        | Employee+ | Instellingen        |

### API

| Method | Route                  | Toegang   | Omschrijving        |
| ------ | ---------------------- | --------- | ------------------- |
| \*     | `/api/`                | Publiek   | Root API            |
| \*     | `/api/login`           | Publiek   | Authenticatie       |
| \*     | `/api/dashboard`       | Employee+ | Dashboard data      |
| \*     | `/api/aanvragen`       | Employee+ | Aanvragen beheer    |
| \*     | `/api/totale-voorraad` | Employee+ | Voorraad data       |
| \*     | `/api/statistieken`    | Manager+  | Statistieken data   |
| \*     | `/api/geschiedenis`    | Admin     | Geschiedenis data   |
| \*     | `/api/profile`         | Employee+ | Profiel beheer      |
| \*     | `/api/settings`        | Employee+ | Instellingen beheer |

---
