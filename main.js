const electron = require('electron')
const ipc = electron.ipcMain
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const http = require('http')

let mainWindow

function createWindow () {
  http.createServer( (req, res) => {
	  console.log(req)
  } ).listen(8000)

  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'client/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
