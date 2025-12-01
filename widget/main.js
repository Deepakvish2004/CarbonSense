// widget/main.js
const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const si = require("systeminformation");
const fs = require("fs");

let win;
let tray;

// --------------------------------------------------------
// ⭐ SETTINGS FILE (to save auto-start state)
// --------------------------------------------------------
const settingsFile = path.join(app.getPath("userData"), "settings.json");

// Load user settings
function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsFile, "utf8"));
  } catch {
    return { autoStart: false };
  }
}

// Save settings
function saveSettings(settings) {
  fs.writeFileSync(settingsFile, JSON.stringify(settings));
}

let settings = loadSettings();

// --------------------------------------------------------
// ⭐ POSITION SAVE SYSTEM
// --------------------------------------------------------
const positionFile = path.join(app.getPath("userData"), "widget-position.json");

function loadWindowPosition() {
  try {
    return JSON.parse(fs.readFileSync(positionFile, "utf8"));
  } catch {
    return { x: 1200, y: 50 }; // default
  }
}

function saveWindowPosition(pos) {
  fs.writeFileSync(positionFile, JSON.stringify(pos));
}


// --------------------------------------------------------
// ⭐ APPLY AUTO-START TO WINDOWS
// --------------------------------------------------------
function applyAutoStartState() {
  app.setLoginItemSettings({
    openAtLogin: settings.autoStart
  });
}


// --------------------------------------------------------
// ⭐ CREATE TRAY ICON WITH AUTO-START TOGGLE
// --------------------------------------------------------
function createTray() {
  const iconPath = path.join(__dirname, "icons80.png");
  tray = new Tray(iconPath);

  const trayMenu = Menu.buildFromTemplate([
    { label: "Show Widget", click: () => win.show() },
    { label: "Hide Widget", click: () => win.hide() },

    { type: "separator" },

    {
      label: `Auto Start${settings.autoStart ? " ✔" : ""}`,
      click: () => {
        // Toggle value
        settings.autoStart = !settings.autoStart;

        // Save new value
        saveSettings(settings);

        // Apply to Windows
        applyAutoStartState();

        // Refresh tray menu so ✔ appears
        createTray();
      }
    },

    { type: "separator" },

    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip("CarbonSense Widget");
  tray.setContextMenu(trayMenu);

  tray.on("double-click", () => win.show());
}


// --------------------------------------------------------
// ⭐ CREATE WIDGET WINDOW
// --------------------------------------------------------
function createWindow() {
  const savedPos = loadWindowPosition();

  win = new BrowserWindow({
    width: 280,
    height: 180,
    x: savedPos.x,
    y: savedPos.y,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL("http://localhost:5173/widget");

  win.webContents.on("did-finish-load", () => {
    win.webContents.insertCSS(`
      body { margin: 0; padding: 0; overflow: hidden; }
    `);
  });

  win.on("move", () => {
    const { x, y } = win.getBounds();
    saveWindowPosition({ x, y });
  });
}


// --------------------------------------------------------
// ⭐ IPC FOR CLOSE + MINIMIZE
// --------------------------------------------------------
ipcMain.on("close-widget", () => {
  if (win) win.close();
});

ipcMain.on("minimize-widget", () => {
  if (win) win.hide();
});


// --------------------------------------------------------
// ⭐ START APPLICATION
// --------------------------------------------------------
app.whenReady().then(() => {
  applyAutoStartState(); // ⭐ Apply saved auto-start
  createTray();          // ⭐ Create tray with toggle
  createWindow();        // Create widget window
  setTimeout(startEmissionLoop, 3000);
});


// --------------------------------------------------------
// ⭐ CPU/BATTERY/CO2 LOOP
// --------------------------------------------------------
async function startEmissionLoop() {
  setInterval(async () => {
    try {
      const cpu = await si.currentLoad();
      const battery = await si.battery();

      let cpuLoad = cpu.currentload;

      if (!cpuLoad || cpuLoad === 0) {
        const coreLoads = cpu.cpus.map(c => c.load);
        cpuLoad = coreLoads.reduce((a, b) => a + b, 0) / coreLoads.length;
      }

      cpuLoad = parseFloat(cpuLoad.toFixed(1));
      const batteryPercent = battery.percent || 100;
      const isCharging = battery.ischarging;

      const basePower = 25;
      const cpuPower = (cpuLoad / 100) * 45;
      const batteryDrain = !isCharging ? 5 : 0;
      const totalPower = basePower + cpuPower + batteryDrain;

      const co2Factor = 0.475;
      const emission = ((totalPower / 1000) * co2Factor * (1 / 60)).toFixed(4);

      win?.webContents.send("system-data", {
        cpuLoad,
        batteryPercent,
        isCharging,
        powerUsage: totalPower.toFixed(2),
        co2Emission: emission
      });
    } catch {}
  }, 5000);
}


// --------------------------------------------------------
// ⭐ CLOSE EVENTS
// --------------------------------------------------------
app.on("window-all-closed", () => {
  if (app.isQuiting) app.quit();
});

app.on("activate", () => {
  if (!BrowserWindow.getAllWindows().length) createWindow();
});
