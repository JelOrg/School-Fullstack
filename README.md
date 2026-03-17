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
git clone <repo-url>
cd <project-map>
```

2. Installeer dependencies

```bash
npm install
```

3. Maak een `.env` bestand aan in de hoofdmap (zie [Environment Variables](#environment-variables))

4. Voer Prisma migraties uit om de tabellen aan te maken

```bash
npx prisma migrate deploy
```

or

```bash
npx prisma db push
```

5. Start de applicatie

```bash
npm start
```

---

## Environment Variables

Maak een `.env` bestand aan in de hoofdmap met de volgende variabelen:

```env
DATABASE_URL="mysql://gebruiker:wachtwoord@localhost:3306/management_system"
JWT_SECRET=jouw_jwt_secret
PORT=3000
```

---

## Database

De applicatie verwacht een MySQL-database met de naam `management_system`. Deze database moet aangemaakt worden voordat de applicatie gestart kan worden.

Het SQL-bestand `DB setup.sql` in de hoofdmap bevat:

- Het aanmaken van de database
- Een trigger `after_request_insert` die de voorraad automatisch verlaagt wanneer een aanvraag wordt ingediend
- Een trigger `after_shipment_insert` die de voorraad automatisch verhoogt wanneer een levering wordt geregistreerd

De tabellen zelf worden aangemaakt via Prisma aan de hand van het schema dat in de applicatie is gedefinieerd.

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

## Autorisatie

De applicatie maakt gebruik van drie toegangsniveaus:

- **Employee** — Beperkte toegang tot eigen aanvragen en voorraad
- **Manager** — Toegang tot afdelingsbeheer en rapportages
- **Admin** — Volledige toegang tot alle functionaliteit
