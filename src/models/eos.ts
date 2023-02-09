export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export type SyncState = 'idle' | 'running-initial' | 'running';

interface RecordTarget {
    uid: string;
}

export interface Cue extends RecordTarget {
    cueListNumber: number;
    cueNumber: string;
    cuePartNumber: number;
    label?: string;
    notes?: string;
}
