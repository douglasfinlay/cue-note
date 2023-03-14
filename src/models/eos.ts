export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export type SyncState = 'idle' | 'running-initial' | 'running';

interface RecordTarget {
    uid: string;
}

export interface Cue extends RecordTarget {
    cueListNumber: number;
    cueNumber: string;
    cuePartNumber: number;
    isPart: boolean;
    isSceneEnd: boolean;
    label: string;
    scene: string;
    notes: string;
}
