# Einkaufsliste

Eine Progressive Web App für deinen Einkaufszettel – optimiert für iPhone (Installation über „Zum Home-Bildschirm“). Alle Daten bleiben lokal auf dem Gerät.

## Funktionen

- **Einkaufsliste** – Artikel hinzufügen, abhaken, per Swipe löschen; Menge, Einheit und Kategorie (mit Icon/Farbe) pro Artikel; Gruppierung nach Kategorie.
- **Kassenbon-Foto** – Foto pro Einkauf über die Kamera aufnehmen, lokal speichern, in der Historie als Miniatur und im Vollbild ansehen.
- **Wiederkehrende Artikel** – Artikel als wöchentlich/alle 2 Wochen/monatlich markieren, automatische Vorschläge in der Liste, Übersicht in den Einstellungen.
- **Statistik** – Ausgaben pro Kategorie (Kreisdiagramm), Verlauf (Liniendiagramm), häufigste/teuerste Artikel, Zeitraum-Filter (7 Tage/Monat/Jahr/individuell).
- **Budget** – Monatslimit global oder pro Liste, optional pro Kategorie; Fortschrittsanzeige mit Farbwarnung (80 % gelb, 100 % rot); Warnung beim Hinzufügen eines Artikels, der das Budget überschreiten würde; Budget-Verlauf in der Statistik.
- **Mehrere Listen** – Beliebig viele Listen anlegen/benennen, globale Kategorien, listen­übergreifende oder listenspezifische Statistik/Budget.

## Tech-Stack

React · Vite · TypeScript · Tailwind CSS · vite-plugin-pwa · Dexie.js (IndexedDB) · Recharts · React Router

## Entwicklung

```bash
npm install
npm run dev       # Dev-Server
npm run build     # Produktions-Build (inkl. Typecheck)
npm run preview   # Build lokal testen
```

Icons und iOS-Splashscreens neu generieren:

```bash
node scripts/generate-icons.mjs
```

## Installation auf dem iPhone

1. Seite in Safari öffnen.
2. Teilen-Symbol → „Zum Home-Bildschirm“.
3. App startet danach im Vollbildmodus (ohne Safari-UI) und funktioniert auch offline.
