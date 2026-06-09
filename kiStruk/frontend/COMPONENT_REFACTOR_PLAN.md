# Komponenten-Refactor-Plan und JSX-Katalog

Analysierter Komponentenbaum: `C:\privat\Github\GymApp\kiStruk\frontend\src\components`

Stand: 2026-06-08

Ziel: grosse Page-Dateien sollen schrittweise in kleine, wiederverwendbare JSX-Komponenten, Hooks und Utils zerlegt werden. Neue Seiten sollen dadurch bestehende Bausteine importieren koennen, statt Layout, Dialoge, Karten, Filter, Formulare und Lade-/Notification-Logik erneut zu schreiben.

## Leitlinien

- Pages behalten Routing, Datenladen und Feature-Orchestrierung.
- Wiederverwendbare UI kommt nach `src/components/shared/ui`.
- Feature- oder Domain-Bausteine kommen nach `src/components/shared/<domain>`, z. B. `shared/training`, `shared/groups`, `shared/weight`, `shared/feedback`.
- Wiederverwendbare Hooks kommen nach `src/components/shared/hooks`.
- Reine Formatierung, Berechnung und Mapping kommen nach `src/components/shared/utils`.
- Komponenten, die nur fuer eine Page-Gruppe sinnvoll sind, bleiben unter `pages/<bereich>/components`.
- Erst JSX ohne API-Nebenwirkungen extrahieren, danach Datenlogik in Hooks auslagern.
- Bestehende Komponenten wie `PageShell`, `HeaderCard`, `BackButton`, `Notification`, `LoadingPage`, `NavBar` und `NavBarBot` weiterverwenden und nicht neu erfinden.

## Empfohlene Zielstruktur

```text
src/components/
  shared/
    ui/
      PageShell.jsx
      SectionCard.jsx
      StatCard.jsx
      EmptyState.jsx
      LoadingState.jsx
      ConfirmDialog.jsx
      FormDialog.jsx
      ResponsiveActionBar.jsx
    hooks/
      useNotificationMessage.js
      useExerciseFilters.js
      useSortableSensors.js
      useTrainingSession.js
      useTrainingPlans.js
      useWeightData.js
      useGroupCalendar.js
      useFeedbackList.js
    utils/
      dateFormatters.js
      trainingMappers.js
      weightCalculations.js
      groupMappers.js
    training/
      ExerciseChips.jsx
      ExerciseFilterBar.jsx
      ExercisePickerDialog.jsx
      ExerciseSetInputs.jsx
      ExerciseHistoryPreview.jsx
      ExerciseHistoryDialog.jsx
      SortableExerciseCard.jsx
      TrainingPlanCard.jsx
      TrainingResultAccordion.jsx
      TrainingTimer.jsx
    weight/
      WeightSummaryCards.jsx
      WeightEntryDialog.jsx
      WeightHistoryTable.jsx
      WeightChartSection.jsx
    groups/
      GroupCard.jsx
      GroupHeader.jsx
      GroupMembersPanel.jsx
      GroupCalendarWidget.jsx
      AppointmentList.jsx
      AppointmentDialog.jsx
    feedback/
      FeedbackFields.jsx
      FeedbackCard.jsx
      FeedbackFilterBar.jsx
      FeedbackStatusChip.jsx
    auth/
      AuthCard.jsx
      PasswordFields.jsx
      EmailForm.jsx
```

## Refactor-Reihenfolge

### 1. Gemeinsame Page-Huelle fertig vereinheitlichen

Betroffene Dateien: `FeedbackForm.jsx`, `HomeDark.jsx`, `AllHighscores.jsx`, `GewichtTrackingPage.jsx`, `Historie.jsx`, `IndividuellerPlan.jsx`, `TrainingDetail.jsx`, `Trainingsergebnisse.jsx`, `GruppenDetail.jsx`, `GruppenUebersicht.jsx`, `Profil.jsx`, `UserUebung.jsx`, `AdminPanel.jsx`.

