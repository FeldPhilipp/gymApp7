# 🤖 AI Onboarding Guide - GymApp Projekt

> Diese Datei hilft KI-Assistenten, das GymApp-Projekt (TrainingsApp) schnell zu verstehen.  
> **Lies dies als erstes** bei neuen Konversationen!

---

## ⚡ 30-Sekunden Überblick

**GymApp** ist eine moderne Full-Stack Web-App für Fitness- und Trainingsmanagement. Sie ermöglicht das Erstellen und Tracking von Trainingsplänen, das Verwalten von Trainingsgruppen und Echtzeit-Kommunikation.

### Tech Stack
- **Frontend**: React 19, React Router v7, Redux Toolkit, Material-UI (MUI), Emotion, Socket.io-client.
- **Backend**: Node.js, Express.js, MySQL 8 (mysql2), Socket.io, JWT-Authentifizierung.
- **Datenbank-Setup**: Docker (`tiegel-mysql` Container für die lokale Entwicklung).

### Aktueller Stand (Features)
- ✅ **Nutzer-Management**: Registrierung, Login, Profil, Passwort Reset.
- ✅ **Training**: Vordefinierte und Custom-Trainingspläne, Session-Tracking, Übungs-Verwaltung.
- ✅ **Eigene Übungen (Basis)**: Nutzer können persönliche Übungen anlegen und auflisten (DB-Tabelle `nutzer_eigene_uebungen`, API unter `/api/uebungen`, UI vorläufig unter `/test`).
- ✅ **Gruppen**: Trainingsgruppen, Einladungen, Gruppen-Kalender, Highscores.
- ✅ **Social/Echtzeit**: Live-Kommentare in "Termin-Rooms" über WebSockets (Socket.io).
- ✅ **Tracking**: Gewichtstracking, Trainingshistorie.
- ✅ **Admin**: Admin-Panel zur Nutzer- und Datenverwaltung.
- 🔧 **Aktuelle Bugfixes**: Fokus auf Trainingsergebnisse-Workflow (`Trainingsergebnisse.jsx`), um Ladezustände zu korrigieren, doppeltes Speichern zu verhindern und die Session nach Save zu beenden.
- 🔧 **Route-Fixes**: `uebungenController.getUebungByUserId` und `uebungenRoutes` wurden angepasst, um `GET /api/uebungen/user-uebungen/:id` stabil auszuliefern.
- 🔧 **DB-Schema-Deployment**: Strukturänderungen für `eigene_uebung`-Flag wurden auf dem vServer synchronisiert.
 - 🔧 **Mobile-Scroll-Fix**: `CustomTrainingsplan.jsx` nutzt nun `touchAction: 'pan-y'` auf Plan-Karten, damit vertikales Scrollen auf Mobilgeräten funktioniert, ohne Drag-and-Drop zu beeinträchtigen.

### Offene Baustellen & To-Do's
- **Eigene Übungen ausbauen**: Bearbeiten/Löschen, DB-Feld `muskelgruppe` nutzen, feste Route statt `/test`, Einbindung in Custom-Trainingspläne und Training-Flows.
- **Backend-Neustart sicherstellen**: Nach Änderungen in `uebungenController.js` und `uebungenRoutes.js` muss der Backend-Server neu gestartet werden, damit die aktualisierte API verfügbar ist.
- **Custom-Trainingsplan prüfen**: Verifizieren, dass `CustomTrainingsplan.jsx` aktuelle eigene Übungen korrekt lädt und dass `selectedPlanType`/`source` beim Planwechsel sauber funktionieren.
- **Speicher-Workflow validieren**: Kontrolle des `loading`- und `disabled`-State von Save-Buttons (Desktop + Mobile) nach dem `Trainingsergebnisse.jsx`-Fix, um doppelte Einträge zu verhindern.
- Clean-Up der Test-Routen (`/test` in `App.js`, Komponente `Test.jsx` umbenennen).
- Optimierung der **Barrierefreiheit (Accessibility)**: MUI liefert eine Basis, gezielte `aria`-Attribute müssen noch erweitert werden.
- **Globales Frontend Layout-Refactoring**: Einführung eines `NavBarBotContext`, um `NavBar` und `NavBarBot` als globale Layout-Wrapper in `App.js` auszulagern, ohne dass der Bottom-Nav seine seitenspezifischen Callbacks für Buttons verliert.

