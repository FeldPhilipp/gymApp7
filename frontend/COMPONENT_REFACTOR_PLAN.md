# Komponenten-Refactor-Plan

Analysierter Komponentenbaum: `C:\privat\Github\GymApp\frontend\src\components`

Ziel: grosse Page-Komponenten sollen zu kleinen, wiederverwendbaren JSX-Komponenten, Hooks und Hilfsmodulen zerlegt werden. Neue Seiten koennen dann z. B. `ExercisePickerDialog`, `TrainingExerciseCard`, `PageShell`, `StatsCard`, `EntityConfirmDialog` oder `Notification` importieren, statt aehnliche UI und Logik erneut zu schreiben.

## Zielstruktur

Empfohlene neue Ordner unter `src/components`:

- `shared/ui`: generische UI-Bausteine wie `PageShell.jsx`, `SectionCard.jsx`, `StatsCard.jsx`, `EntityConfirmDialog.jsx`, `FormDialog.jsx`, `EmptyState.jsx`, `LoadingState.jsx`, `ResponsiveActionBar.jsx`.
- `shared/training`: trainingsbezogene Bausteine wie `ExerciseChips.jsx`, `ExerciseHistoryPreview.jsx`, `ExerciseSetInputs.jsx`, `SortableExerciseCard.jsx`, `ExercisePickerDialog.jsx`, `TrainingTimer.jsx`, `TrainingPlanSelect.jsx`.
- `shared/forms`: wiederverwendbare Formulare wie `ExerciseForm.jsx`, `PasswordFields.jsx`, `WeightEntryForm.jsx`, `FeedbackFields.jsx`, `AuthCard.jsx`.
- `shared/hooks`: wiederverwendbare Hooks wie `useNotificationMessage.js`, `useExerciseFilters.js`, `useSortableSensors.js`, `useTrainingTimer.js`, `useWeightData.js`.
- `shared/utils`: reine Hilfsfunktionen wie `dateFormatters.js`, `exerciseMappers.js`, `trainingResultMappers.js`, `weightCalculations.js`.
- `pages/*/components`: seitenspezifische Teilkomponenten, die nur in einer Page-Domaene wiederverwendet werden.

## Refactor-Reihenfolge

1. Gemeinsame Huelle extrahieren:
   - Aus fast allen Pages: `ThemeProvider`, `NavBar`, `NavBarBot` oder `LoadingNavBarBot`, `Container`, `HeaderCard`, `BackButton`, `Notification`.
   - Neue Datei: `shared/ui/PageShell.jsx`.
   - Verwendung: `HomeDark`, `GewichtTrackingPage`, `Trainingsergebnisse`, `IndividuellerPlan`, `TrainingDetail`, `AdminPanel`, `FeedbackForm`, `AllHighscores`, `Profil`, `UserUebung`.

2. Benachrichtigungs-Logik zentralisieren:
   - Viele Dateien halten `message`, `showNotification` und Timeout-Logik lokal.
   - Neue Datei: `shared/hooks/useNotificationMessage.js`.
   - Verwendung: alle Pages mit `Notification`.

3. Trainingskarten vereinheitlichen:
   - `Trainingsergebnisse.jsx`, `IndividuellerPlan.jsx`, `TrainingDetail.jsx`, `CustomTrainingsplan.jsx` und `Uebungcard.jsx` enthalten Varianten von Uebungs-/Sortable-Cards.
   - Neue Dateien: `shared/training/ExerciseCardShell.jsx`, `shared/training/SortableExerciseCard.jsx`, `shared/training/ExerciseSetInputs.jsx`, `shared/training/ExerciseHistoryPreview.jsx`, `shared/training/ExerciseChips.jsx`.
   - Verwendung: Trainingssession, individueller Plan, Custom-Plan-Editor, Trainingsdetail, zukuenftige Uebungslisten.