Extrahieren/verwenden:

- `shared/ui/PageShell.jsx`: existiert bereits und sollte Standard fuer `ThemeProvider`, `NavBar`, `Container`, `HeaderCard`, `BackButton`, Ladezustand und Bottom-Navigation werden.
- `shared/ui/LoadingState.jsx`: gemeinsame Variante fuer `LoadingPage`, `LoadingNavBarBot` und Inline-Loading.
- `shared/ui/ResponsiveActionBar.jsx`: Wrapper fuer wiederkehrende `NavBarBot`-Aktionen.

Wiederverwendung:

- Jede neue Page startet mit `PageShell`.
- Seiten geben nur noch Titel, Untertitel, Icon, `loading`, `bottomBar` und Inhalt an.

### 2. Notification-State zentralisieren

Betroffene Dateien: sehr viele Pages mit `message`, `showNotification`, `setTimeout` oder `Notification`.

Extrahieren/verwenden:

- `shared/hooks/useNotificationMessage.js`: existiert bereits.
- Optional: `shared/ui/NotificationOutlet.jsx`, falls spaeter eine einheitliche Positionierung gebraucht wird.

Wiederverwendung:

- `FeedbackForm.jsx` nutzt den Hook bereits.
- Danach auf `LoginDark`, `RegisterDark`, `GewichtTrackingPage`, `Trainingsergebnisse`, `TrainingDetail`, `GruppenDetail`, `GruppenUebersicht`, `Einladungen`, `FeedbackUebersicht`, `ProtectedRoute` anwenden.

### 3. Trainingskarten und Satz-Eingaben zusammenfuehren

Betroffene Dateien: `Trainingsergebnisse.jsx`, `IndividuellerPlan.jsx`, `TrainingDetail.jsx`, `CustomTrainingsplan.jsx`, `Uebungcard.jsx`, `HistoryDialog.jsx`.

Extrahieren:

- `shared/training/ExerciseChips.jsx`: Zielmuskel- und Kategorie-Chips.
- `shared/training/ExerciseCardHeader.jsx`: Name, Drag-Handle, Edit/Delete/Expand/History-Aktionen.
- `shared/training/ExerciseSetInputs.jsx`: Wiederholungen, Gewicht und Satz-Loeschen.
- `shared/training/DropSetInputs.jsx`: Dropsatz-Eingaben aus `Trainingsergebnisse.jsx` und `Uebungcard.jsx`.
- `shared/training/ExerciseHistoryPreview.jsx`: letzte Session/letzte Saetze.
- `shared/training/SortableExerciseCard.jsx`: gemeinsame sortierbare Karte fuer Session- und Plan-Kontexte.
- `shared/training/TrainingResultAccordion.jsx`: Ergebnisanzeige aus `TrainingDetail.jsx`.

Wiederverwendung:

- `Trainingsergebnisse` und `IndividuellerPlan` verwenden dieselbe Session-Karte.
- `TrainingDetail` verwendet `TrainingResultAccordion` plus `ExerciseSetInputs` im Editiermodus.
- `CustomTrainingsplan` verwendet `ExerciseChips`, `ExerciseCardHeader` und eine schlankere Plan-Variante der Karte.

### 4. Uebungsauswahl und Filter extrahieren

Betroffene Dateien: `Trainingsergebnisse.jsx`, `IndividuellerPlan.jsx`, `TrainingDetail.jsx`, `CustomTrainingsplan.jsx`, `UserUebung.jsx`, `Test.jsx`.

Extrahieren:

- `shared/hooks/useExerciseFilters.js`: Kategorie, Zielmuskel, Suchtext und gefilterte Liste.
- `shared/training/ExerciseFilterBar.jsx`: Selects/Autocomplete fuer Kategorie und Zielmuskel.
- `shared/training/ExercisePickerDialog.jsx`: Dialog zum Auswaehlen einer Uebung.
- `shared/training/UserExerciseForm.jsx`: eigene Uebung erstellen/bearbeiten.

