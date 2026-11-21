# Svenska

Schwedisch lernen für Janina, von null bis B2, nach der Birkenbihl-Methode (Dekodieren, aktives und passives Hören, Anwenden) mit FSRS-Wiederholung.

Eine installierbare Web-App (PWA) ohne Server: einfach `index.html` öffnen.
Auf dem iPhone in Safari öffnen › Teilen › **Zum Home-Bildschirm**.

## Aufbau

- `index.html`: die ganze App (Oberfläche, Lernlogik, FSRS)
- `lessons.json`: Kapitel und Lektionen (Dialoge mit Wort-für-Wort-Dekodierung, Sätze für die Wiederholung, Grammatik, Aussprache-Tipps)
- `img/`: Dalapferd, Icons, Abzeichen, Kapitelbilder
- `sw.js`: Offline-Speicher. **Bei jeder Änderung `VERSION` erhöhen**, sonst sieht das iPhone die alte Fassung.
- `manifest.webmanifest`: Name, Icon und Farben der App

Der Fortschritt liegt im Browser (localStorage). In den Einstellungen gibt es Sicherung herunterladen und laden.
