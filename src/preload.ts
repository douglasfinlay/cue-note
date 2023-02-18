import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ConnectionState, Cue } from './models/eos';

export type RemoveEventListenerFunc = () => void;

export type ContextBridgeApi = {
    connectConsole: (address: string) => void;

    disconnectConsole: () => void;

    getConnectionState: () => Promise<ConnectionState>;

    getCues: () => Promise<Cue[]>;

    getCurrentCue: () => Promise<Cue | null>;

    getHost: () => Promise<string>,

    getPendingCue: () => Promise<Cue | null>;

    goToCue: (cueNumber: string) => void;

    isInitialSyncComplete: () => Promise<boolean>;

    updateCueNotes: (
        cueListNumber: string,
        cueNumber: string,
        notes: string,
    ) => void;

    onActiveCue: (
        callback: (cueNumber: string) => void,
    ) => RemoveEventListenerFunc;

    onCueCreated: (callback: (cue: Cue) => void) => RemoveEventListenerFunc;

    onCueDeleted: (
        callback: (cueNumber: string) => void,
    ) => RemoveEventListenerFunc;

    onCueUpdated: (callback: (cue: Cue) => void) => RemoveEventListenerFunc;

    onPendingCue: (
        callback: (cueNumber: string) => void,
    ) => RemoveEventListenerFunc;

    onConsoleConnectionStateChanged: (
        callback: (state: ConnectionState) => void,
    ) => RemoveEventListenerFunc;

    onConsoleInitialSyncComplete: (
        callback: () => void,
    ) => RemoveEventListenerFunc;
};

const exposedApi: ContextBridgeApi = {
    connectConsole: (address) => ipcRenderer.send('console:connect', address),

    disconnectConsole: () => ipcRenderer.send('console:disconnect'),

    getConnectionState: async () => ipcRenderer.invoke('console:get-connection-state'),

    getCues: async () => ipcRenderer.invoke('console:get-cues'),

    getCurrentCue: async () => ipcRenderer.invoke('console:get-current-cue'),

    getHost: async () => ipcRenderer.invoke('console:get-host'),

    getPendingCue: async () => ipcRenderer.invoke('console:get-pending-cue'),

    goToCue: (cueNumber) => ipcRenderer.send('console:go-to-cue', cueNumber),

    isInitialSyncComplete: async () => ipcRenderer.invoke('console:is-initial-sync-complete'),

    updateCueNotes: (cueListNumber, cueNumber, notes) =>
        ipcRenderer.send(
            'console:update-cue-notes',
            cueListNumber,
            cueNumber,
            notes,
        ),

    onActiveCue: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[cueNumber]: [string]
        ) => callback(cueNumber);

        ipcRenderer.on('console:active-cue', subscription);

        return () => {
            ipcRenderer.off('console:active-cue', subscription);
        };
    },

    onCueCreated: (callback) => {
        const subscription = (_event: IpcRendererEvent, ...[cue]: [Cue]) =>
            callback(cue);

        ipcRenderer.on('console:cue:created', subscription);

        return () => {
            ipcRenderer.off('console:cue:created', subscription);
        };
    },

    onCueDeleted: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[cueNumber]: [string]
        ) => callback(cueNumber);

        ipcRenderer.on('console:cue:deleted', subscription);

        return () => {
            ipcRenderer.off('console:cue:deleted', subscription);
        };
    },

    onCueUpdated: (callback) => {
        const subscription = (_event: IpcRendererEvent, ...[cue]: [Cue]) =>
            callback(cue);

        ipcRenderer.on('console:cue:updated', subscription);

        return () => {
            ipcRenderer.off('console:cue:updated', subscription);
        };
    },

    onPendingCue: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[cueNumber]: [string]
        ) => callback(cueNumber);

        ipcRenderer.on('console:pending-cue', subscription);

        return () => {
            ipcRenderer.off('console:pending-cue', subscription);
        };
    },

    onConsoleConnectionStateChanged: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[state]: [ConnectionState]
        ) => callback(state);

        ipcRenderer.on('console:connection-state', subscription);

        return () => {
            ipcRenderer.off('console:connection-state', subscription);
        };
    },

    onConsoleInitialSyncComplete: (callback) => {
        const subscription = () => callback();

        ipcRenderer.on('console:initial-sync-complete', subscription);

        return () => {
            ipcRenderer.off('console:initial-sync-complete', subscription);
        };
    },
};

contextBridge.exposeInMainWorld('api', exposedApi);
