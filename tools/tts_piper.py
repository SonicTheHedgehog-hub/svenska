"""Erzeugt Audiodateien mit Piper (frei, ohne Konto) für alle Sätze und Wörter in lessons.json.

Läuft als GitHub Action, wenn kein Azure-Schlüssel hinterlegt ist.
Stimmen: sv_SE-alma-medium (weiblich, CC BY 4.0, yeagersthlm) und sv_SE-nst-medium (rhasspy/NST).
Die Stimmen-Namen in lessons.json (Sofie, Hillevi, Mattias) sind nur Rollen; hier werden sie auf Piper-Stimmen abgebildet.
"""
import hashlib, json, os, re, subprocess, sys, tempfile, wave
from piper import PiperVoice
from piper.config import SynthesisConfig

VDIR = sys.argv[1] if len(sys.argv) > 1 else "voices"
D = json.load(open("lessons.json", encoding="utf-8"))
V = D["voices"]; default = V["default"]

def load(name):
    p = os.path.join(VDIR, name + ".onnx")
    return PiperVoice.load(p) if os.path.exists(p) else None

nst = load("sv_SE-nst-medium")
alma = load("sv_SE-alma-medium") or nst
if not nst: sys.exit("Keine Piper-Stimme gefunden.")
# Rolle -> (Stimme, Sprechtempo: >1 = langsamer)
ROLES = {
    "sv-SE-SofieNeural": (alma, SynthesisConfig(length_scale=1.08)),
    "sv-SE-HilleviNeural": (alma, SynthesisConfig(length_scale=1.0, noise_scale=0.75)),
    "sv-SE-MattiasNeural": (nst, SynthesisConfig(length_scale=1.05)),
}

norm_word = lambda w: re.sub(r"[!?.,…]", "", w).strip()
line_text = lambda ln: " ".join(p[0] for p in ln["t"])
items = {}
def add(voice, text):
    text = text.strip()
    if text: items[voice + "|" + text] = (voice, text)
for l in D["lessons"]:
    for ln in l["lines"]:
        add(V["speakers"].get(ln["who"], default), line_text(ln))
        for p in ln["t"]: add(default, norm_word(p[0]))
    for c in l["chunks"]: add(default, c[0])

os.makedirs("audio", exist_ok=True)
idx_path = "audio/index.json"
index = json.load(open(idx_path, encoding="utf-8")) if os.path.exists(idx_path) else {}
made = 0
for key, (voice, text) in items.items():
    if key in index and os.path.exists("audio/" + index[key]): continue  # vorhandene (auch Azure) behalten
    f = "p" + hashlib.sha1(("piper|" + key).encode()).hexdigest()[:13] + ".mp3"
    pv, cfg = ROLES.get(voice, ROLES["sv-SE-SofieNeural"])
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        with wave.open(tmp.name, "wb") as w: pv.synthesize_wav(text, w, syn_config=cfg)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-ar", "24000", "-b:a", "48k", "audio/" + f], check=True)
    index[key] = f; made += 1
for k in list(index):
    if k not in items:
        try: os.remove("audio/" + index[k])
        except OSError: pass
        del index[k]
json.dump(index, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"Piper: {made} neue Dateien, gesamt {len(index)}.")