4. Uebungsauswahl und Filter extrahieren:
   - `Trainingsergebnisse.jsx`, `IndividuellerPlan.jsx`, `TrainingDetail.jsx`, `CustomTrainingsplan.jsx`, `UserUebung.jsx` und `Test.jsx` enthalten gleiche Filterfelder fuer Kategorie/Zielmuskel und Autocomplete.
   - Neue Dateien: `shared/hooks/useExerciseFilters.js`, `shared/training/ExerciseFilterBar.jsx`, `shared/training/ExercisePickerDialog.jsx`.
   - Verwendung: alle Seiten, die Standard- oder eigene Uebungen suchen/auswaehlen.

5. Trainingsergebnisse in Session-Module zerlegen:
   - `Trainingsergebnisse.jsx` ist mit 1477 Zeilen der groesste Kandidat.
   - Neue Dateien:
     - `pages/training/session/TrainingSessionPage.jsx`
     - `pages/training/session/PlanSelectionSection.jsx`
     - `pages/training/session/SelectedExercisesList.jsx`
     - `pages/training/session/SaveTrainingDialog.jsx`
     - `pages/training/session/SessionActions.jsx`
     - `shared/hooks/useTrainingTimer.js`
     - `shared/hooks/useTempTrainingSession.js`
     - `shared/utils/trainingResultMappers.js`
   - Wiederverwendung: `IndividuellerPlan` kann dieselben Session-Hooks und dieselben Karten nutzen.

6. CustomTrainingsplan in Plan-Editor zerlegen:
   - `CustomTrainingsplan.jsx` enthaelt Listen, Plan-CRUD, Uebungsdialoge und Drag-and-drop.
   - Neue Dateien:
     - `pages/training/custom/TrainingPlanList.jsx`
     - `pages/training/custom/TrainingPlanCard.jsx`
     - `pages/training/custom/PlanExerciseCard.jsx`
     - `pages/training/custom/TrainingPlanFormDialog.jsx`
     - `pages/training/custom/PlanExerciseDialog.jsx`
     - `pages/training/custom/useCustomTrainingPlans.js`
   - Wiederverwendung: Planlisten koennen auf Dashboard/Home und in der Sessionauswahl genutzt werden.

7. TrainingDetail in Detail-Editor zerlegen:
   - `TrainingDetail.jsx` enthaelt Session-Header, Ergebnisliste, Editiermodus, Add-Exercise-Dialog und Delete-Dialog.
   - Neue Dateien:
     - `pages/training/detail/TrainingSessionHeader.jsx`
     - `pages/training/detail/TrainingResultAccordion.jsx`
     - `pages/training/detail/EditTrainingActions.jsx`
     - `pages/training/detail/DeleteTrainingDialog.jsx`
   - Wiederverwendung: `TrainingResultAccordion` kann auch fuer Historie und Profilstatistiken dienen.

8. Gewicht-Feature entkoppeln:
   - `GewichtTrackingPage.jsx` und `GewichtStatistik.jsx` teilen Gewichtsdaten, Statistik, Trend- und Dialoglogik.
   - Neue Dateien:
     - `pages/features/gewicht/WeightSummaryCards.jsx`
     - `pages/features/gewicht/WeightEntryDialog.jsx`
     - `pages/features/gewicht/WeightHistoryTable.jsx`
     - `pages/features/gewicht/DeleteWeightDialog.jsx`
     - `shared/hooks/useWeightData.js`
     - `shared/utils/weightCalculations.js`
     - `shared/charts/WeightChart.jsx`
     - `shared/charts/CaloriesSummary.jsx`
   - Wiederverwendung: `Profil.jsx`, Dashboard/Home und Gruppenansichten koennen dieselben Gewichtskomponenten anzeigen.

