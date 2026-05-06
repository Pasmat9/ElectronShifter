//rozjede electron

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    preload: path.join(__dirname, 'src/preload.js'), 
    contextIsolation: true,
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// stará se o zapisování do JSON souboru
ipcMain.on('ulozData', (event, data) => {
    console.log(data);
     const filePath = dialog.showSaveDialogSync({
    title: 'Uložit rozpis směn',
    filters: [{ name: 'JSON soubory', extensions: ['json'] }]
  });

  if (filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
    console.log("data ulozena")
  }
);

//stará se o načítání z JSON souboru
ipcMain.handle('nacistData', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON soubory', extensions: ['json'] }]
  });

  if (!canceled) {
    const data = fs.readFileSync(filePaths[0], 'utf8');
    return JSON.parse(data);
  }
  return null;
});