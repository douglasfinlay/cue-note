import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Cue, EosConnectionState, TargetNumber } from 'eos-console';
import { EosCueIdentifier } from 'eos-console/lib/eos-types';

export type RemoveEventListenerFunc = () => void;

export type ContextBridgeApi = {
    connectConsole: (address: string) => void;

    disconnectConsole: () => void;

    getConnectionState: () => Promise<EosConnectionState>;

    getCue: (cueNumber: TargetNumber) => Promise<Cue | null>;

    getCues: () => Promise<Cue[]>;

    getCurrentCue: () => Promise<EosCueIdentifier | undefined>;

    getHost: () => Promise<string>;

    getPendingCue: () => Promise<EosCueIdentifier | undefined>;

    goToCue: (cueNumber: string) => void;

    updateCueNotes: (
        cueList: TargetNumber,
        cueNumber: TargetNumber,
        notes: string,
    ) => void;

    onActiveCue: (
        callback: (cueNumber: TargetNumber) => void,
    ) => RemoveEventListenerFunc;

    onPendingCue: (
        callback: (cueNumber: string) => void,
    ) => RemoveEventListenerFunc;

    onConsoleConnectionStateChanged: (
        callback: (state: EosConnectionState) => void,
    ) => RemoveEventListenerFunc;

    onConnectError: (
        callback: (reason: string) => void,
    ) => RemoveEventListenerFunc;

    onShowName: (callback: (name: string) => void) => RemoveEventListenerFunc;

    onCueChange: (
        callback: (cueNumbers: TargetNumber[], cueList: TargetNumber) => void,
    ) => RemoveEventListenerFunc;

    onGetCuesProgress: (
        callback: (progress: number) => void,
    ) => RemoveEventListenerFunc;
};

const exposedApi: ContextBridgeApi = {
    connectConsole: (address) => ipcRenderer.send('console:connect', address),

    disconnectConsole: () => ipcRenderer.send('console:disconnect'),

    getConnectionState: async () =>
        ipcRenderer.invoke('console:get-connection-state'),

    getCue: async (cueNumber) =>
        ipcRenderer.invoke('console:get-cue', cueNumber),

    getCues: async () => ipcRenderer.invoke('console:get-cues'),

    getCurrentCue: async () => ipcRenderer.invoke('console:get-current-cue'),

    getHost: async () => ipcRenderer.invoke('console:get-host'),

    getPendingCue: async () => ipcRenderer.invoke('console:get-pending-cue'),

    goToCue: (cueNumber) => ipcRenderer.send('console:go-to-cue', cueNumber),

    updateCueNotes: (cueList, cueNumber, notes) =>
        ipcRenderer.send('console:update-cue-notes', cueList, cueNumber, notes),

    onActiveCue: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[{ cue }]: [{ cue: EosCueIdentifier }]
        ) => callback(cue.cueNumber);

        ipcRenderer.on('console:active-cue', subscription);

        return () => {
            ipcRenderer.off('console:active-cue', subscription);
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
            ...[state]: [EosConnectionState]
        ) => callback(state);

        ipcRenderer.on('console:connection-state', subscription);

        return () => {
            ipcRenderer.off('console:connection-state', subscription);
        };
    },

    onConnectError: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[reason]: [string]
        ) => callback(reason);

        ipcRenderer.on('console:connect-error', subscription);

        return () => {
            ipcRenderer.off('console:connect-error', subscription);
        };
    },

    onShowName: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[{ showName }]: [{ showName: string }]
        ) => callback(showName);

        ipcRenderer.on('console:show-name', subscription);

        return () => {
            ipcRenderer.off('console:show-name', subscription);
        };
    },

    onCueChange: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[cueNumbers, cueList]: [TargetNumber[], TargetNumber]
        ) => callback(cueNumbers, cueList);

        ipcRenderer.on('console:cue-change', subscription);

        return () => {
            ipcRenderer.off('console:cue-change', subscription);
        };
    },

    onGetCuesProgress: (callback) => {
        const subscription = (
            _event: IpcRendererEvent,
            ...[completed, total]: [number, number]
        ) => callback(completed / total);

        ipcRenderer.on('console:get-cues-progress', subscription);

        return () => {
            ipcRenderer.off('console:get-cues-progress', subscription);
        };
    },
};

contextBridge.exposeInMainWorld('api', exposedApi);
