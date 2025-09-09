const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
const { spawn } = require("child_process");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // Dev mode: start Next.js server automatically
    const nextProcess = spawn("npm", ["run", "dev:web"], { shell: true });

    nextProcess.stdout.on("data", (data) => {
      console.log(`Next.js: ${data}`);
    });

    nextProcess.stderr.on("data", (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    // Wait for server to start
    setTimeout(() => {
      win.loadURL("http://localhost:3000");
      win.webContents.openDevTools(); // DevTools only in dev
    }, 5000);
  } else {
    // Production: load static export
    const indexPath = path.join(__dirname, "out", "index.html");
    console.log("Loading production file:", indexPath);
    win.loadFile(indexPath);
  }
}

// IPC listener for auto-updater
ipcMain.on("install-update", () => {
  autoUpdater.quitAndInstall();
});

// Auto update events
function initAutoUpdates() {
  if (isDev) return; // Only production

  autoUpdater.on("checking-for-update", () =>
    win.webContents.send("update-message", { status: "checking" })
  );

  autoUpdater.on("update-available", (info) =>
    win.webContents.send("update-message", { status: "available", info })
  );

  autoUpdater.on("update-not-available", () =>
    win.webContents.send("update-message", { status: "no-update" })
  );

  autoUpdater.on("error", (err) =>
    win.webContents.send("update-message", { status: "error", error: err })
  );

  autoUpdater.on("download-progress", (progress) =>
    win.webContents.send("update-message", { status: "progress", progress })
  );

  autoUpdater.on("update-downloaded", () =>
    win.webContents.send("update-message", { status: "downloaded" })
  );

  autoUpdater.checkForUpdatesAndNotify();
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  initAutoUpdates();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

