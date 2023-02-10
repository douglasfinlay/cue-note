import { contextBridge, ipcRenderer } from 'electron';
import { ConnectionState, Cue } from './models/eos';

export type ContextBridgeApi = {
    connectConsole: (address: string) => void;

    disconnectConsole: () => void;

    getCues: () => Promise<Cue[]>;

    getCurrentCue: () => Promise<Cue | null>;

    getPendingCue: () => Promise<Cue | null>;

    goToCue: (cueNumber: string) => void;

    updateCueNotes: (cueNumber: string, notes: string) => void;

    onActiveCue: (callback: (cueNumber: string) => void) => void;

    onPendingCue: (callback: (cueNumber: string) => void) => void;

    onConsoleConnectionStateChanged: (
        callback: (state: ConnectionState) => void,
    ) => void;

    onConsoleInitialSyncComplete: (callback: () => void) => void;
};

const exposedApi: ContextBridgeApi = {
    connectConsole: (address) => ipcRenderer.send('console:connect', address),

    disconnectConsole: () => ipcRenderer.send('console:disconnect'),

    getCues: async () => ipcRenderer.invoke('console:get-cues'),

    getCurrentCue: async () => ipcRenderer.invoke('console:get-current-cue'),

    getPendingCue: async () => ipcRenderer.invoke('console:get-pending-cue'),

    goToCue: (cueNumber) => ipcRenderer.send('console:go-to-cue', cueNumber),

    updateCueNotes: (cueNumber, notes) =>
        ipcRenderer.send('console:update-cue-notes', cueNumber, notes),

    onActiveCue: (callback) =>
        ipcRenderer.on('console:active-cue', (_event, ...[cueNumber]) =>
            callback(cueNumber),
        ),

    onPendingCue: (callback) =>
        ipcRenderer.on('console:pending-cue', (_event, ...[cueNumber]) =>
            callback(cueNumber),
        ),

    onConsoleConnectionStateChanged: (callback) =>
        ipcRenderer.on('console:connection-state', (_event, ...[state]) =>
            callback(state),
        ),

    onConsoleInitialSyncComplete: (callback) =>
        ipcRenderer.on('console:initial-sync-complete', () => callback()),
};

contextBridge.exposeInMainWorld('api', exposedApi);
