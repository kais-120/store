const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const logFile = path.join(app.getPath("userData"), "app.log");
function log(...args) {
    const line = `[${new Date().toISOString()}] ${args.join(" ")}\n`;
    fs.appendFileSync(logFile, line);
    console.log(...args);
}

// catch anything unhandled in the main process
process.on("uncaughtException", (err) => {
    log("UNCAUGHT EXCEPTION:", err.stack || err.message);
    dialog.showErrorBox("Startup error", err.message);
});

let backend;

function getBackendDir() {
    if (app.isPackaged) {
        return path.join(
            process.resourcesPath,
            "app.asar.unpacked",
            "backend"
        );
    }

    return path.join(__dirname, "backend");
}

function startBackend() {
    try {
        const backendDir = getBackendDir();

        log("Backend dir:", backendDir);

        process.chdir(backendDir);

        require(path.join(backendDir, "server.js"));

        log("Backend started OK");

    } catch (err) {
        log("BACKEND START FAILED:");
        log(err.stack || err.message);
    }
}

function createWindow() {
    try {
        const win = new BrowserWindow({ 
            width: 1400,
            height: 900,
             webPreferences: {
            devTools: false,
            contextIsolation: true,
            nodeIntegration: false,
      },
        });
         win.webContents.on("did-fail-load", (e, code, desc) => {
      log("PAGE LOAD FAILED:", code, desc);
    });

    // Block DevTools shortcuts
    win.webContents.on("before-input-event", (event, input) => {
      if (
        input.key === "F12" ||
        (input.control && input.shift && input.key.toLowerCase() === "i") ||
        (input.control && input.shift && input.key.toLowerCase() === "j")
      ) {
        event.preventDefault();
      }
    });

    // Disable right-click context menu
    win.webContents.on("context-menu", (event) => {
      event.preventDefault();
    });

        win.webContents.on("did-fail-load", (e, code, desc) => {
            log("PAGE LOAD FAILED:", code, desc);
        });

        

        const indexPath = path.join(__dirname, "./frontend/index.html");
        log("Loading frontend from:", indexPath, "exists:", fs.existsSync(indexPath));
        win.loadFile(indexPath);
    } catch (err) {
        log("WINDOW CREATION FAILED:", err.stack || err.message);
    }
}

app.whenReady().then(() => {
    startBackend();
    createWindow();
});

app.on("window-all-closed", () => {
    if (backend) backend.kill();
    app.quit();
});