Wiederverwendung:

- Neue Trainingsseiten importieren nur noch Picker/Dialog/Form.
- `UserUebung.jsx` und `Test.jsx` koennen auf denselben Formular- und Filtercode reduziert werden.

### 5. `Trainingsergebnisse.jsx` in Session-Module aufteilen

Aktuell groesster Kandidat mit ca. 1140 Zeilen.

Neue Dateien:

- `pages/training/session/TrainingSessionPage.jsx`: Hauptcontainer und Routing.
- `pages/training/session/PlanSelectionSection.jsx`: Trainingsplan-Auswahl.
- `pages/training/session/SelectedExercisesList.jsx`: DnD-Liste der aktuellen Uebungen.
- `pages/training/session/SaveTrainingDialog.jsx`: Speichern/Session abschliessen.
- `pages/training/session/SessionActions.jsx`: Start, Speichern, Zurueck, Uebung hinzufuegen.
- `shared/hooks/useTrainingSession.js`: Uebungen, Ergebnisse, Dropsaetze, Reorder, Add/Delete.
- `shared/hooks/useTrainingTimer.js`: Timer-State.
- `shared/utils/trainingMappers.js`: Payloads fuer API-Speichern und Ergebnis-Gruppierung.

Wiederverwendung:

- `IndividuellerPlan.jsx` kann denselben Hook und dieselbe Kartenliste nutzen.
- `TrainingDetail.jsx` kann dieselben Mapper zum Bearbeiten gespeicherter Daten verwenden.

### 6. `CustomTrainingsplan.jsx` in Plan-Editor zerlegen

Neue Dateien:

- `pages/training/custom/CustomTrainingPlanPage.jsx`
- `pages/training/custom/TrainingPlanList.jsx`
- `pages/training/custom/TrainingPlanCard.jsx`
- `pages/training/custom/PlanExerciseList.jsx`
- `pages/training/custom/PlanExerciseCard.jsx`
- `pages/training/custom/TrainingPlanFormDialog.jsx`
- `pages/training/custom/PlanExerciseDialog.jsx`
- `shared/hooks/useTrainingPlans.js`

Wiederverwendung:

- `TrainingPlanCard` kann in `Trainingsergebnisse` und `HomeDark` zur Plan-Auswahl genutzt werden.
- `PlanExerciseDialog` kann mit dem gemeinsamen `ExercisePickerDialog` arbeiten.

### 7. `TrainingDetail.jsx` in Detail- und Editierbausteine zerlegen

Neue Dateien:

- `pages/training/detail/TrainingDetailPage.jsx`
- `pages/training/detail/TrainingSessionHeader.jsx`
- `pages/training/detail/TrainingResultList.jsx`
- `pages/training/detail/EditTrainingToolbar.jsx`
- `pages/training/detail/DeleteTrainingDialog.jsx`
- `pages/training/detail/AddExerciseToSessionDialog.jsx`

Wiederverwendung:

- `TrainingSessionHeader` und `TrainingResultList` koennen in `Historie.jsx`, `Profil.jsx` und Gruppenstatistiken verwendet werden.

### 8. Gewicht-Feature entkoppeln

Betroffene Dateien: `GewichtTrackingPage.jsx`, `GewichtStatistik.jsx`, `Profil.jsx`, `HomeDark.jsx`.

Neue Dateien:

- `shared/hooks/useWeightData.js`
- `shared/weight/WeightSummaryCards.jsx`
- `shared/weight/WeightEntryDialog.jsx`
- `shared/weight/WeightHistoryTable.jsx`
- `shared/weight/WeightChartSection.jsx`
- `shared/utils/weightCalculations.js`

Wiederverwendung:

- `GewichtTrackingPage` wird zur Verwaltungsseite.
- `GewichtStatistik` wird zur reinen Anzeige-/Chart-Komponente.
- `HomeDark` und `Profil` koennen kompakte Gewichtswidgets importieren.

### 9. Profilseite modularisieren

Betroffene Datei: `Profil.jsx`.

Neue Dateien:

- `pages/user/profile/ProfileHeader.jsx`
- `pages/user/profile/ProfileInfoCard.jsx`
- `pages/user/profile/ProfileEditForm.jsx`
- `pages/user/profile/ProfileStatsSection.jsx`
- `pages/user/profile/ProfileSettingsSection.jsx`
- `pages/user/profile/PasswordChangeDialog.jsx`
- `pages/user/profile/PwaSettingsPanel.jsx`
- `shared/hooks/useProfileData.js`

Wiederverwendung:

- `PasswordChangeDialog` kann auch aus `ResetPassword.jsx` oder Account-Settings genutzt werden.
- `ProfileStatsSection` kann Dashboard-Widgets liefern.

### 10. Gruppen- und Kalenderbereich zerlegen

Betroffene Dateien: `GruppenDetail.jsx`, `GruppenUebersicht.jsx`, `Gruppenkalender.jsx`, `GurppenKalenderWidget.jsx`, `TerminDetailDialog.jsx`, `Kommentare.jsx`.

Neue Dateien:

- `shared/groups/GroupCard.jsx`
- `shared/groups/GroupHeader.jsx`
- `shared/groups/GroupMembersPanel.jsx`
- `shared/groups/GroupStatsPanel.jsx`
- `shared/groups/GroupCalendarWidget.jsx`
- `shared/groups/AppointmentList.jsx`
- `shared/groups/AppointmentDialog.jsx`
- `shared/groups/AppointmentActions.jsx`
- `shared/comments/CommentList.jsx`
- `shared/comments/CommentItem.jsx`
- `shared/comments/CommentComposer.jsx`
- `shared/hooks/useGroupCalendar.js`
- `shared/hooks/useComments.js`

Wiederverwendung:

- `Gruppenkalender.jsx` bleibt ein kleiner Wrapper um `GroupCalendarWidget`.
- `GruppenDetail.jsx` nutzt Tabs/Panels statt alles in einer Datei zu halten.
- `Kommentare.jsx` kann in andere Kommentar-Kontexte uebernommen werden.

### 11. Feedback und Auth vereinheitlichen

Betroffene Dateien: `FeedbackForm.jsx`, `FeedbackFields.jsx`, `FeedbackUebersicht.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `LoginDark.jsx`, `RegisterDark.jsx`.

Neue Dateien:

- `shared/feedback/FeedbackFields.jsx`: aus `pages/features/components/FeedbackFields.jsx` nach `shared` verschieben.
- `shared/feedback/FeedbackCard.jsx`
- `shared/feedback/FeedbackFilterBar.jsx`
- `shared/auth/AuthCard.jsx`
- `shared/auth/PasswordFields.jsx`
- `shared/auth/EmailForm.jsx`
- `pages/user/register/RegisterStepper.jsx`
- `pages/user/register/RegisterAccountStep.jsx`
- `pages/user/register/RegisterPersonalStep.jsx`
- `pages/user/register/RegisterBodyStep.jsx`

Wiederverwendung:

- Alle Auth-Seiten teilen Layout, Passwortfeld mit Sichtbarkeit und Fehleranzeige.
- Feedback-Erstellen und Feedback-Verwalten teilen Typ-Icons, Status-Labels und Felddefinitionen.

## Prioritaet nach Risiko und Nutzen

| Prioritaet | Schritt | Nutzen | Risiko |
| --- | --- | --- | --- |
| 1 | `PageShell` und `useNotificationMessage` konsequent nutzen | Kleine Diffs, sofort weniger Wiederholung | Niedrig |
| 2 | `ExerciseChips`, `ExerciseSetInputs`, `ExerciseHistoryPreview` extrahieren | Entfernt grosse Duplikate in Training | Mittel |
| 3 | `ExercisePickerDialog` und `useExerciseFilters` extrahieren | Neue Trainings-/Uebungsseiten werden einfach | Mittel |
| 4 | `Trainingsergebnisse` Session-Hook | Groesster Wartbarkeitsgewinn | Hoeher |
| 5 | Gewicht-Hook und Weight-Komponenten | Dashboard/Profile reuse | Mittel |
| 6 | Gruppen/Kalender/Kommentare zerlegen | Sehr viel Code wird lesbarer | Hoeher |
| 7 | Auth/Feedback-Komponenten vereinheitlichen | Kleine, stabile Wiederverwendung | Niedrig |

## Import-Beispiele

```jsx
import PageShell from "../../shared/ui/PageShell";
import useNotificationMessage from "../../shared/hooks/useNotificationMessage";
import ExercisePickerDialog from "../../shared/training/ExercisePickerDialog";
import SortableExerciseCard from "../../shared/training/SortableExerciseCard";
```

```jsx
<PageShell title="Training" subtitle="Ergebnisse erfassen" loading={loading}>
  <PlanSelectionSection plans={plans} selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
  <SelectedExercisesList exercises={exercises} results={results} onChange={updateSet} />
  <ExercisePickerDialog open={pickerOpen} exercises={filteredExercises} onSelect={addExercise} />
