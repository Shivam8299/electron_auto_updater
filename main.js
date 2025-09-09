// // main.js
// const { app, BrowserWindow } = require("electron");
// const path = require("path");
// const isDev = require("electron-is-dev");
// const { createServer } = require("next-electron-server");

// let win;

// async function createWindow() {
//   // Create browser window
//   win = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });

//   if (isDev) {
//     // Dev mode: connect to Next.js dev server
//     await win.loadURL("http://localhost:3000");
//     win.webContents.openDevTools();
//   } else {
//     // Production: serve Next.js using next-electron-server
//     const handler = await createServer({
//       dir: __dirname,
//       dev: false,
//       protocol: "app", // custom protocol for packaged app
//     });

//     win.loadURL("app://-");
//   }
// }

// app.whenReady().then(createWindow);

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });

// app.on("activate", () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow();
// });

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");

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
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    win.loadURL("http://localhost:3000");
  }
}

// IPC listener for renderer request
ipcMain.on("install-update", () => {
  autoUpdater.quitAndInstall();
});

// Auto update events
function initAutoUpdates() {
  if (isDev) return;

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

app.whenReady().then(() => {
  createWindow();
  initAutoUpdates();
});
