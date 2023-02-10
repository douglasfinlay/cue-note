import { useEffect, useState } from 'react';
import NoteInput from './components/NoteInput';
import PlaybackStatusDisplay from './components/PlaybackStatusDisplay';
import QuickNotes from './components/QuickNotes';
import ConsoleConnection from './components/sidebar/ConsoleConnection';
import CueList from './components/sidebar/CueList';
import { ConnectionState, Cue } from './models/eos';

function App() {
    const [connectionState, setConnectionState] =
        useState<ConnectionState>('disconnected');
    const [cues, setCues] = useState<Cue[]>([]);
    const [activeCue, setActiveCue] = useState<Cue | null>(null);
    const [activeCueNumber, setActiveCueNumber] = useState<string | null>(null);
    const [pendingCue, setPendingCue] = useState<Cue | null>(null);
    const [pendingCueNumber, setPendingCueNumber] = useState<string | null>(
        null,
    );

    const getConsoleData = async () => {
        const cues = await window.api.getCues();
        setCues(cues);
    };

    const clearState = () => {
        setCues([]);
        setActiveCue(null);
        setActiveCueNumber(null);
        setPendingCue(null);
        setPendingCueNumber(null);
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
        if (pendingCueNumber) {
            const pendingCue = cues.find(
                (cue) => cue.cueNumber === pendingCueNumber,
            );
            setPendingCue(pendingCue ?? null);
        }
    }, [cues, pendingCueNumber]);

    useEffect(() => {
        window.api.onConsoleConnectionStateChanged(setConnectionState);
        window.api.onConsoleInitialSyncComplete(getConsoleData);

        window.api.onActiveCue(setActiveCueNumber);
        window.api.onPendingCue(setPendingCueNumber);
    }, []);

    useEffect(() => {
        if (connectionState === 'disconnected') {
            clearState();
        }
    }, [connectionState]);

    return (
        <div className='flex gap-3 w-screen min-w-screen h-screen min-h-screen p-2 text-white bg-black'>
            <div className='basis-2/3 flex gap-3 flex-col min-w-0'>
                <div className='grow-0 shrink-0'>
                    <PlaybackStatusDisplay
                        active={activeCue}
                        next={pendingCue}
                    />
                </div>
                <div className='grow'>
                    <QuickNotes />
                </div>
                <div className='basis-28 grow-0 shrink-0'>
                    <NoteInput />
                </div>
            </div>
            <div className='basis-1/3 shrink-0 flex gap-3 flex-col'>
                <div className='grow overflow-y-hidden shadow-inner relative'>
                    <CueList
                        cues={cues}
                        activeCueNumber={activeCueNumber ?? undefined}
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
