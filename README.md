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

## Stimmen

Die Audiodateien in `audio/` erzeugt die GitHub Action **Stimmen erzeugen** automatisch, sobald sich `lessons.json` ändert.

- Ohne weitere Einrichtung: **Piper** (Open Source, kostenlos, ohne Konto). Stimmen: `sv_SE-alma-medium` von yeagersthlm (CC BY 4.0) und `sv_SE-nst-medium` aus rhasspy/piper-voices (NST-Datensatz).
- Optional: **Azure Neural** (Tarif Free F0). Dafür die Repository-Secrets `AZURE_SPEECH_KEY` und `AZURE_SPEECH_REGION` anlegen und die Action einmal von Hand starten. Azure ersetzt dann die Piper-Dateien.