9. Profil in Tabs und Settings zerlegen:
   - `Profil.jsx` vermischt Profilanzeige, Bearbeitungsformular, Passwortdialog, Service-Worker-Settings, Cache und Push-Notifications.
   - Neue Dateien:
     - `pages/user/profile/ProfileHeader.jsx`
     - `pages/user/profile/ProfileInfoTab.jsx`
     - `pages/user/profile/ProfileEditForm.jsx`
     - `pages/user/profile/ProfileSettingsTab.jsx`
     - `pages/user/profile/ChangePasswordDialog.jsx`
     - `pages/user/profile/ServiceWorkerSettings.jsx`
     - `pages/user/profile/PushNotificationSettings.jsx`
     - `pages/user/profile/useProfileData.js`
     - `pages/user/profile/usePwaSettings.js`
   - Wiederverwendung: Settings-Karten koennen spaeter in eine Admin-/App-Settings-Seite wandern.

10. Gruppen/Kalender modularisieren:
   - `GurppenKalenderWidget.jsx`, `TerminDetailDialog.jsx`, `GruppenDetail.jsx`, `GruppenUebersicht.jsx`, `Gruppenkalender.jsx` enthalten Gruppen- und Terminmuster.
   - Neue Dateien:
     - `shared/groups/GroupCard.jsx`
     - `shared/groups/GroupMemberList.jsx`
     - `shared/groups/calendar/CalendarDayBadge.jsx`
     - `shared/groups/calendar/TerminList.jsx`
     - `shared/groups/calendar/TerminFormDialog.jsx`
     - `shared/groups/calendar/TerminParticipationPanel.jsx`
     - `shared/hooks/useGroupCalendar.js`
   - Wiederverwendung: Detailseite, Gruppenkalender und Dashboard-Widget.

11. Auth-Seiten vereinheitlichen:
   - `LoginDark.jsx`, `RegisterDark.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` verwenden aehnliche dunkle Auth-Karten und Formularablaeufe.
   - Neue Dateien:
     - `shared/forms/AuthCard.jsx`
     - `shared/forms/PasswordField.jsx`
     - `shared/forms/AuthSubmitButton.jsx`
     - `pages/user/auth/RegisterStepAccount.jsx`
     - `pages/user/auth/RegisterStepPersonal.jsx`
     - `pages/user/auth/RegisterStepBody.jsx`
   - Wiederverwendung: neue Auth- oder Account-Seiten.

12. Admin/Feedback/Highscores auf Listen- und Dialogbausteine reduzieren:
   - Neue Dateien:
     - `pages/admin/components/AdminEntityCard.jsx`
     - `pages/admin/components/AdminEditDialog.jsx`
     - `pages/feedback/components/FeedbackCard.jsx`
     - `pages/feedback/components/FeedbackStatusChip.jsx`
     - `pages/highscores/components/HighscoreList.jsx`
     - `pages/highscores/components/HighscoreFilters.jsx`
   - Wiederverwendung: AdminPanel, Logs, FeedbackUebersicht, AllHighscores, HomeDark.

## Datei-fuer-Datei-Plan