### Info zur Sicherheit
- **Keine Gefahr von SQL Injections**: Das gesamte Projekt nutzt bei DB-Queries `mysql2` Prepared Statements (z.B. `db.query('... WHERE id = ?', [id])`).
- Authentifizierung läuft sicher über **JWT**; Passwörter werden mit **bcrypt** gehasht.

---

## 📚 Wichtige Dateien & Ordnerstruktur

### Backend (`/backend`)
- `server.js`: Der Entry-Point für Express und Socket.io. Konfiguriert CORS, globale Middleware und Socket.io Events (`join-termin`, `leave-termin`).
- `routes/`: Definiert die API-Endpoints (z.B. `nutzerRoutes.js`, `uebungenRoutes.js`, `trainingsplanRoutes.js`, `gruppenRoutes.js`).
- `controllers/`: Business-Logik; für eigene Übungen relevant: `uebungenController.js` (`createUserUebung`, `getUebungByUserId`).
- `middleware/authMiddlware.js`: Schützt Routen durch JWT-Validierung.
- `package.json`: Abhängigkeiten (Express, MySQL2, Socket.io, JWT, bcrypt).

### Frontend (`/frontend`)
- `src/App.js`: Haupt-Router mit `react-router-dom` v7. Verwaltet das Theme, AuthProvider und den globalen `SocketManager`.
- `src/components/pages/`: Die einzelnen Seiten der App (aufgeteilt in `basis`, `user`, `training`, `features`, `admin`).
- `src/components/pages/basis/Test.jsx`: Vorläufige UI für eigene Übungen (Formular + Liste), Route `/test`.
- `src/services/api.js`: `TrainingApi.postCreateUserUebung`, `TrainingApi.getUebungenByUserId` für eigene Übungen.
- `src/services/socket.js`: Zentrale WebSocket-Client-Konfiguration.
- `package.json`: Abhängigkeiten (React 19, MUI v7, Redux Toolkit, Recharts).

### Projekt-Tools
- `db_sync.sh`: Skript zur Synchronisation der Datenbank zwischen lokalem Docker-Setup und dem Produktions-vServer.

---

## 🔄 Workflow für KI-Assistenten

Wenn ein neues Feature implementiert werden soll, halte dich an folgenden Ablauf:

1. **Informationen sammeln**: 
   - Überprüfe `backend/server.js` auf bestehende API-Routen.
   - Analysiere relevante Controller im `backend/controllers/` Ordner.
   - Überprüfe das Frontend-Routing in `frontend/src/App.js`.

2. **Backend Implementierung**:
   - Stelle sicher, dass die MySQL-Abfragen sicher sind (Prepared Statements verwenden).
   - Schütze Routen ggf. mit der `authMiddleware`.
   - Implementiere WebSocket-Events, falls das Feature Echtzeit-Updates benötigt.

3. **Frontend Implementierung**:
   - Verwende Material-UI (MUI) Komponenten für konsistentes Design.
   - Beachte den "Dark Mode" (viele Komponenten haben das Suffix `*Dark`).
   - Greife über Axios auf die API zu (URLs im Format `/api/...`).

4. **Datenbank-Änderungen**:
   - Wenn du neue Tabellen anlegst oder bestehende veränderst, dokumentiere diese Änderungen.

### Eigene Übungen (implementierter Stand)

| Schicht | Details |
|--------|---------|
| **DB** | Tabelle `nutzer_eigene_uebungen` (`uebung_name`, `uebung_beschreibung`, `zielmuskel`, `kategorie` ENUM Push/Pull/Beine; `muskelgruppe` in Schema, noch nicht im Backend) |
| **API** | `POST /api/uebungen/user-uebung` (JWT, Body: `name`, `beschreibung`, `zielmuskel`, `kategorie`), `GET /api/uebungen/user-uebungen/:nutzerId` |
| **Frontend** | `Test.jsx` unter `/test` — Dark Theme, Anlegen + Anzeige der eigenen Übungen |

---

## 🚀 Entwicklung starten

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev # Startet nodemon auf Port 3001

# Terminal 2: Frontend
cd frontend
npm install
npm start # Startet React Dev Server auf Port 3000
```

> **Wichtig:** Für Socket.io Verbindungen greift das Frontend auf Port 3001 des Backends zu. Achte darauf, dass CORS in `server.js` für `http://localhost:3000` (und im Production-Fall für die Live-Domain) konfiguriert ist.

*Bereit für die Entwicklung!* 🚀