</PageShell>
```

## JSX-Katalog

### Auth

- `src/components/auth/ProtectedRoute.jsx`: Generischer Route Guard, der `checkAccess` ausfuehrt und bei fehlender Berechtigung navigiert. Wiederverwendbar fuer jede Route mit asynchronem Zugriffstest; sollte langfristig `PageShell`/`LoadingState` und `useNotificationMessage` nutzen.
- `src/components/auth/ProtectedRouteWrappers.jsx`: Spezifische Guards fuer Gruppen, Training, Kommentare und User. Wiederverwendbar direkt in der Routen-Konfiguration; kann spaeter aus einer zentralen Guard-Konfiguration generiert werden.

### Context

- `src/components/context/ApiProtectionContext.jsx`: Provider und Hook gegen schnelle Mehrfachausfuehrung von API-Aktionen. Wiederverwendbar fuer Submit-, Delete-, Accept/Reject- und Toggle-Aktionen.
- `src/components/context/AuthContext.jsx`: Globaler Auth-State mit Nutzer, Loginstatus und Aktualisierung. Wiederverwendbar ueber `useAuth`; Storage-/Notification-Initialisierung kann spaeter in kleinere Helfer.
- `src/components/context/DrawerContext.jsx`: Globaler Drawer-State fuer Navigation. Wiederverwendbar fuer `NavBar`, `NavBarBot` und kuenftige Sidebars.

### Layout

- `src/components/layout/BenachrichtigungenDropdown.jsx`: Dropdown fuer Benachrichtigungen und Gruppeneinladungen. Wiederverwendbar in Navigation oder einer spaeteren Benachrichtigungsuebersicht; kann in Trigger, Liste und Item-Actions zerlegt werden.
- `src/components/layout/HeaderCard.jsx`: Wiederverwendbarer Page-Header mit Titel, Untertitel und Icon. Kann Grundlage fuer `shared/ui/PageHeader.jsx` bleiben.
- `src/components/layout/LoadingNavBarBot.jsx`: Skeleton fuer die untere Navigation. Wiederverwendbar in Ladezustaenden mit Bottom-Bar.
- `src/components/layout/LoadingPage.jsx`: Vollseiten-Loading mit NavBar und Bottom-Skeleton. Wiederverwendbar bei initialem Auth-/Datenloading; spaeter mit `PageShell` zusammenfuehren.
- `src/components/layout/NavBar.jsx`: Hauptnavigation mit Drawer, Auth, Admin-Link und Notifications. Wiederverwendbar als Standard-Appbar; interne Navigationsitems koennen in Konfiguration ausgelagert werden.
- `src/components/layout/NavBarBot.jsx`: Mobile Bottom-Aktionsleiste. Wiederverwendbar fuer Speichern, Zurueck, Hinzufuegen, Menue; spaeter durch `ResponsiveActionBar` kapseln.
- `src/components/layout/RotaryWheel.jsx`: Interaktives Rad-Menue. Wiederverwendbar fuer spielerische Auswahl; Logik fuer Winkel/Rotation kann in Hook ausgelagert werden.

### Admin

- `src/components/pages/admin/AdminPanel.jsx`: Admin-Dashboard fuer Verwaltung, Aktionen und Logs. Aufteilen in `AdminActionCard`, `AdminSection`, `AdminConfirmDialog`, `AdminEntityTable`; wiederverwendbar fuer zukuenftige Admin-Features.
- `src/components/pages/admin/Logs.jsx`: Loganzeige mit API-Laden. Aufteilen in `LogsTable` und `useAdminLogs`; wiederverwendbar als Tab im AdminPanel oder eigene Debug-Seite.

### Basis

- `src/components/pages/basis/HomeDark.jsx`: Eingeloggtes Dashboard mit Training, Gruppen, Gewicht, Highscores und Kalender. Aufteilen in Dashboard-Widgets wie `DashboardActionGrid`, `TrainingOverviewWidget`, `GroupOverviewWidget`, `WeightWidget`; wiederverwendbar fuer Startseite und Profil.
- `src/components/pages/basis/LandingPage.jsx`: Oeffentliche Landingpage mit Navigation, Feature-Sektionen und Device-Showcase. Aufteilen in `LandingNav`, `FeatureGrid`, `DeviceShowcase`, `LandingFooter`; wiederverwendbar fuer Marketing/Onboarding.
- `src/components/pages/basis/OfflinePage.jsx`: Offline-/Netzwerkstatusseite mit Retry. Wiederverwendbar als generische `NetworkErrorPage` oder PWA-Fallback.
- `src/components/pages/basis/Test.jsx`: Test-/Duplikatseite fuer eigene Uebungen, sehr aehnlich zu `UserUebung.jsx`. Sollte nach Extraktion von `UserExerciseForm` und `UserExerciseList` entfernt oder als Entwicklungsseite klar markiert werden.

### Features

- `src/components/pages/features/AllHighscores.jsx`: Vollstaendige Highscore-Seite mit Filtern und Gruppen-/Nutzerkontext. Aufteilen in `HighscoreFilterBar`, `HighscoreTabs`, `HighscoreTable/List`; wiederverwendbar mit `Highscores.jsx`.
- `src/components/pages/features/Einladungen.jsx`: Seite fuer Gruppeneinladungen mit Annahme/Ablehnung. Aufteilen in `InvitationCard`, `InvitationList`, `InvitationActions`; wiederverwendbar im Notification-Dropdown.
- `src/components/pages/features/FeedbackForm.jsx`: Schlanke Feedback-Erstellseite, nutzt bereits `PageShell`, `useNotificationMessage` und `FeedbackFields`. Kann als Muster fuer weitere Page-Refactors dienen.
- `src/components/pages/features/FeedbackUebersicht.jsx`: Feedback-Verwaltung/Uebersicht. Aufteilen in `FeedbackCard`, `FeedbackFilterBar`, `FeedbackStatusChip`, `FeedbackDeleteDialog`; wiederverwendbar fuer Admin-Feedback.
- `src/components/pages/features/ForgotPassword.jsx`: Passwort-vergessen-Seite. Wiederverwendbar ueber `AuthCard` und `EmailForm`; Notification-Logik vereinheitlichen.
- `src/components/pages/features/GewichtTrackingPage.jsx`: Gewichtseintraege, CRUD-Dialoge, Statistik und Verlauf. Aufteilen in `WeightSummaryCards`, `WeightEntryDialog`, `WeightHistoryTable`, `useWeightData`.
- `src/components/pages/features/Highscores.jsx`: Kompakte Highscore-Liste. Wiederverwendbar in `HomeDark`, `AllHighscores`, `GruppenDetail`; sollte display-only bleiben.
- `src/components/pages/features/ResetPassword.jsx`: Passwort-zuruecksetzen-Seite. Wiederverwendbar ueber `AuthCard`, `PasswordFields` und gemeinsame Passwortvalidierung.
- `src/components/pages/features/components/FeedbackFields.jsx`: Wiederverwendbare Feedback-Felder. In `shared/feedback/FeedbackFields.jsx` verschieben, da sie nicht nur zur Page gehoeren.

### Training

- `src/components/pages/training/CustomTrainingsplan.jsx`: Trainingsplan-Verwaltung mit Planliste, Planformular, Uebungsauswahl und DnD. Aufteilen in Planliste, Plan-Karte, Plan-Uebungskarte, Form-Dialoge und `useTrainingPlans`.
- `src/components/pages/training/Historie.jsx`: Trainingshistorie einer Gruppe/eines Nutzers. Aufteilen in `TrainingHistoryList`, `TrainingHistoryCard`, `TrainingHistoryEmptyState`; wiederverwendbar fuer Profil und Gruppen.
- `src/components/pages/training/IndividuellerPlan.jsx`: Freie Trainingssession ohne festen Plan. Aufteilen in Session-Hook, Uebungskarten, Picker und Ergebnisfelder; soll dieselben Bausteine wie `Trainingsergebnisse` nutzen.
- `src/components/pages/training/TrainingDetail.jsx`: Detail- und Editieransicht gespeicherter Trainingssessions. Aufteilen in SessionHeader, ResultAccordion/List, EditToolbar, DeleteDialog, AddExerciseDialog.
- `src/components/pages/training/Trainingsergebnisse.jsx`: Hauptseite zum Erfassen und Speichern von Trainingsergebnissen. Groesster Refactor-Kandidat; in Session-Page, Hooks, PlanSelection, SelectedExercisesList, SaveDialog, TrainingTimer und gemeinsame ExerciseCards zerlegen.
- `src/components/pages/training/Uebungcard.jsx`: Ausgelagerte Uebungskarte/Zwischenversion fuer Dropsaetze. Sollte zu `shared/training/SortableExerciseCard.jsx` oder `ExerciseSessionCard.jsx` werden; vor Nutzung Imports/Export pruefen.

### User

- `src/components/pages/user/GruppenDetail.jsx`: Gruppen-Detailseite mit Tabs, Mitgliedern, Kalender, Stats und Aktionen. Aufteilen in `GroupHeader`, `GroupTabs`, `MembersPanel`, `GroupStatsPanel`, `GroupCalendarPanel`.
- `src/components/pages/user/Gruppenkalender.jsx`: Schlanke Wrapper-Page um das Kalenderwidget. Wiederverwendbar als Beispiel fuer PageShell plus `GroupCalendarWidget`.
- `src/components/pages/user/GruppenUebersicht.jsx`: Gruppenliste, Favoriten, Erstellen/Verlassen/Loeschen. Aufteilen in `GroupCard`, `GroupList`, `CreateGroupDialog`, `LeaveGroupDialog`.
- `src/components/pages/user/LoginDark.jsx`: Login-Seite. Aufteilen in `AuthCard`, `PasswordField`, `LoginForm`; wiederverwendbar mit Register/Reset.
- `src/components/pages/user/Profil.jsx`: Profilseite mit Anzeige, Bearbeitung, Gewicht/Training, PWA-/Accountsettings und Dialogen. Aufteilen in ProfileHeader, ProfileEditForm, ProfileStatsSection, ProfileSettingsSection, PasswordChangeDialog und Hooks.
- `src/components/pages/user/RegisterDark.jsx`: Mehrstufige Registrierung. Aufteilen in `RegisterStepper`, `RegisterAccountStep`, `RegisterPersonalStep`, `RegisterBodyStep`, gemeinsame Auth-Felder.
- `src/components/pages/user/UserUebung.jsx`: Eigene Uebungen verwalten. Aehnlich zu `Test.jsx`; aufteilen in `UserExerciseForm`, `UserExerciseList`, `UserExerciseCard`, `useUserExercises`.

### Shared

- `src/components/shared/GewichtStatistik.jsx`: Gewichtscharts, Fortschritt, Kalorien- und Statistikberechnungen. Aufteilen in Chart-Sektion, Summary-Cards, Berechnungs-Utils und `useWeightData`.
- `src/components/shared/GurppenKalenderWidget.jsx`: Gruppen-Kalenderwidget mit Termin-CRUD, Liste, Dialogen und Teilnahme. Umbenennung zu `GruppenKalenderWidget.jsx` oder `GroupCalendarWidget.jsx` empfohlen; aufteilen in Kalender, Terminliste, Terminformular, Hook.
- `src/components/shared/Kommentare.jsx`: Kommentaransicht mit Composer, Liste und Socket-Updates. Aufteilen in `CommentComposer`, `CommentList`, `CommentItem`, `useComments`; wiederverwendbar fuer andere Kommentarbereiche.
- `src/components/shared/ui/PageShell.jsx`: Gemeinsame Page-Huelle mit Theme, NavBar, Container, Header, BackButton und Bottom-Bar. Wiederverwendbar als Standard fuer fast alle Pages.

### Util

- `src/components/util/CustomCardHeader.jsx`: Kleine Card-Huelle fuer Header-/Content-Bereiche. Sollte in `shared/ui/SectionCard.jsx` aufgehen oder durch `HeaderCard` ersetzt werden.
- `src/components/util/buttons/BackButton.jsx`: Zurueck-Button mit optionalem Callback. Wiederverwendbar in Detail-, Formular- und Fehlerseiten; kann Varianten fuer Icon-only/Full-width bekommen.
- `src/components/util/buttons/TipsButton.jsx`: Aktuell auskommentierter Floating-Tipps-Button. Bei Reaktivierung in `FloatingTipsButton`, `TipsMenu`, `TipsToggle` zerlegen.
- `src/components/util/Dialogs/HistoryDialog.jsx`: Dialog fuer Uebungshistorie. Wiederverwendbar aus Trainingskarten und TrainingDetail; interne Session-/Satz-Zeilen koennen extrahiert werden.
- `src/components/util/Dialogs/TerminDetailDialog.jsx`: Termin-Detaildialog mit Teilnahme, Bearbeiten, Loeschen und Kommentar-Navigation. Aufteilen in `AppointmentMeta`, `ParticipantStatus`, `AppointmentActions`.
- `src/components/util/notifications/Notification.jsx`: Zentrale Snackbar/Alert-Komponente. Behalten und zusammen mit `useNotificationMessage` nutzen.

## Kontrollliste fuer zukuenftige Refactors

- Vor jeder Extraktion pruefen, ob die Komponente API-Logik enthaelt. UI zuerst extrahieren, API spaeter in Hook.
- Props klein und fachlich benennen: `exercise`, `results`, `onChangeSet`, `onDelete`, `isEditing`.
- DnD-IDs vereinheitlichen: `uiId` fuer lokale UI-Listen, Backend-IDs separat behalten.
- Gemeinsame Komponenten nicht mit Page-spezifischer Navigation koppeln.
- Nach jedem Refactor mindestens `npm run typecheck` ausfuehren.
- Bei grossen Page-Refactors erst eine Page migrieren, dann die zweite auf dieselben Bausteine setzen.
