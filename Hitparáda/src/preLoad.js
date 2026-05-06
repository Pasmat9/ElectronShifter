//Soubor který přeposílá data k uložení mezi main a render scriptem

const { contextBridge, ipcMain, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("Bridge", {
    ulozData: (data) => ipcRenderer.send("ulozData", data),
    nacistData: () => ipcRenderer.invoke("nacistData")
});