const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { createServer } = require("next-electron-server");

async function createWindow() {
  // Next.js ko Electron ke andar run karne ke liye
  await createServer({
    dir: path.join(__dirname), // apne Next.js app ka path
    dev: isDev,
  });

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // load Next.js app via scheme
  win.loadURL("app://-");

  if (isDev) win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