| Datei | Aufteilen in | Wiederverwendung |
| --- | --- | --- |
| `pages/training/Trainingsergebnisse.jsx` | `TrainingSessionPage`, `PlanSelectionSection`, `SelectedExercisesList`, `TrainingExerciseCard`, `ExerciseSetInputs`, `ExerciseHistoryPreview`, `ExercisePickerDialog`, `TrainingTimer`, `SaveTrainingDialog`, `useTempTrainingSession`, `trainingResultMappers` | Basis fuer alle Trainingssessions und individuelle Trainingsablaeufe. |
| `pages/user/Profil.jsx` | `ProfileHeader`, `ProfileInfoTab`, `ProfileEditForm`, `ProfileSettingsTab`, `ChangePasswordDialog`, `ServiceWorkerSettings`, `PushNotificationSettings`, `useProfileData`, `usePwaSettings` | Profilseite, Account-Settings, Admin-Useransicht. |
| `pages/training/TrainingDetail.jsx` | `TrainingSessionHeader`, `TrainingResultAccordion`, `EditableSetRow`, `AddExerciseDialog`, `DeleteTrainingDialog`, `useTrainingSessionDetail` | Trainingshistorie, Detailansichten, Wiederaufnahme/Bearbeitung alter Sessions. |
| `pages/training/IndividuellerPlan.jsx` | `IndividuellerPlanPage`, `TrainingExerciseCard`, `ExercisePickerDialog`, `TrainingTimer`, `SelectedExercisesList`, `useTrainingSessionDraft` | Kann dieselben Module wie `Trainingsergebnisse` nutzen. |
| `pages/features/GewichtTrackingPage.jsx` | `WeightSummaryCards`, `WeightEntryDialog`, `WeightHistoryTable`, `DeleteWeightDialog`, `useWeightData` | Profil, Dashboard, Statistikseiten. |
| `pages/training/CustomTrainingsplan.jsx` | `TrainingPlanList`, `TrainingPlanCard`, `PlanExerciseCard`, `TrainingPlanFormDialog`, `PlanExerciseDialog`, `useCustomTrainingPlans` | Custom-Plan-Verwaltung, Plan-Auswahl in Trainingssession. |
| `shared/GurppenKalenderWidget.jsx` | `GymCalendarWidget`, `CalendarDayBadge`, `TerminList`, `TerminFormDialog`, `useGroupCalendar` | GruppenDetail, Gruppenkalender, Home/Dashboard. |
| `pages/basis/LandingPage.jsx` | `LandingHeader`, `LandingNav`, `FeatureSection`, `DeviceShowcase`, `LandingCta` | Marketing-/Startseiten. |
| `pages/basis/HomeDark.jsx` | `HomeHeader`, `TrainingOverviewCard`, `GroupOverviewCard`, `DashboardActionGrid`, `HomeHighscoresPanel` | Dashboard-Startseite, zukuenftige Home-Widgets. |
| `shared/GewichtStatistik.jsx` | `WeightProgressCard`, `WeightChart`, `CaloriesSummary`, `WeightGoalProgress`, `useWeightStatistics` | GewichtTrackingPage, Profil, Dashboard. |
| `pages/user/GruppenDetail.jsx` | `GroupHeader`, `GroupTabs`, `GroupMembersPanel`, `GroupInvitePanel`, `GroupCalendarPanel` | Gruppenuebersicht, Admin-Gruppenansicht. |
| `util/Dialogs/TerminDetailDialog.jsx` | `TerminDetailDialog`, `TerminMeta`, `TerminParticipants`, `TerminParticipationActions`, `TerminNotes` | Kalenderwidget und Gruppenkalender. |
| `shared/Kommentare.jsx` | `KommentarList`, `KommentarItem`, `KommentarComposer`, `useKommentare` | Gruppen, Training, Feedback-Kommentare. |
| `pages/features/AllHighscores.jsx` | `HighscoreFilters`, `HighscoreTable`, `HighscoreCardList`, `HighscoreEmptyState` | Dashboard-Highscores und Gruppen-Highscores. |
| `pages/user/RegisterDark.jsx` | `AuthCard`, `RegisterStepper`, `RegisterStepAccount`, `RegisterStepPersonal`, `RegisterStepBody`, `PasswordField` | Auth-Flows und Profilanlage. |
| `pages/admin/AdminPanel.jsx` | `AdminSectionCard`, `AdminEntityList`, `AdminEditDialog`, `AdminDeleteDialog` | Adminseiten fuer weitere Entitaeten. |
| `pages/features/FeedbackUebersicht.jsx` | `FeedbackFilterBar`, `FeedbackCard`, `FeedbackStatusChip`, `FeedbackDetailDialog` | Admin-Feedback, User-Feedbackliste. |
| `pages/user/UserUebung.jsx` | `ExerciseForm`, `UserExerciseList`, `UserExerciseCard`, `exerciseOptions` | Eigene Uebungen, Testseite, Plan-Editor. |
| `pages/basis/Test.jsx` | Sollte durch `UserUebung.jsx` plus `ExerciseForm` ersetzt werden | Entwicklungs-/Testseite entfernen oder als Story/Test-Huelle nutzen. |
| `pages/user/GruppenUebersicht.jsx` | `GroupCard`, `CreateGroupDialog`, `GroupList`, `InviteCodeForm` | Dashboard, Admin-Gruppenliste. |
| `pages/training/Uebungcard.jsx` | In `shared/training/SortableExerciseCard.jsx` ueberfuehren | Gemeinsame Uebungskarte fuer Plan- und Sessionseiten. |
| `layout/RotaryWheel.jsx` | `RotaryWheel`, `RotaryWheelItem`, `useRotaryDrag` | Mobile Navigation oder Feature-Auswahl. |
| `layout/NavBar.jsx` | `NavBar`, `NavMenuItems`, `UserMenu`, `NotificationMenuButton` | Hauptnavigation. |
| `pages/training/Historie.jsx` | `TrainingHistoryList`, `TrainingHistoryCard`, `TrainingHistoryFilters` | Profil, Dashboard, Detailnavigation. |
| `pages/features/FeedbackForm.jsx` | `FeedbackFields`, `FeedbackTypeSelect`, `FeedbackSubmitActions` | Feedback-Erstellung in verschiedenen Kontexten. |
| `pages/user/LoginDark.jsx` | `AuthCard`, `PasswordField`, `AuthSubmitButton` | Login und Passwortseiten. |
| `pages/features/ResetPassword.jsx` | `AuthCard`, `PasswordField`, `PasswordResetForm` | Auth-Flows. |
| `pages/basis/OfflinePage.jsx` | `OfflineStatusCard`, `RetryConnectionButton`, `PwaInfoList` | PWA-Statusseiten. |
| `layout/BenachrichtigungenDropdown.jsx` | `NotificationBell`, `NotificationDropdownList`, `NotificationItem` | NavBar, Profil, Benachrichtigungsseite. |
| `pages/features/Einladungen.jsx` | `InvitationList`, `InvitationCard`, `InvitationActions` | Benachrichtigungen und Gruppenuebersicht. |
| `layout/NavBarBot.jsx` | `BottomNavigationBar`, `BottomNavAction`, `FloatingMainAction` | Alle mobilen Page-Aktionen. |
| `pages/features/ForgotPassword.jsx` | `AuthCard`, `EmailField`, `ForgotPasswordForm` | Auth-Flows. |
| `util/buttons/TipsButton.jsx` | `FloatingTipsButton`, `TipsMenu`, `TipsToggle` | Hilfe-/Tippsystem, aktuell auskommentiert. |
| `pages/features/Highscores.jsx` | `HighscoreList`, `HighscoreListItem`, `HighscoreEmptyState` | Home, AllHighscores, Gruppenansicht. |
| `util/notifications/Notification.jsx` | Behalten; optional `useNotificationMessage` ergaenzen | Zentrale Snackbar/Alert-Komponente. |
| `context/AuthContext.jsx` | Behalten; optional Auth-Storage/Push-Init auslagern | Globaler Auth-Provider und `useAuth`. |
| `util/Dialogs/HistoryDialog.jsx` | `HistoryDialog`, `HistorySession`, `HistorySetRow` | Trainingskarten, TrainingDetail. |
| `auth/ProtectedRoute.jsx` | Behalten; Zugriffstests als Props | Alle geschuetzten Routen. |
| `layout/LoadingNavBarBot.jsx` | Behalten; in `LoadingState` integrierbar | Ladezustand fuer Bottom Navigation. |
| `context/ApiProtectionContext.jsx` | Behalten | API-Debounce/Protection fuer Aktionsbuttons. |
| `pages/admin/Logs.jsx` | `LogsTable`, `LogsFilterBar` | AdminPanel und Debug-Ansichten. |
| `pages/user/Gruppenkalender.jsx` | Kleine Wrapper-Page um `GymCalendarWidget` | Direkte Kalenderroute. |
| `auth/ProtectedRouteWrappers.jsx` | Behalten oder aus Routenconfig generieren | Spezialisierte Route Guards. |
| `util/buttons/BackButton.jsx` | Behalten; Props fuer Variante/Icon-only ergaenzen | Alle Detail- und Formularseiten. |
| `layout/LoadingPage.jsx` | Behalten; mit `PageShell` kombinieren | Globale Ladeanzeige. |
| `context/DrawerContext.jsx` | Behalten | Drawer-/Sidebar-State. |
| `layout/HeaderCard.jsx` | Behalten; mit `PageHeader` vereinheitlichen | Page-Titelbereiche. |
| `util/CustomCardHeader.jsx` | Durch `SectionCard` ersetzen oder in `shared/ui` verschieben | Wiederverwendbare Card-Huelle. |

