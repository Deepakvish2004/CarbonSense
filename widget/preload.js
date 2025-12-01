const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ Preload script loaded in renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  onSystemData: (callback) =>
    ipcRenderer.on("system-data", (_, data) => {
      console.log("📨 Received:", data);
      callback(data);
    }),

  closeWindow: () => ipcRenderer.send("close-widget"),

  minimizeWindow: () => ipcRenderer.send("minimize-widget")   // ⭐ NEW
});
