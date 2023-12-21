import { app, BrowserWindow, ipcMain } from 'electron';
import { EosConsole, EosCueIdentifier, RecordTargetType, TargetNumber } from 'eos-console';
import * as colors from 'tailwindcss/colors';

let mainWindow: BrowserWindow | null;
let eos: EosConsole | null;

const INITIAL_WINDOW_TITLE = 'CueNote';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = (): void => {
    mainWindow = new BrowserWindow({
        backgroundColor: colors.stone[900],
        height: 768,
        minHeight: 600,
        minWidth: 800,
        title: INITIAL_WINDOW_TITLE,
        titleBarOverlay: {
            color: colors.stone[900],
            symbolColor: colors.gray[400],
        },
        titleBarStyle: 'hidden',
        webPreferences: {
            devTools: !app.isPackaged,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        width: 1024,
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    mainWindow.webContents.openDevTools();
};

app.on('ready', async () => {
    createWindow();
});

app.on('window-all-closed', () => {
    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('quit', () => {
    if (eos) {
        eos.disconnect();
        eos.removeAllListeners();
    }
});

ipcMain.handle('console:connect', async (_event, ...[address]) => {
    if (eos) {
        eos.disconnect();
    }

    eos = new EosConsole(address);

    eos.on('connecting', () => {
        mainWindow?.webContents.send('console:connection-state', 'connecting');
    });

    eos.on('connect', () => {
        mainWindow?.webContents.send('console:connection-state', 'connected');
    });

    eos.on('connectError', (err: Error) => {
        mainWindow?.webContents.send('console:connect-error', err.message);

        mainWindow?.webContents.send(
            'console:connection-state',
            'disconnected',
        );
    });

    eos.on('disconnect', () => {
        mainWindow?.webContents.send(
            'console:connection-state',
            'disconnected',
        );

        mainWindow?.setTitle(INITIAL_WINDOW_TITLE);
    });

    eos.on('show-name', (showName: string) => {
        mainWindow?.webContents.send('console:show-name', showName);
        
        let windowTitle = INITIAL_WINDOW_TITLE;
        
        if (showName) {
            windowTitle += ` - ${showName}`;
        }
        
        mainWindow?.setTitle(windowTitle);
    });

    eos.on('active-cue', (cue: EosCueIdentifier | null) => {
        mainWindow?.webContents.send('console:active-cue', cue);
    });

    eos.on('pending-cue', (cue: EosCueIdentifier | null) => {
        mainWindow?.webContents.send('console:pending-cue', cue);
    });

    // FIXME: cue list should not be an array
    eos.on('record-target-change', (targetType: RecordTargetType, cueNumbers: TargetNumber[], cueList: TargetNumber[]) => {
        if (targetType === 'cue' && cueList[0] === 1) {
            mainWindow?.webContents.send('console:cue-change', cueNumbers, cueList[0]);
        }
    });

    await eos.connect();
});

ipcMain.on('console:disconnect', () => {
    if (eos) {
        eos.disconnect();
        eos = null;
    }
});

ipcMain.handle('console:get-cue', (_event, ...[cueNumber]) => eos?.getCue(1, cueNumber));

ipcMain.handle('console:get-cues', async () => {
    if (!eos) {
        return [];
    }

    const progressCallback = (complete: number, total: number) => {
        mainWindow?.setProgressBar(complete / total);
        mainWindow?.webContents.send('console:get-cues-progress', complete, total);
    };

    mainWindow?.setProgressBar(0);
    const cues = await eos.getCues(1, progressCallback);
    mainWindow?.setProgressBar(-1);

    return cues;
});

ipcMain.handle('console:get-current-cue', () => eos?.activeCueNumber);

ipcMain.handle('console:get-host', () => eos?.host);

ipcMain.handle('console:get-pending-cue', () => eos?.pendingCueNumber);

ipcMain.on('console:go-to-cue', (_event, ...[cueNumber]) =>
    eos?.fireCue(1, cueNumber),
);

ipcMain.handle(
    'console:get-connection-state',
    () => eos?.connectionState ?? 'disconnected',
);

ipcMain.on(
    'console:update-cue-notes',
    (_event, ...[cueListNumber, cueNumber, notes]) => {
        eos?.sendMessage(`/eos/set/cue/${cueListNumber}/${cueNumber}/notes`, [notes]);
    },
);