## JSX-Katalog

### Auth

- `auth/ProtectedRoute.jsx`: Prueft per `checkAccess`, ob Kinder gerendert werden duerfen. Wiederverwendbar fuer jede Route mit asynchroner Berechtigungspruefung.
- `auth/ProtectedRouteWrappers.jsx`: Bietet konkrete Wrapper fuer Gruppen, Training, Kommentare und User. Wiederverwendbar in der Routen-Konfiguration.

### Context

- `context/ApiProtectionContext.jsx`: Stellt `protect` bereit, um API-Aktionen gegen schnelle Mehrfachausfuehrung zu schuetzen. Wiederverwendbar fuer Submit-, Delete- und Toggle-Aktionen.
- `context/AuthContext.jsx`: Verwaltet eingeloggten Nutzer, Loginstatus und Auth-Helfer. Wiederverwendbar ueber `useAuth`.
- `context/DrawerContext.jsx`: Verwaltet offenen/geschlossenen Drawer-State. Wiederverwendbar fuer Navigation oder Sidebars.

### Layout

- `layout/BenachrichtigungenDropdown.jsx`: Dropdown fuer Benachrichtigungen/Gruppeneinladungen. Wiederverwendbar in `NavBar` oder einer Benachrichtigungsseite.
- `layout/HeaderCard.jsx`: Kompakter Page-Header mit Titel, Subtitle und Icon. Wiederverwendbar fuer nahezu alle Pages.
- `layout/LoadingNavBarBot.jsx`: Skeleton/Ladezustand fuer die untere Navigation. Wiederverwendbar, wenn Nutzer/Auth noch laedt.
- `layout/LoadingPage.jsx`: Vollseiten-Ladezustand mit NavBarBot-Loading. Wiederverwendbar bei initialem Page-Loading.
- `layout/NavBar.jsx`: Hauptnavigation mit User-/Notification-Funktionen. Wiederverwendbar als Standard-Topbar.
- `layout/NavBarBot.jsx`: Untere mobile Aktionsnavigation. Wiederverwendbar fuer Page-Aktionen wie Start, Speichern, Hinzufuegen.
- `layout/RotaryWheel.jsx`: Interaktives Rad-Menue. Wiederverwendbar fuer spielerische Feature- oder Trainingsauswahl.

