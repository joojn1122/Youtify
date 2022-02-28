const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const ipc = require('electron').ipcRenderer

var mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    fullscreenable:false,
    minWidth:800,
    minHeight: 600,
    webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
    },
    icon: __dirname + '\\images\\icon.png',
    show:false

  })

  mainWindow.loadFile('index.html')
  mainWindow.on('close', (e) => {
    e.sender.send("save")
  })
}


app.whenReady().then(() => {
  createWindow()
  

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
    
  })
})


ipcMain.on('close', () => {
  app.quit()
})


ipcMain.on('min', () => {
  mainWindow.minimize()
})


ipcMain.on('max', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
})


