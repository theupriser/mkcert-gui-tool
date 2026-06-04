# Mkcert GUI Tool 🔐

Een moderne, cross-platform desktop applicatie (GUI) gebouwd met Electron om eenvoudig lokale SSL-certificaten te genereren, te beheren en dagelijks automatisch te vernieuwen via `mkcert`. Werkt naadloos op **Ubuntu/Linux, Windows en macOS**.

---

## ✨ Functionaliteiten

- **Visuele interface**: Voeg eenvoudig domeinen toe (gescheiden door komma's) en kies visueel de opslagmap via de ingebouwde mappenkiezer.
- **Onthoudt instellingen**: De laatst gebruikte domeinen en maplocatie worden automatisch permanent onthouden.
- **Systeem Status-check**: Controleert bij het opstarten automatisch of `mkcert` op je computer staat en of de Root CA vertrouwd is.
- **Geautomatiseerde Planning (OS Scheduler)**: Vink de checkbox aan om certificaten elke nacht om 00:00 uur automatisch op de achtergrond te vernieuwen (via `crontab` op Linux/macOS en *Windows Taakplanner* op Windows).
- **Minimalistisch design**: Een strak venster zonder menu-bars, geoptimaliseerd voor Linux (X11/Wayland support ingebouwd).

---

## 📋 Vereisten

De applicatie maakt gebruik van `mkcert` op je lokale machine. Zorg ervoor dat deze in je systeem-pad (`PATH`) staat:

- **Ubuntu/Linux**: `sudo apt install mkcert`
- **macOS**: `brew install mkcert`
- **Windows**: `choco install mkcert` of `scoop install mkcert`

---

## 🚀 Lokale Ontwikkeling (Dev)

Volg deze stappen om het project lokaal op te starten in ontwikkelmodus:

1. **Clone of navigeer naar de projectmap**:
   ```bash
   cd mkcert-gui-tool
   ```

2. **Installeer de dependencies**:
   ```bash
   npm install
   ```

3. **Start de applicatie**:
   ```bash
   npm start
   ```

### Handmatig de Achtergrond Worker testen:
Wil je testen of de automatische planner (zonder GUI) goed werkt? Draai dan de app met de `--worker` vlag:
```bash
npx electron . --worker
```

---

## 📦 Productie Binary Bouwen (Build)

Je kunt de applicatie compileren naar een kant-en-klaar installatiebestand (zoals een `.deb` voor Ubuntu of een `.exe` voor Windows) met **Electron Forge**.

Voer het volgende commando uit in je terminal:
```bash
npm run make
```

### Waar vind ik de installatiebestanden?
Na het bouwen vind je de distributiebestanden in de map:
`out/make/`

- **Ubuntu/Linux**: Levert een `.deb` bestand op (te vinden in `out/make/deb/x64/`). Installeer deze via:
  ```bash
  sudo dpkg -i out/make/deb/x64/mkcert-gui-tool_*.deb
  ```
  *Na installatie is de app direct vindbaar in je Ubuntu Applicatiemenu (Application Launcher).*

- **Windows**: Levert een `.exe` installer op (`out/make/squirrel.windows/x64/`).
- **macOS**: Levert een `.app` of `.dmg` op (moet worden uitgevoerd op een Mac).

---

## 🛠️ Project Structuur

- `main.js`: De Electron-backend. Regelt de interactie met het OS (`mkcert` executie, Crontab / Windows Task Scheduler logica en de achtergrond `--worker` modus).
- `preload.cjs`: De beveiligde IPC-bridge tussen de web-frontend en Node.js.
- `index.html`: De grafische interface (HTML/CSS/JS) met automatische status-banners en state-opslag.
- `forge.config.cjs`: De build-configuratie van de applicatie, inclusief Linux-desktop integratie.
- `package.json`: Bevat project-metadata en de benodigde scripts.

---

## 📄 Licentie

Dit project is gelicentieerd onder de **MIT** licentie - zie het `package.json` bestand voor details.