### Admin

- `pages/admin/AdminPanel.jsx`: Admin-Verwaltung fuer Daten/Entitaeten mit Dialogen. Sollte in Listen, Karten und Edit-Dialoge zerlegt werden.
- `pages/admin/Logs.jsx`: Zeigt Admin-Logs. Wiederverwendbar als Admin-Tab oder eigenstaendige Log-Page.

### Basis

- `pages/basis/HomeDark.jsx`: Eingeloggtes Dashboard mit Training, Gruppen, Feedback und Navigation. Sollte in Dashboard-Widgets zerlegt werden.
- `pages/basis/LandingPage.jsx`: Oeffentliche Landingpage mit Navigation, Featurebereichen und Device-Showcase. Wiederverwendbar fuer Marketing-Abschnitte.
- `pages/basis/OfflinePage.jsx`: PWA-/Offline-Statusseite mit Retry. Wiederverwendbar fuer Netzwerkfehler.
- `pages/basis/Test.jsx`: Duplikat-/Testvariante der eigenen Uebungen. Sollte durch gemeinsame Uebungsformular-Komponenten ersetzt oder entfernt werden.

### Features

- `pages/features/AllHighscores.jsx`: Vollstaendige Highscore-Seite mit Filtern und Liste. Wiederverwendbar ueber Highscore-Filter und Highscore-Liste.
- `pages/features/Einladungen.jsx`: Benachrichtigungen/Einladungen verwalten. Wiederverwendbar ueber InvitationCard und InvitationActions.
- `pages/features/FeedbackForm.jsx`: Formular zum Erstellen von Feedback. Wiederverwendbar ueber FeedbackFields und Submit-Actions.
- `pages/features/FeedbackUebersicht.jsx`: Uebersicht und Verwaltung von Feedback. Wiederverwendbar ueber FeedbackCard, Filter und Status-Chips.
- `pages/features/ForgotPassword.jsx`: Passwort-vergessen-Flow. Wiederverwendbar ueber AuthCard und EmailForm.
- `pages/features/GewichtTrackingPage.jsx`: Gewichtseintraege, Stat-Karten, Dialoge und Statistik. Sollte Gewichtsdaten-Hook, Entry-Dialoge und Stat-Komponenten nutzen.
- `pages/features/Highscores.jsx`: Kompakte Highscore-Liste. Wiederverwendbar in Home, Gruppen und AllHighscores.
- `pages/features/ResetPassword.jsx`: Passwort-zuruecksetzen-Flow. Wiederverwendbar ueber AuthCard und PasswordFields.

