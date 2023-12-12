import { Cue, EosConnectionState, TargetNumber } from 'eos-console';
import { useEffect, useState } from 'react';
import CueNoteMain from './components/CueNoteMain';
import TitleBar from './components/TitleBar';
import ConsoleConnectionCard from './components/connect/ConsoleConnectionCard';
import { RemoveEventListenerFunc } from './preload';

function App() {
    const [connectionState, setConnectionState] =
        useState<EosConnectionState>('disconnected');
    const [syncing, setSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState<number | null>(null);

    const [activeCue, setActiveCue] = useState<Cue | null>(null);
    const [activeCueNumber, setActiveCueNumber] = useState<TargetNumber | null>(
        null,
    );
    const [cues, setCues] = useState<Cue[]>([]);
    const [showName, setShowName] = useState<string | null>(null);

    const loadCues = async () => {
        setSyncProgress(null);
        setSyncing(true);

        try {
            const cues = await window.api.getCues();
            setCues(cues);

            const acn = await window.api.getCurrentCue();
            setActiveCueNumber(acn?.cueList === 1 ? acn.cueNumber : null);
        } catch (err) {
            console.error(err);
        } finally {
            setSyncing(false);
            setSyncProgress(null);
        }
    };

    const onCuesChanged = (
        cueNumbers: TargetNumber[],
        cueList: TargetNumber,
    ) => {
        if (cueList !== 1) {
            return;
        }

        for (const cueNumber of cueNumbers) {
            window.api.getCue(cueNumber).then((cue) => {
                setCues((cues) => {
                    if (!cue) {
                        return deleteCue(cues, cueNumber);
                    } else if (
                        cues.some((cue) => cue.targetNumber === cueNumber)
                    ) {
                        return replaceCue(cues, cue);
                    } else {
                        return insertCue(cues, cue);
                    }
                });
            });
        }
    };

    const insertCue = (cues: Cue[], newCue: Cue) => {
        const previousCueIndex = cues.findIndex(
            (cue) => cue.targetNumber > newCue.targetNumber,
        );

        if (previousCueIndex === -1) {
            return [...cues, newCue];
        }

        return [
            ...cues.slice(0, previousCueIndex),
            newCue,
            ...cues.slice(previousCueIndex),
        ];
    };

    const deleteCue = (cues: Cue[], cueNumber: TargetNumber) => {
        const cueIndex = cues.findIndex(
            (cue) => cue.targetNumber === cueNumber,
        );

        if (cueIndex === -1) {
            return cues;
        }

        return [...cues.slice(0, cueIndex), ...cues.slice(cueIndex + 1)];
    };

    const replaceCue = (cues: Cue[], updatedCue: Cue) => {
        return cues.map((cue) =>
            cue.targetNumber === updatedCue.targetNumber ? updatedCue : cue,
        );
    };

    const clearState = () => {
        setCues([]);
        setActiveCue(null);
        setActiveCueNumber(null);
        setShowName(null);
    };

    useEffect(() => {
        if (activeCueNumber) {
            const activeCue = cues.find(
                (cue) => cue.targetNumber === activeCueNumber,
            );
            setActiveCue(activeCue ?? null);
        }
    }, [cues, activeCueNumber]);

    useEffect(() => {
        if (connectionState === 'disconnected') {
            clearState();
        } else if (connectionState === 'connected') {
            loadCues();
        }
    }, [connectionState]);

    useEffect(() => {
        const eventListeners: RemoveEventListenerFunc[] = [];

        eventListeners.push(
            window.api.onActiveCue((cn) => {
                setActiveCueNumber(cn);
            }),
        );
        eventListeners.push(
            window.api.onConsoleConnectionStateChanged(setConnectionState),
        );
        eventListeners.push(
            window.api.onShowName((name) => {
                setShowName(name ?? null);
            }),
        );
        eventListeners.push(window.api.onCueChange(onCuesChanged));
        eventListeners.push(window.api.onGetCuesProgress(setSyncProgress));

        (async () => {
            const connectionState = await window.api.getConnectionState();
            setConnectionState(connectionState);
        })();

        return () => {
            for (const removeListener of eventListeners) {
                removeListener();
            }
        };
    }, []);

    const isMac = navigator.platform.includes('Mac');

    return (
        <div className='flex flex-col h-screen min-h-screen select-none text-white overflow-hidden bg-stone-900'>
            <div className='basis-12 grow-0 shrink-0'>
                <TitleBar
                    buttonPosition={isMac ? 'right' : 'left'}
                    onTriggerDisconnect={
                        connectionState === 'connected' && !syncing
                            ? window.api.disconnectConsole
                            : undefined
                    }
                    title={showName ?? 'CueNote'}
                />
            </div>

            <div className='grow h-0 p-2'>
                {connectionState === 'connected' && !syncing ? (
                    <div className='h-full'>
                        <CueNoteMain activeCue={activeCue} cues={cues} />
                    </div>
                ) : (
                    <div className='-m-12'>
                        <ConsoleConnectionCard
                            connectionState={connectionState}
                            syncProgress={syncProgress}
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
