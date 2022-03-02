/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const electronLocalShortcut = require('electron-localshortcut');
const iconPath = path.join(__dirname, 'apps/bame/src/assets/img', 'bosch-ic-product-aspect-model-editor.png');
if (require('electron-squirrel-startup')) return;

Menu.setApplicationMenu(null);

let win;
const createWindow = () => {
  win = new BrowserWindow({
    show: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  if (process.argv.includes('--dev')) {
    win.loadURL('http://localhost:4200/');
  } else {
    win.loadFile('./dist/apps/bame/index.html');
  }

  win.maximize();
  win.show();
  win.removeMenu();
  win.on('closed', () => {
    win = null;
  });
  electronLocalShortcut.register(win, 'CommandOrControl+F12', () => {
    win.webContents.openDevTools();
  });

  win.webContents.on('new-window', (evt, url, frameName, disposition, options) => {
    options.width = 1280;
    options.height = 720;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
