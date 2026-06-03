# FiTra – Android App mit Capacitor

Diese Anleitung beschreibt, wie du das React-Frontend als native Android-App mit [Capacitor](https://capacitorjs.com/) baust und testest.

## Voraussetzungen

- **Node.js** (LTS)
- **Android Studio** mit Android SDK (API 24+)
- **Java JDK 17** (von Android Studio mitgeliefert)
- Backend erreichbar unter `https://akkkker.de` (Produktion) oder lokal

## Architektur

| Plattform | Auth | API |
|-----------|------|-----|
| Web-Browser | httpOnly Cookie | `withCredentials: true` |
| Android (Capacitor) | Bearer Token in `@capacitor/preferences` | `Authorization: Bearer …` |

Das Backend unterstützt beide Varianten bereits über `authMiddleware.js`.

## Erstes Setup

```bash
cd frontend
npm install
npm run build
npx cap add android
npx cap sync android
```

## Entwicklungs-Workflow

### 1. Frontend bauen und nach Android synchronisieren

```bash
cd frontend
npm run cap:sync
```

Das führt `npm run build` aus und kopiert die Web-Assets nach `android/`.

### 2. In Android Studio öffnen

```bash
npm run cap:android
```

Dort: **Run** auf einem Emulator oder angeschlossenen Gerät.

### 3. Live-Reload während der Entwicklung (optional)

Terminal 1 – React Dev Server:
```bash
cd frontend
npm start
```

Terminal 2 – Capacitor mit Live-Reload:
```bash
npx cap run android --livereload --external
```

> Für Live-Reload gegen das lokale Backend: `.env` mit `REACT_APP_API_URL=http://<DEINE-IP>:3001/api` setzen (nicht `localhost` – das wäre das Gerät selbst).

## Produktions-Build

Der Production-Build nutzt automatisch `.env.production`:

```
REACT_APP_API_URL=https://akkkker.de/api
```

```bash
cd frontend
npm run cap:sync
npm run cap:android
# In Android Studio: Build → Generate Signed Bundle / APK
```

## NPM-Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run cap:sync` | Build + `cap sync android` |
| `npm run cap:android` | Android Studio öffnen |
| `npm run cap:run:android` | App direkt auf Gerät/Emulator starten |

## Lokales Backend testen (Emulator)

Android-Emulator erreicht den Host-Rechner über `10.0.2.2`:

```
REACT_APP_API_URL=http://10.0.2.2:3001/api
```

Alternativ mit physischem Gerät und `adb reverse`:

```bash
adb reverse tcp:3001 tcp:3001
```

Dann kann `http://localhost:3001/api` funktionieren.

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `capacitor.config.ts` | App-ID, webDir, Splash/StatusBar |
| `src/utils/platform.js` | Erkennung Native vs. Web |
| `src/services/authStorage.js` | Token-Speicherung für Android |
| `src/services/api.js` | Bearer-Token-Interceptor |
| `android/` | Native Android-Projekt (nach `cap add android`) |

## Bekannte Einschränkungen

- **Push-Benachrichtigungen (Web Push)** funktionieren in Capacitor nicht wie im Browser. Für native Push bräuchtest du `@capacitor/push-notifications` (separates Feature).
- **Service Worker** wird in der nativen App deaktiviert (nur Web-PWA).
- **Update-Modal** (`updateService`) ist für Web-PWA gedacht; in der nativen App irrelevant (Updates über Play Store).

## App-ID ändern

In `capacitor.config.ts` das Feld `appId` anpassen, dann:

```bash
npx cap sync android
```

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Weißer Bildschirm | `homepage: "."` in `package.json` prüfen; `npm run build && npx cap sync` |
| Login schlägt fehl | Backend-CORS prüfen; Token-Flow in Logcat/Network-Tab |
| API nicht erreichbar | HTTPS-URL in `.env.production`; bei HTTP nur mit `allowMixedContent` (Dev) |
| Gradle-Fehler | Android Studio → SDK Manager → Android SDK 34 installieren |
