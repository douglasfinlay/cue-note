import { EosConnectionState } from 'eos-console';
import { useEffect, useState } from 'react';
import CueNoteMain from './components/CueNoteMain';
import TitleBar from './components/TitleBar';
import ConsoleConnectionCard from './components/connect/ConsoleConnectionCard';
import { RemoveEventListenerFunc } from './preload';

function App() {
    const [syncing] = useState(false);
    const [connectionState, setConnectionState] =
        useState<EosConnectionState>('disconnected');

    const [showName, setShowName] = useState<string | null>(null);

    const clearState = () => {
        setShowName(null);
    };

    useEffect(() => {
        if (connectionState === 'disconnected') {
            clearState();
        }
    }, [connectionState]);

    useEffect(() => {
        const eventListeners: RemoveEventListenerFunc[] = [
            window.api.onConsoleConnectionStateChanged(setConnectionState),
            window.api.onShowName((name) => {
                setShowName(name ?? null);
            }),
        ];

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
                        <CueNoteMain />
                    </div>
                ) : (
                    <div className='-m-12'>
                        <ConsoleConnectionCard
                            connectionState={connectionState}
                            syncProgress={null}
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