### Training

- `pages/training/CustomTrainingsplan.jsx`: Verwaltung eigener Trainingsplaene mit Drag-and-drop und Uebungsauswahl. Sollte in Planliste, Planformular, Uebungskarten und Dialoge zerlegt werden.
- `pages/training/Historie.jsx`: Trainingshistorie. Wiederverwendbar ueber TrainingHistoryList/Card.
- `pages/training/IndividuellerPlan.jsx`: Individuelle Trainingssession ohne festen Plan. Sollte Session-Hooks und gemeinsame Trainingskarten aus `shared/training` nutzen.
- `pages/training/TrainingDetail.jsx`: Detail- und Editieransicht einer gespeicherten Trainingssession. Sollte SessionHeader, ResultAccordion und Dialoge extrahieren.
- `pages/training/Trainingsergebnisse.jsx`: Hauptseite zum Erfassen und Speichern von Trainingsergebnissen. Groesster Refactor-Kandidat; sollte in Session-Hooks, Plan-Auswahl, ExerciseCards, Timer und Dialoge zerlegt werden.
- `pages/training/Uebungcard.jsx`: Einzelne Uebungskarte. Sollte als gemeinsame `SortableExerciseCard` in `shared/training` dienen.

### User

- `pages/user/GruppenDetail.jsx`: Detailseite einer Gruppe mit Tabs, Mitgliedern und Kalender. Sollte GroupHeader, Tabs und Panels extrahieren.
- `pages/user/Gruppenkalender.jsx`: Wrapper-Page fuer den Gruppenkalender. Wiederverwendbar durch `GymCalendarWidget`.
- `pages/user/GruppenUebersicht.jsx`: Gruppenliste und Gruppenaktionen. Wiederverwendbar ueber GroupCard und CreateGroupDialog.
- `pages/user/LoginDark.jsx`: Loginseite im dunklen Stil. Wiederverwendbar ueber AuthCard und PasswordField.
- `pages/user/Profil.jsx`: Profil, Bearbeitung, PWA-Settings und Passwortdialog. Sollte in ProfileHeader, Tabs, Formulare und Settings-Hooks zerlegt werden.
- `pages/user/RegisterDark.jsx`: Mehrstufige Registrierung. Wiederverwendbar ueber AuthCard, RegisterStepper und Step-Komponenten.
- `pages/user/UserUebung.jsx`: Eigene Uebungen erstellen und listen. Sollte gemeinsames ExerciseForm und UserExerciseCard nutzen.

