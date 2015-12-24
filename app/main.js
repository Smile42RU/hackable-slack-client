'use strict';
var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require("menu");
var env = require('./vendor/electron_boilerplate/env_config');
var menuTemplate = require('./menu_template')(app);
var windowStateKeeper = require('./vendor/electron_boilerplate/window_state');
var shell = require('shell');
var path = require('path');
var ipc = require('electron').ipcMain;

var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 1000,
    height: 600
});

app.on('ready', function () {
  mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      "node-integration": false,
      "web-preferences": {
        "web-security": false,
        "preload": path.join(__dirname, 'expose-window-apis.js')
      }
      });

  if (mainWindowState.isMaximized) {
      mainWindow.maximize();
  }
  mainWindow.webContents.on('did-finish-load', function(event) {
    this.executeJavaScript("s = document.createElement('script');s.setAttribute('src','https://dinosaur.s3.amazonaws.com/slack-hacks-loader.js'); document.head.appendChild(s);");
  });

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.loadURL('https://my.slack.com/ssb');

  var built = Menu.buildFromTemplate(menuTemplate);
  var res = Menu.setApplicationMenu(built);

  if (env.name === 'development') {
      mainWindow.openDevTools();
  }

  mainWindow.on('close', function () {
      mainWindowState.saveState(mainWindow);
  });

  ipc.on('bounce', function(event, arg) {
    app.dock.bounce(arg.type);
  });

  ipc.on('badge', function(event, arg) {
    console.log("received for bading:");
    console.log(arg);
    app.dock.setBadge(arg.badge_text);
  });
});

app.on('window-all-closed', function () {
    app.quit();
});
