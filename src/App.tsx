import NoteInput from './components/NoteInput';
import PlaybackStatusDisplay from './components/PlaybackStatusDisplay';
import QuickNotes from './components/QuickNotes';
import ConsoleConnection from './components/sidebar/ConsoleConnection';
import CueList from './components/sidebar/CueList';
import { Cue } from './models/cue';

function App() {
    const currentCue: Cue = {
        number: '20',
        label: 'All X to SL',
    };

    const nextCue: Cue = {
        number: '20.1',
        label: 'AFO lose SR',
    };

    return (
        <div className='flex gap-3 w-screen min-w-screen h-screen min-h-screen p-2 text-white bg-black'>
            <div className='basis-2/3 flex gap-3 flex-col min-w-0'>
                <div className='grow-0 shrink-0'>
                    <PlaybackStatusDisplay
                        current={currentCue}
                        next={nextCue}
                    />
                </div>
                <div className='grow'>
                    <QuickNotes />
                </div>
                <div className='basis-1/3 shrink-0'>
                    <NoteInput />
                </div>
            </div>
            <div className='basis-1/3 shrink-0 flex gap-3 flex-col'>
                <div className='grow overflow-y-scroll'>
                    <CueList />
                </div>
                <div className='grow-0 shrink-0'>
                    <ConsoleConnection />
                </div>
            </div>
        </div>
    );
}

export default App;
