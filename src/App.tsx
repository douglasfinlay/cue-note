import { useEffect, useState } from 'react';
import NoteInput from './components/NoteInput';
import PlaybackStatusDisplay from './components/PlaybackStatusDisplay';
import QuickNotes from './components/QuickNotes';
import ConsoleConnection from './components/sidebar/ConsoleConnection';
import CueList from './components/sidebar/CueList';
import { ConnectionState, Cue } from './models/eos';
import { RemoveEventListenerFunc } from './preload';

function App() {
    const [connectionState, setConnectionState] =
        useState<ConnectionState>('disconnected');
    const [cues, setCues] = useState<Cue[]>([]);
    const [ready, setReady] = useState(false);
    const [activeCue, setActiveCue] = useState<Cue | null>(null);
    const [activeCueNumber, setActiveCueNumber] = useState<string | null>(null);
    const [editingCue, setEditingCue] = useState<Cue | null>(null);
    const [editingCueNumber, setEditingCueNumber] = useState<string | null>(
        null,
    );
    const [editNoteText, setEditNoteText] = useState('');

    const onEditNoteTextEdited = (text: string) => {
        if (!editingCueNumber) {
            setEditingCueNumber(activeCueNumber);
        }

        setEditNoteText(text);
    };

    const saveNote = () => {
        if (!editingCueNumber) {
            return;
        }

        window.api.updateCueNotes(
            '1',
            editingCueNumber,
            editNoteText.trimEnd(),
        );
        cancelEditingNote();
    };

    const cancelEditingNote = () => {
        setEditingCueNumber(null);
        setEditNoteText('');
    };

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
    };

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
            cancelEditingNote();
        }
    };

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

        () => {
            for (const removeListener of eventListeners) {
                removeListener();
            }

            document.removeEventListener('keydown', onKeyDown, false);
        };
    }, []);

    useEffect(() => {
        if (connectionState === 'disconnected') {
            clearState();
        }
    }, [connectionState]);

    useEffect(() => {
        setReady(connectionState === 'connected' && !!activeCueNumber);
    }, [connectionState, activeCueNumber]);

    return (
        <div className='flex gap-3 w-screen min-w-screen h-screen min-h-screen p-2 select-none text-white bg-black'>
            <div className='basis-2/3 flex gap-3 flex-col min-w-0'>
                <div className='grow'>
                    <QuickNotes disabled={!ready} />
                </div>
                <div className='grow-0 shrink-0'>
                    <PlaybackStatusDisplay
                        active={editingCue || activeCue}
                        disabled={!ready}
                        editing={!!editingCue}
                    />
                </div>
                <div className='basis-28 grow-0 shrink-0'>
                    <NoteInput
                        disabled={!ready}
                        value={editNoteText}
                        onEnterPressed={saveNote}
                        onTextChanged={onEditNoteTextEdited}
                    />
                </div>
            </div>
            <div className='basis-1/3 grow-0 shrink-0 flex gap-3 flex-col'>
                <div className='grow overflow-y-hidden shadow-inner relative'>
                    <CueList
                        cues={cues}
                        activeCueNumber={activeCueNumber}
                        editingCueNumber={editingCueNumber}
                        focusCueNumber={editingCueNumber || activeCueNumber}
                    />
                </div>
                <div className='grow-0 shrink-0'>
                    <ConsoleConnection
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
