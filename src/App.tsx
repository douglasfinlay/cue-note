import { useEffect, useState } from 'react';
import { ConnectionState, Cue } from './models/eos';
import { RemoveEventListenerFunc } from './preload';
import ConsoleConnectionCard from './components/connect/ConsoleConnectionCard';
import TitleBar from './components/TitleBar';
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
    const [showName, setShowName] = useState<string | null>(null);

    const onInitialSyncComplete = async (showName?: string) => {
        const cues = await window.api.getCues();
        setCues(cues);

        setShowName(showName ?? null);
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
        setShowName(null);
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

    const isMac = navigator.platform.includes('Mac');

    return (
        <div className='flex flex-col h-screen min-h-screen select-none text-white overflow-hidden bg-stone-900'>
            <div className='basis-12 grow-0 shrink-0'>
                <TitleBar
                    buttonPosition={isMac ? 'right' : 'left'}
                    onTriggerDisconnect={
                        connectionState === 'connected' &&
                        initialSyncProgress === undefined
                            ? window.api.disconnectConsole
                            : undefined
                    }
                    title={showName ?? 'CueNote'}
                />
            </div>

            <div className='grow h-0 p-2'>
                {connectionState === 'connected' &&
                initialSyncProgress === undefined ? (
                    <div className='h-full'>
                        <CueNoteMain activeCue={activeCue} cues={cues} />
                    </div>
                ) : (
                    <div className='-m-12'>
                        <ConsoleConnectionCard
                            connectionState={connectionState}
                            initialSyncProgress={initialSyncProgress}
                            onTriggerConnect={window.api.connectConsole}
                            onTriggerDisconnect={window.api.disconnectConsole}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
