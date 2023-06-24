import { useEffect, useState } from 'react';
import { ConnectionState, Cue } from './models/eos';
import { RemoveEventListenerFunc } from './preload';
import ConsoleConnectionCard from './components/connect/ConsoleConnectionCard';
import Toolbar from './components/Toolbar';
import CueNoteMain from './components/CueNoteMain';

function App() {
    const [connectionState, setConnectionState] =
        useState<ConnectionState>('disconnected');
    const [initialSyncProgress, setInitialSyncProgress] = useState<
        number | undefined
    >();
    const [cues, setCues] = useState<Cue[]>([]);
    const [activeCue, setActiveCue] = useState<Cue | null>(null);
    const [activeCueNumber, setActiveCueNumber] = useState<string | null>(null);

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
        if (connectionState === 'disconnected') {
            clearState();
        } else if (connectionState === 'connected') {
            updateInitialSyncProgress();
        }
    }, [connectionState]);

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

        (async () => {
            const connectionState = await window.api.getConnectionState();
            setConnectionState(connectionState);

            const initialSyncComplete =
                await window.api.isInitialSyncComplete();
            if (initialSyncComplete) {
                const cues = await window.api.getCues();
                setCues(cues);

                const activeCue = await window.api.getCurrentCue();
                setActiveCueNumber(activeCue?.cueNumber ?? null);
            } else {
                updateInitialSyncProgress();
            }
        })();

        return () => {
            for (const removeListener of eventListeners) {
                removeListener();
            }
        };
    }, []);

    const updateInitialSyncProgress = async () => {
        const progress = await window.api.getInitialSyncProgress();
        setInitialSyncProgress(progress);

        if (progress !== undefined && progress < 1) {
            // There is still work to be done, check again later
            setTimeout(updateInitialSyncProgress, 10);
        }
    };

    return (
        <div className='select-none text-white bg-stone-900'>
            {connectionState === 'connected' &&
            initialSyncProgress === undefined ? (
                <div className='flex flex-col h-screen min-h-screen '>
                    <div className='flex-grow-0'>
                        <Toolbar
                            onTriggerDisconnect={window.api.disconnectConsole}
                        />
                    </div>

                    <div className='p-2 flex-grow h-full max-h-full overflow-hidden'>
                        <CueNoteMain activeCue={activeCue} cues={cues} />
                    </div>
                </div>
            ) : (
                <ConsoleConnectionCard
                    connectionState={connectionState}
                    initialSyncProgress={initialSyncProgress}
                    onTriggerConnect={window.api.connectConsole}
                    onTriggerDisconnect={window.api.disconnectConsole}
                />
            )}
        </div>
    );
}

export default App;