### Shared

- `shared/GewichtStatistik.jsx`: Gewichtscharts, Fortschritt und Kalorienberechnung. Sollte Charts, Berechnungen und Statistik-Hook trennen.
- `shared/GurppenKalenderWidget.jsx`: Gruppen-Kalenderwidget mit Termin-CRUD. Sollte Kalender, Terminliste, Dialog und Hook trennen.
- `shared/Kommentare.jsx`: Kommentaransicht mit Liste, Composer und Live-/Socket-Aktualisierung. Sollte in KommentarList, KommentarItem, Composer und Hook zerlegt werden.

### Util

- `util/CustomCardHeader.jsx`: Kleine Card-Huelle. Sollte in `shared/ui/SectionCard.jsx` aufgehen.
- `util/buttons/BackButton.jsx`: Zurueck-Button mit optionaler Funktion. Wiederverwendbar auf Detail- und Formularseiten.
- `util/buttons/TipsButton.jsx`: Auskommentierter Floating-Tipps-Button. Bei Reaktivierung in TipsButton, TipsMenu und TipsToggle zerlegen.
- `util/Dialogs/HistoryDialog.jsx`: Dialog fuer Trainingshistorie einer Uebung. Wiederverwendbar aus ExerciseCards und TrainingDetail.
- `util/Dialogs/TerminDetailDialog.jsx`: Dialog fuer Termin-Details, Teilnahme und Aktionen. Sollte TerminMeta, Participants und Actions extrahieren.
- `util/notifications/Notification.jsx`: Snackbar/Alert-Komponente. Behalten und mit `useNotificationMessage` kombinieren.

## Konkrete Import-Beispiele

```jsx
import PageShell from "../../shared/ui/PageShell";
import ExercisePickerDialog from "../../shared/training/ExercisePickerDialog";
import SortableExerciseCard from "../../shared/training/SortableExerciseCard";
import { useNotificationMessage } from "../../shared/hooks/useNotificationMessage";
```

```jsx
<PageShell title="Gewicht Tracker" navBottom={<NavBarBot mainBtnF={openAddDialog} mainBtnTxt={<AddIcon />} />}>
  <WeightSummaryCards stats={stats} />
  <WeightHistoryTable entries={gewichtData} onEdit={handleEdit} onDelete={openDeleteDialog} />
  <WeightEntryDialog open={addDialogOpen} value={formData} onChange={handleInputChange} onSave={handleSubmit} />
</PageShell>
```

## Wichtige Hinweise

- Erst Komponenten ohne API-Logik extrahieren, danach Hooks. So bleibt das Risiko klein.
- Bei Drag-and-drop-Komponenten immer `id`-Strategie vereinheitlichen: `uiId` fuer UI-Listen, `uebung_id` fuer Backend-Daten.
- `Test.jsx` und `UserUebung.jsx` zuerst vergleichen; wahrscheinlich kann `Test.jsx` nach Extraktion entfallen.
- Bestehende Komponenten wie `HeaderCard`, `BackButton`, `Notification`, `LoadingPage` und `NavBarBot` nicht neu erfinden, sondern als Grundlage fuer `PageShell` und gemeinsame UI nutzen.
