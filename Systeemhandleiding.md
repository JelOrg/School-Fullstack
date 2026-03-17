# Systeemhandleiding

## Nexus – Medisch Voorraadbeheer

**Project:** Medisch Voorraadbeheer: Efficiëntie Redt Levens

**Projectteam:**
- Roshnie Harangi (BI/1124/005)
- Jelani Resosemito (SE/1124/029)
- Sherally Dompig (SE/1123/099)
- Hrishikesh Bajnath (SE/1124/023)

**Docenten:**
- Dhr. N. Karsodimedjo
- Mvr. D. Bergwijn

**Opleiding:** Software Engineering / Bedrijfskundige Informatica

**Opdrachtgever:** St. Vincentius Ziekenhuis (RKZ), Paramaribo

**Datum:** Maart 2026

**Versie:** 1.0

---

## Inhoudsopgave

1. [Inleiding](#1-inleiding)
2. [Systeemoverzicht](#2-systeemoverzicht)
3. [Systeemarchitectuur](#3-systeemarchitectuur)
4. [Gebruikte technologieën](#4-gebruikte-technologieën)
5. [Installatie en configuratie](#5-installatie-en-configuratie)
6. [Mappenstructuur](#6-mappenstructuur)
7. [Backend-componenten](#7-backend-componenten)
8. [Databasestructuur](#8-databasestructuur)
9. [API-specificaties](#9-api-specificaties)
10. [Authenticatie en autorisatie](#10-authenticatie-en-autorisatie)
11. [Beveiliging](#11-beveiliging)
12. [Belangrijke terminal commando's](#12-belangrijke-terminal-commandos)
13. [Onderhoud en beheer](#13-onderhoud-en-beheer)

---

## 1. Inleiding

Deze systeemhandleiding is een technisch document bedoeld voor ontwikkelaars en systeembeheerders die verantwoordelijk zijn voor de installatie, configuratie, het onderhoud en de doorontwikkeling van Nexus. Het document beschrijft de interne werking van de applicatie, de technische opbouw, de communicatie tussen de componenten en de stappen die nodig zijn om het systeem operationeel te krijgen.

Nexus is een webapplicatie voor het beheren van medische voorraden, ontwikkeld in opdracht van het St. Vincentius Ziekenhuis (RKZ) te Paramaribo. Het systeem biedt realtime inzicht in voorraden via Server-Sent Events, ondersteunt het indienen van (spoed)aanvragen via een REST API en slaat alle gegevens op in een MariaDB-database die via Prisma ORM wordt aangestuurd.

Voor het gebruik van de applicatie als eindgebruiker wordt verwezen naar de Gebruikershandleiding.

---

## 2. Systeemoverzicht

Nexus is gebouwd als een monolithische Node.js-webapplicatie. De Express-server fungeert zowel als API-server (REST + SSE) als webserver die de statische frontend-bestanden aanbiedt. De communicatie tussen frontend en backend verloopt via HTTP-verzoeken (Fetch API) en langlopende SSE-verbindingen (EventSource).

De applicatie verwerkt drie soorten verkeer:

1. **Pagina-requests** – De browser vraagt een HTML-pagina op. De server valideert de authenticatie en autorisatie en retourneert het bijbehorende HTML-bestand via de `viewHelper`-module.
2. **API-requests** – De frontend stuurt JSON-data naar een API-endpoint (bijv. een POST-aanvraag). De server verwerkt het verzoek via de controller- en servicelaag en retourneert een JSON-response.
3. **SSE-streams** – De frontend opent een langlopende verbinding. De server stuurt op vaste intervallen bijgewerkte data vanuit de database naar de browser, zonder dat een nieuw verzoek nodig is.

De gegevens worden opgeslagen in een MariaDB-database. De interactie verloopt via Prisma ORM met de MariaDB-adapter (`@prisma/adapter-mariadb`), waardoor de applicatie een typeveilige databaselaag heeft.

---

## 3. Systeemarchitectuur

De applicatie is opgebouwd in vijf lagen:

### 3.1 Presentatielaag (Frontend)

Statische HTML-, CSS- en JavaScript-bestanden die door Express worden geserveerd. De browser voert de JavaScript-code uit die verantwoordelijk is voor het renderen van gegevens, het versturen van formulieren via de Fetch API en het opzetten van SSE-verbindingen via de EventSource API.

### 3.2 Routeringslaag

De centrale router `routingHub.js` registreert alle pagina-routes en API-routes. Pagina-routes maken gebruik van de `viewHelper`-module om HTML-bestanden te serveren. API-routes delegeren naar de bijbehorende routebestanden, die op hun beurt controllers aanroepen. De router past op elke route de juiste combinatie van middleware toe.

### 3.3 Applicatielaag (Controllers)

De controllers bevatten de bedrijfslogica. Elke functionaliteit (login, dashboard, aanvragen, totale voorraad, statistieken, geschiedenis) heeft een eigen controller. Controllers ontvangen het verwerkte verzoek van de router, roepen servicefuncties aan en retourneren een JSON-response of openen een SSE-stream.

### 3.4 Servicelaag

Herbruikbare functies die de controllers gebruiken om met de database te communiceren. De servicelaag voorkomt codeduplicatie en centraliseert databasequery's. Services zijn verantwoordelijk voor het ophalen van items, afdelingen, aanvragen, kritieke voorraad en het schrijven van nieuwe aanvragen naar de database.

### 3.5 Datalaag (Prisma + MariaDB)

De Prisma ORM genereert op basis van het schema (`schema.prisma`) een typeveilige client. De client wordt geïnitialiseerd in `prismaClient.js` met de MariaDB-adapter, die de databaseverbinding opzet aan de hand van omgevingsvariabelen. Alle databaseinteracties verlopen via deze client.

### 3.6 Middleware

Alle requests doorlopen een middleware-keten voordat ze de controller bereiken. De invoersanitatie (`sanitizeIn`) sanitized alle binnenkomende data met DOMPurify. De uitvoersanitatie (`sanitizeOut`) sanitized alle uitgaande JSON-responses en SSE-streams. De authenticatie (`authenticateToken`) verifieert het JWT-token uit de cookie en controleert of de gebruiker actief is. De autorisatie (`getUserAuthorizationLevel`) controleert of de rol van de gebruiker voldoende rechten heeft voor het opgevraagde endpoint.

### Architectuurdiagram

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  Fetch API (POST/GET) ←──────────→ EventSource (SSE)        │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP / SSE
┌─────────────────────────▼────────────────────────────────────┐
│                  Express Server (Node.js)                     │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ Middleware-pipeline                                    │   │
│  │  sanitizeIn → sanitizeOut → authenticateToken →        │   │
│  │  getUserAuthorizationLevel                             │   │
│  └──────────────────────┬────────────────────────────────┘   │
│                          │                                    │
│  ┌──────────────────────▼────────────────────────────────┐   │
│  │ routingHub.js                                          │   │
│  │  ├─ Pagina-routes → viewHelper → HTML-bestanden        │   │
│  │  └─ API-routes    → Route-bestanden → Controllers      │   │
│  └──────────────────────┬────────────────────────────────┘   │
│                          │                                    │
│  ┌──────────────────────▼────────────────────────────────┐   │
│  │ Services (fetchDatabaseInfo, fetchItemInfo,            │   │
│  │  fetchDepartmentData, fetchRequestInfo,                │   │
│  │  postInfoToDatabase, SSEService, tokenHandler)         │   │
│  └──────────────────────┬────────────────────────────────┘   │
│                          │                                    │
│  ┌──────────────────────▼────────────────────────────────┐   │
│  │ Prisma Client (generated) + MariaDB-adapter            │   │
│  └──────────────────────┬────────────────────────────────┘   │
└──────────────────────────┼────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │    MariaDB Database     │
              │   (management_system)   │
              └─────────────────────────┘
```

---

## 4. Gebruikte technologieën

### 4.1 Backend-afhankelijkheden

| Pakket | Versie | Functie in het systeem |
|--------|--------|----------------------|
| express | 5.2.1 | HTTP-server, routing en middleware-framework |
| @prisma/client | 7.4.2 | Gegenereerde ORM-client voor databasequery's |
| @prisma/adapter-mariadb | 7.4.2 | Adapter waarmee Prisma communiceert met MariaDB |
| bcrypt | 6.0.0 | Hasht wachtwoorden bij registratie, verifieert bij login |
| jsonwebtoken | 9.0.3 | Genereert en verifieert JWT-tokens voor authenticatie |
| cookie-parser | 1.4.7 | Parset cookies uit inkomende HTTP-headers naar `req.cookies` |
| cors | 2.8.6 | Configureert Cross-Origin Resource Sharing headers |
| dotenv | 17.3.1 | Laadt `.env`-variabelen in `process.env` |
| isomorphic-dompurify | 3.0.0 | Sanitized HTML/JS in invoer en uitvoer (XSS-preventie) |
| nodemon | 3.1.14 | Herstart de server automatisch bij bestandswijzigingen (development) |

### 4.2 DevDependencies

| Pakket | Versie | Functie |
|--------|--------|---------|
| prisma | 7.4.2 | CLI-tool voor migraties, schema-management en client-generatie |
| @types/node | 25.3.3 | TypeScript-typedefinities voor Node.js (editor-ondersteuning) |

### 4.3 Frontend-stack

| Technologie | Beschrijving |
|-------------|-------------|
| HTML5 | Paginastructuur, geserveerd als statische bestanden door Express |
| CSS3 | Pagina-specifieke stijlbladen + globaal `main.css` |
| Bootstrap 5.3.2 | CSS-framework via CDN, JavaScript-bundle via CDN |
| Vanilla JavaScript | Fetch API voor REST-calls, EventSource voor SSE-verbindingen |

---

## 5. Installatie en configuratie

### 5.1 Vereisten

| Software | Minimale versie | Toelichting |
|----------|----------------|-------------|
| Node.js | 18.x | Inclusief npm. Het project gebruikt ES-modules (`"type": "module"` in package.json). |
| MariaDB | 10.5 | Of MySQL. Prisma communiceert via de MySQL-driver. |

### 5.2 Stap 1 – Database initialiseren

Voer het SQL-script `DB setup.sql` uit in de hoofdmap van het project. Dit script:
- Maakt de database `management_system` aan.
- Definieert de trigger `after_request_insert` die bij een nieuwe aanvraag de voorraad automatisch vermindert.
- Definieert de trigger `after_shipment_insert` die bij een nieuwe levering de voorraad automatisch verhoogt.

```
mysql -u root -p < "DB setup.sql"
```

### 5.3 Stap 2 – Omgevingsvariabelen instellen en pakketten installeren

De applicatie heeft een configuratiebestand nodig om te weten hoe hij verbinding maakt met de database en hoe hij beveiligingstokens moet aanmaken. Maak hiervoor een bestand `.env` aan in de map `backend/` met de volgende variabelen:

| Variabele | Gebruikt door | Voorbeeld |
|-----------|--------------|-----------|
| `DATABASE_URL` | Prisma CLI (migraties) | `mysql://root:wachtwoord@localhost:3306/management_system` |
| `DATABASE_HOST` | `prismaClient.js` (MariaDB-adapter) | `localhost` |
| `DATABASE_USER` | `prismaClient.js` | `root` |
| `DATABASE_PASSWORD` | `prismaClient.js` | `wachtwoord123` |
| `DATABASE_NAME` | `prismaClient.js` | `management_system` |
| `DATABASE_PORT` | `prismaClient.js` | `3306` |
| `JWT_SECRET` | `tokenHandler.js` (JWT signing) | Lange willekeurige tekenreeks |
| `SERVER_PORT` | `server.js` (Express listener) | `3000` |

`DATABASE_URL` wordt door de Prisma CLI gebruikt bij het uitvoeren van migraties. De overige databasevariabelen worden door de MariaDB-adapter in `prismaClient.js` gebruikt om de verbinding op te zetten tijdens het draaien van de applicatie.

Installeer vervolgens alle benodigde npm-pakketten:

```
cd backend
npm install
```

### 5.4 Stap 3 – Prisma configureren

```
npx prisma migrate deploy
npx prisma generate
```

`migrate deploy` past de migraties uit `prisma/migrations/` toe op de database. `generate` genereert de Prisma client naar `backend/generated/prisma/`, gebaseerd op het schema in `prisma/schema.prisma`.

### 5.5 Stap 4 – Server starten

**Productie:**
```
node server.js
```

**Ontwikkeling (auto-restart):**
```
npx nodemon server.js
```

De server luistert op `http://localhost:<SERVER_PORT>`. De `viewHelper`-module zorgt ervoor dat de juiste HTML-pagina wordt opgestuurd naar de browser vanuit de `frontend/html/`-map.

---

## 6. Mappenstructuur

Het project is opgedeeld in drie hoofdonderdelen: de backend, de frontend en het database-setupscript.

**Hoofdmap** – Bevat het SQL-setupscript (`DB setup.sql`) dat eenmalig wordt uitgevoerd bij de installatie, en de documentatie (systeemhandleiding en gebruikershandleiding).

**backend/** – Bevat de volledige servercode. Het startpunt is `server.js`, die de Express-server initialiseert. De centrale router `routingHub.js` koppelt alle routes aan de juiste controllers. De map `api/` is onderverdeeld in vijf submappen: `controller/` voor de bedrijfslogica, `routes/` voor de route-definities, `middlewares/` voor authenticatie, autorisatie en sanitatie, `services/` voor herbruikbare database- en tokenfuncties, en `utils/` voor constanten, configuratie en hulpfuncties. Daarnaast bevat `prisma/` het databaseschema en de migratiebestanden, en `generated/` de door Prisma gegenereerde client.

**frontend/** – Bevat alle bestanden die door de browser worden geladen. De map `html/` bevat de acht HTML-pagina's (inlog, dashboard, aanvraag, totale voorraad, statistieken, geschiedenis, profiel en instellingen). De map `css/` bevat een globaal stijlblad en pagina-specifieke stijlbladen. De map `javascript/` bevat de client-side logica: `inlog.js` verstuurt het loginformulier naar de API, `dashboard.js` opent een SSE-verbinding en rendert kritieke voorraad en meldingen, `aanvraag.js` biedt live autocomplete bij het zoeken van items en verstuurt aanvragen, en `logOut.js` wist de authenticatie-cookie. Alle fetch-calls gebruiken `credentials: "include"` zodat de browser de HTTP-only cookie automatisch meestuurt. De map `img/` bevat statische afbeeldingen zoals het logo van het RKZ.

Een gedetailleerde beschrijving van elk onderdeel binnen de backend is te vinden in hoofdstuk 7.

---

## 7. Backend-componenten

### 7.1 server.js – Serverinitialisatie

Het startpunt van de applicatie. Initialiseert de Express-server, laadt middleware (cookie-parser, cors, JSON-parser), koppelt de centrale router (`routingHub.js`), configureert de statische bestandsmap voor de frontend en start de HTTP-listener op de poort uit de omgevingsvariabele `SERVER_PORT`.

### 7.2 routingHub.js – Centrale router

Registreert alle routes in het systeem. Definieert een `protect(requiredLevel)`-functie die authenticatie en autorisatie combineert in één middleware-keten:

```javascript
const protect = (requiredLevel) => [
  authenticateToken,
  getUserAuthorizationLevel(requiredLevel),
];
```

**Pagina-routes** worden beschermd met `protect()` en serveren HTML via `viewHelper`:

| Route | Bescherming | HTML-bestand |
|-------|-------------|-------------|
| `/`, `/login` | Geen | `inlog.html` |
| `/dashboard` | `protect(employee)` | `dashboard.html` |
| `/aanvragen` | `protect(employee)` | `aanvraag.html` |
| `/totale-voorraad` | `protect(employee)` | `totale-voorraad.html` |
| `/statistieken` | `protect(manager)` | `statistieken.html` |
| `/geschiedenis` | `protect(admin)` | `geschiedenis.html` |
| `/profile` | `protect(employee)` | `profile.html` |
| `/settings` | `protect(employee)` | `settings.html` |

**API-routes** worden gemount op `/api/`-subpaden en delegeren naar de bijbehorende routebestanden.

### 7.3 Controllers

| Bestand | Functies | Beschrijving |
|---------|----------|-------------|
| `loginController.js` | Login-validatie | Verifieert e-mail en wachtwoord-hash via bcrypt, genereert JWT-token, zet HTTP-only cookie, retourneert redirect-URL. |
| `dashboardController.js` | `sendSpoedAanvraag`, `fetchDashboardDisplayData` | POST verwerkt spoedaanvragen via de servicelaag. GET opent een SSE-stream die kritieke voorraad en urgente meldingen stuurt. |
| `aanvragenController.js` | `fetchAanvragenDisplayData` | GET opent een SSE-stream met aanvragen. Employees zien eigen aanvragen, managers/admins zien alle aanvragen. Ondersteunt `?limit=` queryparameter (geclamped 1–100). |
| `aanvragenDashboard.js` | `sendNormaleAanvraag` | POST verwerkt normale (niet-spoed) aanvragen. Haalt een nieuw `requestBatchId` op, valideert de afdeling en schrijft items naar de request-tabel via `postToRequestTable`. |
| `totaleVoorraadController.js` | `fetchTotalVoorraadData` | GET opent een SSE-stream die alle items met categorienamen retourneert via `fetchAllItems`. |

### 7.4 Services

| Bestand | Functies | Beschrijving |
|---------|----------|-------------|
| `tokenHandler.js` | `processToken`, `validateToken` | Verifieert de JWT-handtekening, decodeert de payload en controleert of het bijbehorende account actief is in de database. |
| `SSEService.js` | `SSEHeader`, `SSESessionCheck`, `closeSSESession` | Beheert SSE-verbindingen: zet de juiste HTTP-headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`), herverifieert het JWT-token elke 5 minuten en sluit de sessie bij een ongeldig token. Bij het sluiten wordt een `auth_error`-event naar de client gestuurd met een redirect-URL. |
| `fetchDatabaseInfo.js` | `getCurrentOrNextReqBatchId`, `fetchKritiekeVoorraad` | Haalt het huidige of volgende `requestBatchId` op (auto-increment). Haalt items op waarvan `remainingAmount ≤ 25` (de kritieke drempel), gelimiteerd tot 10 resultaten. |
| `fetchItemInfo.js` | `fetchAllItems`, `fetchCrucialItemInfo` | `fetchAllItems` retourneert alle items met geneste categorienaam (flat-mapped). `fetchCrucialItemInfo` haalt één specifiek item op. |
| `fetchDepartmentData.js` | `fetchDepartmentId` | Zoekt het `departmentId` op basis van `departmentName` via `prisma.department.findFirst`. |
| `fetchRequestInfo.js` | `fetchUserAanvragen`, `fetchUrgentRequest` | Haalt aanvragen op, gefilterd op autorisatieniveau. Employees zien alleen eigen aanvragen, managers/admins zien alles. `fetchUrgentRequest` haalt spoedaanvragen op (gelimiteerd tot 50). |
| `postInfoToDatabase.js` | `postToRequestTable` | Schrijft een array van aanvraag-items naar de `request`-tabel via `prisma.request.createMany`. |

### 7.5 Utils

| Bestand | Inhoud |
|---------|--------|
| `magicNumberFile.js` | Centrale constanten: `ONE_HOUR` (3.600.000ms), `ROLE_AUTH_LEVEL` (employee=1, manager=2, admin=3), `REFRESH_RATES` (CRITICAL_VITALS=2s, STANDARD_DASHBOARD=5s, SYSTEM_STATUS=60s), `HTTP_STATUS` (alle statuscodes), `VERIFY_INTERVAL` (5 min), `TAKE_LIMIT` (10), `TAKE_LIMIT_URGENT_REQUEST` (50), `REMAINING_AMOUNT` (25). |
| `config.js` | Cookie-opties: `maxAge`, `path`, `httpOnly`, `sameSite`, `secure`. |
| `prismaClient.js` | Initialiseert de Prisma client met de MariaDB-adapter. Leest databasecredentials uit `process.env`. Exporteert de `prisma`-instantie. |
| `viewHelper.js` | Exporteert `view(fileName)`: een Express-handler die `res.sendFile()` aanroept met het pad `../frontend/html/<fileName>.html`. |
| `absoluteEnvPath.js` | Laadt het `.env`-bestand vanuit de `backend/`-map via dotenv. |
| `randomTextGen.js` | `generateSecureToken()` (64 bytes hex) en `generateSecureBase64()` (64 bytes base64) via `crypto.randomBytes`. |

### 7.6 Server-Sent Events (SSE)

Nexus maakt gebruik van SSE om gegevens automatisch te vernieuwen. De SSE-controllers openen een langlopende HTTP-verbinding en sturen op vaste intervallen bijgewerkte data naar de browser.

De levenscyclus van een SSE-verbinding verloopt als volgt: de client opent een `EventSource`-verbinding, de server zet de SSE-headers via `SSEHeader()` en start een `setInterval`. Elke tick haalt de controller data op uit de database en stuurt deze naar de client. Het JWT-token wordt elke 5 minuten opnieuw geverifieerd via `SSESessionCheck()`. Bij een verlopen token wordt de verbinding gesloten. Bij het wegvallen van de client ruimt `req.on("close")` het interval op.

De verversingssnelheden zijn geconfigureerd in `magicNumberFile.js`:

| Constante | Waarde | Gebruik |
|-----------|--------|--------|
| `CRITICAL_VITALS` | 2.000 ms | Dashboard, totale voorraad |
| `STANDARD_DASHBOARD` | 5.000 ms | Aanvragen |
| `SYSTEM_STATUS` | 60.000 ms | Statistieken |
| `VERIFY_INTERVAL` | 300.000 ms | Token-herverificatie tijdens SSE |

---

## 8. Databasestructuur

De database `management_system` is gedefinieerd in `prisma/schema.prisma` en bevat acht modellen.

### 8.1 Entity-Relationship Diagram

```
role ──────────────< users >──────────── department
                       │                      │
                       ▼                      ▼
categories ────< items >────< request ────────┘
                  │
                  ▼
           shipments >──── suppliers

reqDescirptions (standalone)
```

### 8.2 Tabellen en kolommen

#### users

| Kolom | Type | Constraints |
|-------|------|------------|
| userId | Int | PK, auto-increment |
| firstName | VarChar(50) | |
| lastName | VarChar(50) | |
| email | VarChar(255) | Unique |
| saltedPassword | Text | bcrypt hash |
| roleId | Int | FK → role.roleId |
| departmentId | Int | FK → department.departmentId |
| isActive | Boolean | Default: true |
| createdAt | DateTime | Default: now() |
| updatedAt | Timestamp | Auto-update |

#### role

| Kolom | Type | Constraints |
|-------|------|------------|
| roleId | Int | PK, auto-increment |
| roleName | String | Waarden: employee, manager, admin |

#### department

| Kolom | Type | Constraints |
|-------|------|------------|
| departmentId | Int | PK, auto-increment |
| departmentName | VarChar(100) | |
| createdAt | DateTime | Default: now() |
| updatedAt | Timestamp | Auto-update |

#### categories

| Kolom | Type | Constraints |
|-------|------|------------|
| categoryId | Int | PK, auto-increment |
| categoryName | String | |
| description | Text | |
| createdAt | DateTime | Default: now() |
| updatedAt | Timestamp | Auto-update |

#### items

| Kolom | Type | Constraints |
|-------|------|------------|
| itemId | Int | PK, auto-increment |
| itemName | String | |
| description | MediumText | |
| remainingAmount | Int | Wordt automatisch bijgewerkt door triggers |
| categoryId | Int | FK → categories.categoryId |
| createdAt | DateTime | Default: now() |
| updatedAt | Timestamp | Auto-update |

#### request

| Kolom | Type | Constraints |
|-------|------|------------|
| requestId | Int | PK, auto-increment |
| requestBatchId | Int | Groepeert gelijktijdig ingediende items |
| itemId | Int | FK → items.itemId |
| requestedAmount | Int | |
| isUrgent | Boolean | true = spoedaanvraag |
| isCompleted | Boolean | true = afgehandeld |
| requestedDate | DateTime | Default: now() |
| userId | Int | FK → users.userId |
| departmentId | Int | FK → department.departmentId |
| createdAt | DateTime | Default: now() |
| updatedAt | Timestamp | Auto-update |

#### shipments

| Kolom | Type | Constraints |
|-------|------|------------|
| shipmentId | Int | PK, auto-increment |
| shipmentBatchId | Int | |
| itemId | Int | FK → items.itemId |
| GTIN | Int | Default: 0 |
| supplierId | Int | FK → suppliers.supplierId |
| deliveryDate | DateTime | Default: now() |
| experationDate | DateTime | |
| cost | Int | |
| createdAt | DateTime | Default: now() |
| updatedAt | Timestamp | Auto-update |

#### suppliers

| Kolom | Type | Constraints |
|-------|------|------------|
| supplierId | Int | PK, auto-increment |
| supplierName | String | Unique |
| Address | String | |
| Description | MediumText | |
| contact | String | |
| createdAt | DateTime | Default: now() |
| updatedAt | Timestamp | Auto-update |

#### reqDescirptions

| Kolom | Type | Constraints |
|-------|------|------------|
| reqDescriptionId | Int | PK, auto-increment |
| descriptionField | LongText | Tekstveld voor aanvraagbeschrijvingen |

### 8.3 Database-triggers (DB setup.sql)

```sql
CREATE TRIGGER after_request_insert
AFTER INSERT ON request
FOR EACH ROW
BEGIN
    UPDATE items
    SET remainingAmount = remainingAmount - NEW.requestedAmount
    WHERE itemId = NEW.itemId;
END;

CREATE TRIGGER after_shipment_insert
AFTER INSERT ON shipments
FOR EACH ROW
BEGIN
    UPDATE items
    SET remainingAmount = remainingAmount + 1
    WHERE itemId = NEW.itemId;
END;
```

De `after_request_insert`-trigger vermindert de voorraad met het aangevraagde aantal bij elke nieuwe aanvraag. De `after_shipment_insert`-trigger verhoogt de voorraad met 1 bij elke geregistreerde levering. Deze triggers garanderen dat `remainingAmount` altijd synchroon loopt met de aanvragen en leveringen.

### 8.4 Indexen

Prisma definieert de volgende indexen voor query-optimalisatie:

| Tabel | Index op |
|-------|---------|
| items | categoryId |
| request | itemId, departmentId, userId |
| shipments | itemId, supplierId |
| users | departmentId, roleId |

---

## 9. API-specificaties

Alle API-endpoints bevinden zich onder `/api/`. Beveiligde endpoints vereisen een geldig JWT-token in de `token`-cookie.

### 9.1 POST /api/login

**Authenticatie:** Geen (publiek endpoint).

**Request body:**
```json
{
  "userRoleName": "string",
  "userEmail": "string",
  "providedPassword": "string"
}
```

**Verwerking:**
1. Zoekt de gebruiker op basis van `userEmail` in de `users`-tabel.
2. Vergelijkt `providedPassword` met de opgeslagen bcrypt-hash via `bcrypt.compare()`.
3. Verifieert dat de `userRoleName` overeenkomt met de rol in de database.
4. Genereert een JWT-token met payload: `{ userId, userRoleName, userDepartmentName, jti }`.
5. Zet het token als HTTP-only cookie (`token`, maxAge: 1 uur).

**Response (succes):** `{ success: true, message: "...", redirectTo: "/dashboard" }`

**Response (fout):** `{ success: false, message: "..." }` met HTTP 401.

### 9.2 GET /api/dashboard/fetch-display-data

**Authenticatie:** Employee+ (niveau 1).
**Type:** Server-Sent Events (SSE).
**Interval:** Elke 2 seconden (`REFRESH_RATES.CRITICAL_VITALS`).

**Data die wordt gestreamd:**
- Kritieke voorraad: items waar `remainingAmount ≤ 25`, gelimiteerd tot 10 resultaten, gesorteerd op naam.
- Urgente aanvragen: spoedaanvragen met gekoppelde item-, gebruiker- en afdelingsinformatie, gelimiteerd tot 50 resultaten.

### 9.3 POST /api/dashboard/send-spoed-aanvraag

**Authenticatie:** Employee+ (niveau 1).

**Request body:**
```json
{
  "itemInfo": [
    { "itemId": 1, "amountRequested": 5 }
  ],
  "textField": "Beschrijving van de noodsituatie"
}
```

**Verwerking:**
1. Leest `userId` en `departmentName` uit `req.tokenInformation` (van de JWT-middleware).
2. Haalt het volgende `requestBatchId` op via `getCurrentOrNextReqBatchId(true)` (auto-increment).
3. Zoekt het `departmentId` op via `fetchDepartmentId(departmentName)`.
4. Mapt de items naar een array met velden: `itemId`, `requestedAmount`, `requestBatchId`, `isUrgent: true`, `userId`, `departmentId`.
5. Schrijft alle items in bulk naar de `request`-tabel via `prisma.request.createMany`.
6. De `after_request_insert`-trigger vermindert automatisch de voorraad.

**Response (succes):** HTTP 201, `{ success: true, message: "...", count: N }`

### 9.4 GET /api/aanvragen/fetch-display-data

**Authenticatie:** Employee+ (niveau 1).
**Type:** SSE.
**Interval:** Elke 5 seconden (`REFRESH_RATES.STANDARD_DASHBOARD`).
**Queryparameters:** `?limit=N` (1–100, default 20).

**Logica:** Employees zien alleen eigen aanvragen (gefilterd op `userId`). Managers en admins zien alle aanvragen.

### 9.5 POST /api/aanvragen

**Authenticatie:** Employee+ (niveau 1).
**Verwerking:** Identiek aan de spoedaanvraag (9.3), maar met `isUrgent: false`.

### 9.6 GET /api/totale-voorraad/fetch-totale-voorraad

**Authenticatie:** Employee+ (niveau 1).
**Type:** SSE.
**Interval:** Elke 2 seconden.

**Data:** Alle items uit de `items`-tabel met geneste `categories.categoryName`, flat-mapped naar: `{ itemId, itemName, description, remainingAmount, categoryName }`.

### 9.7 GET /api/statistieken/fetch-display-data

**Authenticatie:** Manager+ (niveau 2).
**Type:** SSE.
**Data:** Geaggregeerde statistieken over aanvragen en voorraadgebruik.

### 9.8 GET /api/geschiedenis/fetch-display-data

**Authenticatie:** Admin (niveau 3).
**Type:** SSE.
**Data:** Volledig historisch overzicht van alle aanvragen.

### 9.9 GET /api/profile, GET /api/settings

**Authenticatie:** Employee+ (niveau 1).
**Type:** JSON.
**Data:** Profielgegevens respectievelijk gebruikersinstellingen.

---

## 10. Authenticatie en autorisatie

### 10.1 JWT-token structuur

Na succesvolle login wordt een token gegenereerd met `jsonwebtoken.sign()`:

| Veld | Bron | Beschrijving |
|------|------|-------------|
| `userId` | `users.userId` | Identificeert de gebruiker voor database-queries |
| `userRoleName` | `role.roleName` | Bepaalt het autorisatieniveau |
| `userDepartmentName` | `department.departmentName` | Scoped data-ophalen per afdeling |
| `jti` | `crypto.randomBytes` | Uniek token-ID, bruikbaar voor token-blacklisting |

Het token wordt ondertekend met `JWT_SECRET` uit de omgevingsvariabelen en heeft een levensduur van 1 uur.

### 10.2 Cookie-configuratie

Het token wordt opgeslagen in een HTTP-only cookie genaamd `token`:

| Eigenschap | Waarde | Reden |
|-----------|--------|-------|
| `maxAge` | 3.600.000 ms (1 uur) | Sessieduur |
| `path` | `/` | Cookie geldt voor alle routes |
| `httpOnly` | true | Niet uitleesbaar via JavaScript (XSS-bescherming) |
| `sameSite` | strict | Beschermt tegen CSRF-aanvallen |
| `secure` | Afhankelijk van NODE_ENV | HTTPS-only in productie |

### 10.3 Authenticatie-flow (per request)

```
Request binnenkomst
    │
    ▼
authenticateToken middleware
    ├─ Cookie aanwezig? ──→ Nee ──→ Redirect /login?error=denied
    │
    ▼
processToken(cookieToken)
    ├─ JWT geldig? ──→ Nee ──→ Cookie wissen, redirect /login
    │
    ▼
validateToken(tokenInfo)
    ├─ Gebruiker actief in DB? ──→ Nee ──→ Cookie wissen, redirect /login
    │
    ▼
req.tokenInformation = { userId, userRoleName, userDepartmentName, jti }
    │
    ▼
getUserAuthorizationLevel(requiredLevel)
    ├─ ROLE_AUTH_LEVEL[userRoleName] ≥ requiredLevel? ──→ Nee ──→ Redirect /dashboard?error=denied
    │
    ▼
req.userAuthLevel = niveau
    │
    ▼
Controller verwerkt het verzoek
```

### 10.4 Autorisatieniveaus

Gedefinieerd in `magicNumberFile.js`:

```javascript
ROLE_AUTH_LEVEL = {
  employee: 1,
  manager: 2,
  admin: 3,
}
```

Een route met `protect(ROLE_AUTH_LEVEL.manager)` is alleen toegankelijk voor gebruikers met niveau 2 (manager) of 3 (admin).

---

## 11. Beveiliging

### 11.1 Wachtwoordopslag

Wachtwoorden worden gehasht met bcrypt (cost factor 10+). De hash wordt opgeslagen in `users.saltedPassword`. Bij login wordt `bcrypt.compare(providedPassword, storedHash)` aangeroepen. Het originele wachtwoord is niet te herleiden uit de hash.

### 11.2 HTTP-only cookies

Het JWT-token is opgeslagen in een cookie met `httpOnly: true`. Dit voorkomt dat client-side JavaScript het token kan uitlezen via `document.cookie`, wat bescherming biedt tegen XSS-aanvallen die proberen tokens te stelen.

### 11.3 DOMPurify sanitatie

Invoer wordt gesanitized voordat deze de controllers bereikt. Uitvoer wordt gesanitized voordat deze de client bereikt. Dit beschermt tegen stored XSS (kwaadaardige invoer die in de database terechtkomt) en reflected XSS (kwaadaardige invoer die direct wordt teruggestuurd).

### 11.4 Rolgebaseerde toegangscontrole (RBAC)

Elke route in `routingHub.js` is expliciet gekoppeld aan een minimaal autorisatieniveau via `protect()`. De middleware-keten garandeert dat ongeautoriseerde requests worden afgewezen voordat ze de controller bereiken.

### 11.5 E-maildomein validatie

Bij het inloggen wordt gecontroleerd of het e-mailadres behoort tot het officiële domein van het ziekenhuis. Persoonlijke e-mailadressen worden niet geaccepteerd, conform eis NFR-04 uit het Requirements Document.

### 11.6 Operator Injection preventie

Prisma is inherent beschermd tegen SQL-injection doordat query's via de client worden opgebouwd. Daarnaast wordt type casting toegepast op invoer om Operator Injection te voorkomen, waarbij een aanvaller een object (bijv. `{ "not": "" }`) als wachtwoord verstuurt om Prisma-filters te manipuleren.

---

## 12. Belangrijke terminal commando's

| Commando | Beschrijving |
|----------|-------------|
| `cd backend && npm install` | Installeert alle Node.js-pakketten |
| `node server.js` | Start de Express-server (productie) |
| `npx nodemon server.js` | Start met auto-restart (ontwikkeling) |
| `npx prisma generate` | Genereert de Prisma client uit `schema.prisma` |
| `npx prisma migrate dev --name <naam>` | Maakt een nieuwe migratie en past toe (ontwikkeling) |
| `npx prisma migrate deploy` | Past openstaande migraties toe (productie) |
| `npx prisma studio` | Opent een visuele database-editor op `localhost:5555` |
| `npx prisma db pull` | Haalt het huidige databaseschema op en werkt `schema.prisma` bij |
| `npm outdated` | Toont pakketten waarvoor updates beschikbaar zijn |
| `npm audit` | Detecteert bekende beveiligingskwetsbaarheden |
| `mysqldump -u <user> -p <database> > backup.sql` | Maakt een volledige database-back-up |

---

## 13. Onderhoud en beheer

### 13.1 Database-back-ups

```
mysqldump -u [gebruiker] -p management_system > backup_$(date +%Y%m%d).sql
```

Herstel een back-up:
```
mysql -u [gebruiker] -p management_system < backup.sql
```

### 13.2 Pakketten bijwerken

```
cd backend
npm outdated        # Toont verouderde pakketten
npm audit           # Toont kwetsbaarheden
npm update          # Werkt bij volgens semver-ranges in package.json
```

Na een Prisma-update altijd `npx prisma generate` opnieuw uitvoeren.

### 13.3 Schema-migraties

Bij wijzigingen aan `schema.prisma`:
```
npx prisma migrate dev --name beschrijving_van_wijziging
```

In productie:
```
npx prisma migrate deploy
```

### 13.4 Process management (productie)

```
npm install -g pm2
pm2 start server.js --name nexus
pm2 status                        # Overzicht van draaiende processen
pm2 logs nexus                    # Bekijk server-logs
pm2 restart nexus                 # Herstart na een update
pm2 save && pm2 startup           # Overleeft server-reboot
```

### 13.5 Logging

De server logt naar `stdout`/`stderr`. In productie wordt aangeraden een loggingtool te configureren (bijv. `winston` of `pino`) die meldingen opslaat in rotererende logbestanden voor analyse achteraf.
