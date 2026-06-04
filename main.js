import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

// Maak __dirname handmatig aan voor ES Modules zodat we relatief aan de app-broncode kunnen zoeken
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schakel hardwareversnelling uit voor stabiliteit op Linux
app.disableHardwareAcceleration();

// Vlaggen voor Linux GUI support (alleen toevoegen als we niet als worker draaien)
if (!process.argv.includes('--worker')) {
  process.argv.push('--no-sandbox', '--enable-features=UseOzonePlatform', '--ozone-platform=x11');
}

// ==========================================
// 1. DE ACHTERGROND WORKER LOGICA
// ==========================================
function runBackgroundWorker() {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  if (!fs.existsSync(configPath)) app.quit();

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const domainsString = config.domains;
    let targetDir = config.directory || path.join(os.homedir(), '.local', 'share', 'mkcert-certs');

    if (Array.isArray(targetDir)) {
      targetDir = targetDir[0];
    }

    if (!domainsString) app.quit();
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const domainsArray = domainsString.split(',').map(d => `"${d.trim()}"`).filter(d => d !== '""').join(' ');
    const certFile = path.join(targetDir, 'local.pem');
    const keyFile = path.join(targetDir, 'local-key.pem');
    
    execSync(`mkcert -cert-file "${certFile}" -key-file "${keyFile}" ${domainsArray}`);
  } catch (e) {
    fs.writeFileSync(path.join(app.getPath('userData'), 'error.log'), e.message);
  }
  app.quit();
}

// Controleer direct bij opstarten of de app als achtergrondtaak draait
if (process.argv.includes('--worker')) {
  app.whenReady().then(runBackgroundWorker);
} else {
  app.whenReady().then(() => {
    // Verbergt de menubalk ook op macOS
    if (process.platform === 'darwin') {
      Menu.setApplicationMenu(Menu.buildFromTemplate([]));
    }
    createWindow();
  });
}

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  
  // VERWIDERT DE MENUBALK (File, Edit, View, enz.) op Windows en Linux
  mainWindow.setMenu(null);
  
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function getConfigPath() {
  return path.join(app.getPath('userData'), 'config.json');
}

// ==========================================
// 2. AUTOMATISCHE PLANNER PER OS (DEV & PROD)
// ==========================================
function toggleScheduler(enable) {
  const isWindows = process.platform === 'win32';
  const taskName = 'MkcertAutoRenewalTask';
  
  const appExecutable = process.execPath;
  const isDev = appExecutable.includes('electron');
  
  const workerCommand = isDev 
    ? `"${appExecutable}" "${__dirname}" --worker` 
    : `"${appExecutable}" --worker`;

  if (isWindows) {
    try {
      try { execSync(`schtasks /delete /tn "${taskName}" /f`, { stdio: 'ignore' }); } catch(e){}
      if (enable) {
        const cmd = `schtasks /create /tn "${taskName}" /tr "${workerCommand.replace(/"/g, '\\"')}" /sc daily /st 00:00 /f`;
        execSync(cmd);
      }
    } catch (err) { console.error('Windows Task Scheduler fout:', err.message); }
  } else {
    try {
      let currentCrontab = '';
      try { currentCrontab = execSync('crontab -l', { encoding: 'utf-8' }); } catch (e) {}

      let lines = currentCrontab.split('\n').filter(line => !line.includes('mkcert-gui-tool') && line.trim() !== '');

      if (enable) {
        const cronLine = `0 0 * * * ${workerCommand} # mkcert-gui-tool`;
        lines.push(cronLine);
      }

      const newCrontab = lines.join('\n') + '\n';
      fs.writeFileSync(path.join(os.tmpdir(), 'cron_tmp'), newCrontab);
      execSync('crontab ' + path.join(os.tmpdir(), 'cron_tmp'));
    } catch (err) { console.error('Crontab fout:', err.message); }
  }
}

// ==========================================
// IPC HANDLERS
// ==========================================
ipcMain.handle('load-settings', async () => {
  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) {
    try { return JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch (e) {}
  }
  return null;
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    fs.writeFileSync(getConfigPath(), JSON.stringify(settings, null, 2), 'utf-8');
    toggleScheduler(settings.autoSchedule);
    return { success: true };
  } catch (error) { return { success: false, message: error.message }; }
});

ipcMain.handle('check-root-ca', async () => {
  try {
    const isWindows = process.platform === 'win32';
    const checkCommand = isWindows ? 'where mkcert' : 'which mkcert';
    try { execSync(checkCommand, { stdio: 'ignore' }); } catch (e) {
      return { installed: false, missingBinary: true, error: '❌ mkcert is niet gevonden!' };
    }
    const caRootPath = execSync('mkcert -CAROOT', { encoding: 'utf-8' }).trim();
    if (fs.existsSync(path.join(caRootPath, 'rootCA.pem'))) return { installed: true, path: caRootPath };
    return { installed: false, missingBinary: false };
  } catch (error) { return { installed: false, missingBinary: false, error: 'Fout bij statuscontrole.' }; }
});

ipcMain.handle('install-root-ca', async () => {
  try { return { success: true, message: execSync('mkcert -install', { encoding: 'utf-8' }) }; } catch (error) { return { success: false, message: error.message }; }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { 
    title: 'Selecteer Certificaten Map',
    properties: ['openDirectory', 'createDirectory', 'noResolveAliases'], 
    defaultPath: os.homedir(),
    buttonLabel: 'Kies Map'
  });
  return result.canceled ? null : result.filePaths;
});

ipcMain.handle('generate-certs', async (event, { domainsString, targetDir }) => {
  try {
    let finalDir = targetDir;
    if (Array.isArray(finalDir)) {
      finalDir = finalDir[0];
    }
    
    finalDir = finalDir || path.join(os.homedir(), '.local', 'share', 'mkcert-certs');

    if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
    const domainsArray = domainsString.split(',').map(d => `"${d.trim()}"`).filter(d => d !== '""').join(' ');
    if (!domainsArray) return { success: false, message: 'Geen geldige domeinen ingevoerd.' };
    
    const certFile = path.join(finalDir, 'local.pem');
    const keyFile = path.join(finalDir, 'local-key.pem');
    execSync(`mkcert -cert-file "${certFile}" -key-file "${keyFile}" ${domainsArray}`);
    return { success: true, message: `Certificaten opgeslagen in:\n${finalDir}` };
  } catch (error) { return { success: false, message: error.message }; }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
