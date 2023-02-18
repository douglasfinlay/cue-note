import { useEffect, useRef, useState } from 'react';
import NoteInput, { NoteInputHandle } from './components/NoteInput';
import PlaybackStatusDisplay from './components/PlaybackStatusDisplay';
import QuickNoteButtonGrid from './components/QuickNoteButtonGrid';
import ConsoleConnection, {
    ConsoleConnectionHandle
} from './components/sidebar/ConsoleConnection';
import CueList from './components/sidebar/CueList';
import { ConnectionState, Cue } from './models/eos';
import { RemoveEventListenerFunc } from './preload';

const QUICK_NOTES = [
    'Quick note #1',
    'Quick note #2',
    'Quick note #3',
    'Quick note #4',
    'Quick note #5',
    'Quick note #6',
    'Quick note #7',
    'Quick note #8',
];

function App() {
    const [consoleAddress, setConsoleAddress] = useState('');
    const [connectionState, setConnectionState] =
        useState<ConnectionState>('disconnected');
    const [cues, setCues] = useState<Cue[]>([]);
    const [readyToNote, setReadyToNote] = useState(false);
    const [activeCue, setActiveCue] = useState<Cue | null>(null);
    const [activeCueNumber, setActiveCueNumber] = useState<string | null>(null);
    const [editingCue, setEditingCue] = useState<Cue | null>(null);
    const [editingCueNumber, setEditingCueNumber] = useState<string | null>(
        null,
    );
    const [editNoteText, setEditNoteText] = useState('');

    const refConsoleConnection = useRef<ConsoleConnectionHandle>(null);
    const refNoteInput = useRef<NoteInputHandle>(null);

    const onEditNoteTextEdited = (text: string) => {
        if (!editingCueNumber) {
            setEditingCueNumber(activeCueNumber);
        }

        setEditNoteText(text);
    };

    const applyNoteToCue = (cueNumber: string, note: string) => {
        window.api.updateCueNotes('1', cueNumber, note.trimEnd());
        discardNote();
    };

    const applyNoteToCurrentCue = (note: string) => {
        const targetCueNumber = editingCueNumber || activeCueNumber;

        if (targetCueNumber) {
            applyNoteToCue(targetCueNumber, note);
        }
    };

    const saveNote = () => {
        applyNoteToCurrentCue(editNoteText);
    };

    const discardNote = () => {
        setEditingCueNumber(null);
        setEditNoteText('');
    };

    const editCue = (cueNumber: string) => {
        discardNote();
        setEditingCueNumber(cueNumber);

        const cue = cues.find((cue) => cue.cueNumber === cueNumber);
        setEditNoteText(cue?.notes ?? '');

        refNoteInput.current?.focus();
    };

    const goToCue = (cueNumber: string) => window.api.goToCue(cueNumber);

    const onInitialSyncComplete = async () => {
        const cues = await window.api.getCues();
        setCues(cues);
    };

    const onCueCreated = (newCue: Cue) => {
        setCues((cues) => {
            const previousCueIndex = cues.findIndex(
                (cue) => Number(cue.cueNumber) > Number(newCue.cueNumber),
            );

            if (previousCueIndex === -1) {
                return [...cues, newCue];
            }

            return [
                ...cues.slice(0, previousCueIndex),
                newCue,
                ...cues.slice(previousCueIndex),
            ];
        });
    };

    const onCueDeleted = (cueNumber: string) => {
        setCues((cues) => {
            const cueIndex = cues.findIndex(
                (cue) => cue.cueNumber === cueNumber,
            );

            if (cueIndex === -1) {
                return cues;
            }

            return [...cues.slice(0, cueIndex), ...cues.slice(cueIndex + 1)];
        });
    };

    const onCueUpdated = (updatedCue: Cue) =>
        setCues((cues) =>
            cues.map((cue) =>
                cue.cueNumber === updatedCue.cueNumber ? updatedCue : cue,
            ),
        );

    const clearState = () => {
        setCues([]);
        setActiveCue(null);
        setActiveCueNumber(null);
        setEditingCue(null);
        setEditingCueNumber(null);
        discardNote();
    };

    useEffect(() => {
        if (readyToNote) {
            refNoteInput.current?.focus();
        }
    }, [readyToNote]);

    useEffect(() => {
        if (activeCueNumber) {
            const activeCue = cues.find(
                (cue) => cue.cueNumber === activeCueNumber,
            );
            setActiveCue(activeCue ?? null);
        }
    }, [cues, activeCueNumber]);

    useEffect(() => {
        if (!editingCueNumber) {
            setEditingCue(null);
            return;
        }

        const editingCue = cues.find(
            (cue) => cue.cueNumber === editingCueNumber,
        );
        setEditingCue(editingCue ?? null);
    }, [cues, editingCueNumber]);

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            discardNote();
        }
    };

    useEffect(() => {
        if (connectionState === 'disconnected') {
            clearState();
            refConsoleConnection.current?.focus();
        }
    }, [connectionState]);

    useEffect(() => {
        const ready =
            connectionState === 'connected' && (!!editingCue || !!activeCue);

        setReadyToNote(ready);
    }, [connectionState, activeCue, editingCue]);

    useEffect(() => {
        const eventListeners: RemoveEventListenerFunc[] = [];

        eventListeners.push(window.api.onActiveCue(setActiveCueNumber));
        eventListeners.push(
            window.api.onConsoleConnectionStateChanged(setConnectionState),
        );
        eventListeners.push(
            window.api.onConsoleInitialSyncComplete(onInitialSyncComplete),
        );
        eventListeners.push(window.api.onCueCreated(onCueCreated));
        eventListeners.push(window.api.onCueDeleted(onCueDeleted));
        eventListeners.push(window.api.onCueUpdated(onCueUpdated));

        document.addEventListener('keydown', onKeyDown, false);

        (async () => {
            const host = await window.api.getHost();
            setConsoleAddress(host);

            const connectionState = await window.api.getConnectionState();
            setConnectionState(connectionState);

            const initialSyncComplete = await window.api.isInitialSyncComplete();
            if (initialSyncComplete) {
                const cues = await window.api.getCues();
                setCues(cues);
                
                const activeCue = await window.api.getCurrentCue();
                setActiveCueNumber(activeCue?.cueNumber ?? null);
            }
        })();

        refConsoleConnection.current?.focus();

        return () => {
            for (const removeListener of eventListeners) {
                removeListener();
            }

            document.removeEventListener('keydown', onKeyDown, false);
        };
    }, []);

    return (
        <div className='flex gap-3 w-screen min-w-screen h-screen min-h-screen p-2 select-none text-white bg-black'>
            <div className='basis-2/3 flex gap-3 flex-col min-w-0'>
                <div className='grow'>
                    <QuickNoteButtonGrid
                        disabled={!readyToNote}
                        quickNotes={QUICK_NOTES}
                        onNoteTriggered={(note) => applyNoteToCurrentCue(note)}
                    />
                </div>
                <div className='grow-0 shrink-0'>
                    <PlaybackStatusDisplay
                        active={editingCue || activeCue}
                        disabled={!readyToNote}
                        editing={!!editingCue}
                    />
                </div>
                <div className='flex basis-28 grow-0 shrink-0 gap-2'>
                    <NoteInput
                        ref={refNoteInput}
                        disabled={!readyToNote}
                        value={editNoteText}
                        onEnterPressed={saveNote}
                        onTextChanged={onEditNoteTextEdited}
                    />
                    <div className='flex flex-col gap-2'>
                        <button
                            className='grow-0 shrink-0 px-3 w-24 h-12 rounded bg-eos-grey-dark border-2 border-solid border-eos-grey-light disabled:opacity-50'
                            disabled={!readyToNote || !editingCue}
                            onClick={discardNote}
                        >
                            <div className='leading-5'>Cancel</div>
                            <div className='text-xs'>(Esc)</div>
                        </button>
                        <button
                            className='grow rounded px-3 w-24 h-12 bg-eos-grey-dark border-2 border-solid border-eos-grey-light disabled:opacity-50'
                            disabled={!readyToNote || !editingCue}
                            onClick={saveNote}
                        >
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='24'
                                height='24'
                                fill='currentColor'
                                className='bi bi-arrow-return-left inline-block'
                                viewBox='0 0 16 16'
                            >
                                <path
                                    fillRule='evenodd'
                                    d='M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z'
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className='basis-1/3 grow-0 shrink-0 flex gap-2 flex-col'>
                <div className='grow overflow-y-hidden shadow-inner relative'>
                    <CueList
                        cues={cues}
                        activeCueNumber={activeCueNumber}
                        editingCueNumber={editingCueNumber}
                        focusCueNumber={editingCueNumber || activeCueNumber}
                        onTriggerClearCue={(cueNumber) =>
                            applyNoteToCue(cueNumber, '')
                        }
                        onTriggerEditCue={editCue}
                        onTriggerGoToCue={goToCue}
                    />
                </div>
                <div className='grow-0 shrink-0'>
                    <ConsoleConnection
                        address={consoleAddress}
                        ref={refConsoleConnection}
                        connectionState={connectionState}
                        onTriggerConnect={window.api.connectConsole}
                        onTriggerDisconnect={window.api.disconnectConsole}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
