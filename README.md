# Mkcert GUI Tool 🔐

A modern, cross-platform desktop application (GUI) built with Electron to easily generate, manage, and automatically renew local SSL certificates daily using `mkcert`. Runs seamlessly on **Ubuntu/Linux, Windows, and macOS**.

---

## ✨ Features

- **Visual Interface**: Simply append domains (comma-separated) and visually target output directories via a native file browsing dialog.
- **Persistent State**: Automatically preserves domains and directory history across instances.
- **Environment Status Banner**: Verifies both `mkcert` binaries and local Root CA configurations automatically on boot.
- **Automated Scheduling (OS Scheduler)**: A checkbox configuration to deploy unattended background certificate renewals daily at 00:00 (via `crontab` on Linux/macOS and *Task Scheduler* on Windows).
- **Minimalist Architecture**: Clean system interfaces stripped of redundant top frame menus, fully optimized for modern display managers (X11/Wayland support included).

---

<!-- ## 📋 Requirements

The tool wraps your operating system's global `mkcert` environment. Ensure it is accessible in your system `PATH`:

- **Ubuntu/Linux**: `sudo apt install mkcert`
- **macOS**: `brew install mkcert`
- **Windows**: `choco install mkcert` or `scoop install mkcert`

--- -->

## 🚀 Local Development

Follow these operations to initiate local development:

1. **Navigate to the target directory**:
   ```bash
   cd mkcert-gui-tool
   ```

2. **Deploy dependencies**:
   ```bash
   npm install
   ```

3. **Boot the client**:
   ```bash
   npm start
   ```

### Manually invoking Background Worker tasks:
To evaluate headless execution scripts without waiting for scheduler bounds, manually call the application worker route via:
```bash
npx electron . --worker
```

---

## 📦 Production Builds

Compile production installers (such as `.deb` or `.rpm` for Linux, `.exe` for Windows) via **Electron Forge**.

Execute the compilation sequence:
```bash
npm run make
```

### Destination Paths
Once compiled, standard distribution modules are stored under:
`out/make/`

- **Ubuntu/Linux**: Output builds are created inside `out/make/deb/x64/`. Deploy via package managers:
  ```bash
  sudo dpkg -i out/make/deb/x64/mkcert-gui-tool_*.deb
  ```
- **Windows**: Distribution executables compile to `out/make/squirrel.windows/x64/`.
- **macOS**: Native DMG formats populate within structural workspace targets.

---

## 🛠️ Repository Mapping

- `main.js`: Core system orchestration layer (handles automated shell processes, tasks setups, and worker pipelines).
- `preload.cjs`: Isolated secure context proxy between UI frontends and local environments.
- `index.html`: The layout application surface rendering operational analytics logs and triggers.
- `forge.config.cjs`: Compilation manifest handling target distributions.
- `package.json`: Application schema index cataloging scripts and packages.
