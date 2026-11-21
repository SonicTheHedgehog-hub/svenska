// Erzeugt natürliche Audiodateien (Azure Neural TTS) für alle Sätze und Wörter in lessons.json.
// Läuft als GitHub Action. Braucht die Secrets AZURE_SPEECH_KEY und AZURE_SPEECH_REGION.
// Bereits erzeugte Dateien werden übersprungen, daher wird jeder Satz nur einmal berechnet.
import fs from "node:fs";
import crypto from "node:crypto";

const KEY = process.env.AZURE_SPEECH_KEY, REGION = process.env.AZURE_SPEECH_REGION;
if (!KEY || !REGION) { console.log("Kein AZURE_SPEECH_KEY/AZURE_SPEECH_REGION gesetzt, nichts zu tun."); process.exit(0); }

const D = JSON.parse(fs.readFileSync("lessons.json", "utf8"));
const V = D.voices, def = V.default;
const normWord = w => w.replace(/[!?.,…]/g, "").trim();
const lineText = l => l.t.map(p => p[0]).join(" ");

const items = new Map(); // "voice|text" -> {voice, text}
const add = (voice, text) => { text = text.trim(); if (text) items.set(voice + "|" + text, {voice, text}); };
for (const l of D.lessons) {
  for (const ln of l.lines) {
    add(V.speakers[ln.who] || def, lineText(ln));
    for (const p of ln.t) add(def, normWord(p[0]));
  }
  for (const c of l.chunks) add(def, c[0]);
}

const idxPath = "audio/index.json";
fs.mkdirSync("audio", {recursive: true});
const index = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, "utf8")) : {};
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sleep = ms => new Promise(r => setTimeout(r, ms));
let made = 0, chars = 0;

for (const [key, {voice, text}] of items) {
  const file = crypto.createHash("sha1").update(key).digest("hex").slice(0, 14) + ".mp3";
  if (index[key] === file && fs.existsSync("audio/" + file)) continue;
  const ssml = `<speak version="1.0" xml:lang="sv-SE"><voice name="${voice}">${esc(text)}</voice></speak>`;
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {"Ocp-Apim-Subscription-Key": KEY, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "svenska-app"},
      body: ssml
    });
    if (r.ok) { fs.writeFileSync("audio/" + file, Buffer.from(await r.arrayBuffer())); break; }
    if ((r.status === 429 || r.status >= 500) && attempt < 6) { await sleep(3000 * (attempt + 1)); continue; }
    console.error("Fehler", r.status, await r.text(), "bei", key);
    fs.writeFileSync(idxPath, JSON.stringify(index, null, 0));
    process.exit(1);
  }
  index[key] = file; made++; chars += text.length;
  await sleep(400);
}
// Einträge entfernen, die es in lessons.json nicht mehr gibt
for (const k of Object.keys(index)) if (!items.has(k)) delete index[k];
fs.writeFileSync(idxPath, JSON.stringify(index, null, 0));
console.log(`Neu erzeugt: ${made} Dateien, ${chars} Zeichen. Gesamt: ${Object.keys(index).length}.`);
