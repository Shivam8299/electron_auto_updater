// main.js
const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // use a preload script if you need secure IPC
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:3000'); // Next dev server
  } else {
    // when packaged, load the static export files
    // note: you might copy out/ into resources/app/out during packaging
    win.loadFile(path.join(process.resourcesPath, 'out', 'index.html'));
  }

  // Optional: open devtools in dev
  if (isDev) win.webContents.openDevTools();
}

// Auto update: only activate in production (packaged)
function initAutoUpdates(win) {
  if (isDev) return;

  autoUpdater.on('checking-for-update', () => { console.log('Checking for update...'); });
  autoUpdater.on('update-available', info => {
    console.log('Update available', info);
    // you can notify renderer via IPC too
  });
  autoUpdater.on('update-not-available', () => console.log('No updates'));
  autoUpdater.on('error', err => console.error('Update error', err));
  autoUpdater.on('download-progress', progress => {
    console.log(`Download speed: ${progress.bytesPerSecond} - ${progress.percent}%`);
  });
  autoUpdater.on('update-downloaded', () => {
    // prompt user to install now:
    const result = dialog.showMessageBoxSync(win, {
      type: 'question',
      buttons: ['Restart and install', 'Later'],
      defaultId: 0,
      message: 'Update downloaded. Restart now to install?'
    });
    if (result === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  // start checking (you can use checkForUpdatesAndNotify for simple notifications)
  autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(() => {
  const win = createWindow();
  initAutoUpdates(win);
});
