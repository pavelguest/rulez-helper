const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { readdir, statSync, unlink, unlinkSync } = require("fs");
const path = require("path");
const sharp = require("sharp");
const Store = require("electron-store");

sharp.cache(false);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const store = new Store();

ipcMain.on("choose-folder", async (event, data) => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  store.set("filesPath", result.filePaths[0]);
  console.log(result.filePaths[0]);
});

ipcMain.on("remove-files", async (event, data) => {
  const dirPath = store.get("filesPath");
  await readdir(dirPath, (err, files) => {
    files.forEach(async (e, i) => {
      const currentPathFile = `${dirPath}/${e}`;
      unlinkSync(currentPathFile);
    });
  });
});

ipcMain.on("submit-photo", async (event, data) => {
  const dirPath = store.get("filesPath");
  await readdir(dirPath, (err, files) => {
    const sorted = files.sort((a, b) => {
      const aStat = statSync(`${dirPath}/${a}`);
      const bStat = statSync(`${dirPath}/${b}`);

      return (
        new Date(aStat.birthtime).getTime() -
        new Date(bStat.birthtime).getTime()
      );
    });

    sorted.forEach(async (e, i) => {
      const currentPathFile = `${dirPath}/${e}`;
      const featurePathFile = `${dirPath}/${data}-${i + 1}.jpg`;

      await sharp(currentPathFile)
        .rotate()
        .resize(500, 500, { fit: "inside" })
        .toFormat("png")
        .toFile(featurePathFile, () => unlinkSync(currentPathFile));
    });
  });
});
