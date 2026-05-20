# 🏋️ GymApp - Fitness & Training Management System
## Projekt-Dokumentation & Architektur

**Status**: 🟢 Aktive Entwicklung
**Frameworks**: React 19, Express.js, Socket.io, MySQL

---

## 📋 Inhaltsverzeichnis

1. [Projektübersicht](#projektübersicht)
2. [Tech Stack](#tech-stack)
3. [Features & Struktur](#features--struktur)
4. [Architektur](#architektur)
5. [API-Referenz (Übersicht)](#api-referenz)
6. [Deployment & Setup](#deployment--setup)

---

## 📖 Projektübersicht

Die **GymApp** (TrainingsApp) ist eine moderne Web-Anwendung zur Verwaltung von Fitness-Routinen, Trainingsgruppen und der Analyse von Trainingsfortschritten. Sie zeichnet sich durch Echtzeit-Kommunikation bei Terminen, detaillierte Custom-Trainingspläne und ein interaktives UI aus.

### Kernfunktionen:
- **Nutzer-Management**: Profilverwaltung, Authentifizierung (JWT), Passwort-Wiederherstellung.
- **Trainingspläne**: Verwaltung von Standard-Plänen sowie hochgradig anpassbaren "Custom-Trainingsplänen".
- **Trainings-Tracking**: Aufzeichnung von Einheiten (Sätze, Wiederholungen, Gewicht) und Historien-Ansicht.
- **Gruppen-System**: Erstellung von Trainingsgruppen, Kalender-Verwaltung, Einladungen und globale Gruppen-Highscores.
- **Echtzeit-Interaktion**: Kommentarsystem in Terminen via WebSockets (Socket.io).
- **Statistiken**: Grafische Auswertung von Gewichtsverläufen und Trainingsergebnissen.

---

## 🛠️ Tech Stack

### Frontend
- **React**: Version 19 (mit React Router v7)
- **UI & Styling**: Material-UI (MUI), Emotion, CSS
- **State Management**: React Context & Redux Toolkit
- **Echtzeit**: `socket.io-client`
- **Charts & Drag-n-Drop**: Recharts, `@dnd-kit`
- **Build-Tool**: Create React App (react-scripts)

### Backend
- **Node.js & Express**: API Backend (Port 3001)
- **Datenbank**: MySQL 8 (verknüpft via `mysql2`)
- **Authentifizierung**: JWT (JSON Web Tokens), `bcrypt` für Passwörter
- **WebSockets**: `socket.io` für Echtzeit-Kommentare ("Termin-Rooms")
- **Zusatz**: `nodemailer` für Mails, `web-push` für Notifications

---

## ✨ Features & Struktur

Die Applikation ist klar nach fachlichen Domains getrennt:

### 1. Training & Pläne
- `Trainingsergebnisse` / `TrainingDetail`: Tracken und Anzeigen von absolvierten Sessions.
- `CustomTrainingsplan`: Ermöglicht es Nutzern, eigene Pläne zusammenzustellen.
- `Historie`: Rückblick auf vergangene Einheiten.

### 2. Gruppen & Social
- `GruppenUebersicht` & `GruppenDetail`: Verwalten von Trainingsgruppen.
- `Einladungen`: System zum Beitreten von Gruppen via Links/Codes.
- `Gruppenkalender`: Planung von gemeinsamen Terminen.
- `AllHighscores`: Ranglisten innerhalb von Gruppen.
- `Kommentare`: Chat-ähnliches Echtzeit-Interface für Termine.

### 3. Profil & Basis
- `LoginDark` / `RegisterDark`: Authentifizierungs-Seiten im Dark Theme.
- `GewichtTrackingPage`: Visuelle Aufbereitung des Gewichtsverlaufs über die Zeit.
- `AdminPanel`: Übersicht und Verwaltungswerkzeuge für Administratoren.

---

## 🏛️ Architektur

### Client-Server Kommunikation
1. **REST API**: Das Frontend nutzt Axios, um mit dem Express-Backend (`/api/...`) zu kommunizieren. Anfragen sind durch JWT (im Auth-Header oder via Cookies) abgesichert.
2. **WebSockets (Socket.io)**: 
   - Ein globaler `SocketManager` im Frontend (`App.js`) verbindet sich nach dem Login.
   - Nutzer können bestimmten "Räumen" beitreten (z.B. `join-termin`), um Echtzeit-Events (wie neue Kommentare) zu empfangen.

### Frontend Routing (App.js)
Die Routen sind durch spezielle Wrapper geschützt (z.B. `<ProtectedUserRoute>`, `<ProtectedGroupRoute>`), um sicherzustellen, dass nur autorisierte Nutzer, bzw. Mitglieder einer bestimmten Gruppe, Zugriff auf spezifische Seiten erhalten.

### Auto-Updater Funktion
In `App.js` ist ein Update-Service integriert, der regelmäßig prüft, ob eine neue Version der App verfügbar ist. Bei Bedarf wird dem Nutzer ein Update-Modal (wahlweise mit Force-Update) präsentiert.

---

## 📡 API-Referenz (Auszug)

Das Backend exponiert folgende Haupt-Routengruppen (siehe `server.js`):

- **`/api/nutzer`**: Login, Register, Passwort-Reset, Session-Validation.
- **`/api/uebungen`**: CRUD-Operationen für die Übungsdatenbank.
- **`/api/trainingsplaene`**: Verwaltung von allgemeinen Trainingsplänen.
- **`/api/custom-trainingsplan`**: Nutzerspezifische Pläne.
- **`/api/training`**: Speichern und Abrufen von Trainings-Sessions.
- **`/api/gruppen`**: Gruppen erstellen, beitreten, Highscores abfragen.
- **`/api/gewicht`**: Tracking-Daten speichern/abrufen.
- **`/api/feedback`**: Systemfeedback und Trainingsbewertungen.
- **`/api/admin`**: Administrative Werkzeuge.

---

## 🚀 Deployment & Setup

### Lokale Entwicklung

1. **Datenbank starten**:
   Nutze den Docker-Container (`tiegel-mysql`), der auf Port 3306 horcht. (Credentials in der lokalen `.env`).

2. **Backend starten**:
   ```bash
   cd backend
   npm install
   npm run dev  # Startet auf http://localhost:3001
   ```

3. **Frontend starten**:
   ```bash
   cd frontend
   npm install
   npm start  # Startet auf http://localhost:3000
   ```

### Datenbank Synchronisation
Im Root-Verzeichnis liegt ein Bash-Skript `db_sync.sh`, welches genutzt wird, um die lokale Datenbankstruktur mit dem Produktions-vServer zu synchronisieren (Push/Pull/Compare). Dies stellt sicher, dass Schema-Anpassungen konsistent ausgerollt werden können.

---

## 🔒 Sicherheit & Schutz
- **SQL Injections**: Sehr gut abgesichert. Das Backend nutzt durchgängig die `mysql2`-Bibliothek mit **Prepared Statements** (parametrisierte Queries mit `?`). Direkte String-Konkatenation von User-Inputs findet nicht statt.
- **Authentifizierung**: JWT für stateless Session-Management (via Cookies & Bearer Tokens). Passwörter sind per `bcrypt` sicher gehasht.
- **Autorisierung**: Custom Middleware (`authMiddleware`) sowie spezifische Prüfungen (z. B. auf Team-Zugehörigkeit) blocken unbefugte API-Zugriffe.

## ♿ Barrierefreiheit (Accessibility / a11y)
- **Status**: Grundlegend.
- Da Material-UI (MUI) eingesetzt wird, bringen viele Basis-Komponenten von Haus aus gewisse Barrierefreiheits-Standards mit. Tiefergehende Optimierungen (spezifische `aria-`-Attribute, Screenreader-Only-Texte, vollständige Tastaturnavigation) müssen in Zukunft noch fokussiert ausgebaut werden.

---

## 📝 Offene Baustellen (To-Do's)
1. **Nutzerspezifische Übungen (User-Eigene Übungen)**: Die Möglichkeit für Nutzer, persönliche Übungen anzulegen, existiert im produktiven Stand noch gar nicht. Dies muss von Grund auf neu entwickelt werden (Backend-Routen, Controller, DB-Erweiterung sowie saubere Frontend-Komponenten).
2. **Barrierefreiheit**: Gezieltes Testing für Screenreader und Keyboard-Flows.
3. **Routing Clean-Up**: Verbliebene temporäre Routen (wie z.B. `/test` in der `App.js`) prüfen und aufräumen.
4. **Globales Layout-Refactoring (Variante B)**: Auslagerung von `NavBar` und `NavBarBot` in eine globale Layout-Komponente (mittels React Router `<Outlet />`). Da der `NavBarBot` pro Seite spezifische Funktionen (Buttons) anbietet, muss ein neuer React Context (z.B. `NavBarBotContext`) implementiert werden. Jede Unterseite aktualisiert darüber dynamisch die Props der globalen Bottom-Bar.

---
*Ende der Projektdokumentation*