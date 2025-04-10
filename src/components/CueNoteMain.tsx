import { Cue, TargetNumber } from 'eos-console';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import NoteInput, { NoteInputHandle } from './NoteInput';
import PlaybackStatusDisplay from './PlaybackStatusDisplay';
import QuickNoteButtonGrid from './QuickNoteButtonGrid';
import CueList from './sidebar/CueList';

interface CueNoteMainProps {
    activeCue: Cue | null;
    cues: Cue[];
}

const CueNoteMain = (props: CueNoteMainProps) => {
    const [editNoteText, setEditNoteText] = useState('');
    const [readyToNote, setReadyToNote] = useState(false);
    const [editingCue, setEditingCue] = useState<Cue | null>(null);
    const [editingCueNumber, setEditingCueNumber] = useState<TargetNumber | null>(
        null,
    );

    const refNoteInput = useRef<NoteInputHandle>(null);

    const isMac = navigator.platform.includes('Mac');
    const modifierKey = isMac ? 'meta' : 'ctrl';
    // Map Ctrl+D / Cmd+D to clear the current cue's note
    useHotkeys(`${modifierKey}+d`, () => applyNoteToCurrentCue(''), {
        enableOnFormTags: true,
    });
    // Map Ctrl+E / Cmd+E to focus the edit textarea
    useHotkeys(`${modifierKey}+e`, () => refNoteInput.current?.focus(), {
        enableOnFormTags: true,
    });

    const onEditNoteTextEdited = (text: string) => {
        if (!editingCueNumber) {
            setEditingCueNumber(props.activeCue?.targetNumber || null);
        }

        setEditNoteText(text);
    };

    const applyNoteToCue = (cueNumber: TargetNumber, note: string) => {
        window.api.updateCueNotes(1, cueNumber, note.trimEnd());
        discardNote();
    };

    const applyNoteToCurrentCue = (note: string) => {
        const targetCueNumber = editingCueNumber || props.activeCue?.targetNumber;

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

    const editCue = (cueNumber: TargetNumber) => {
        discardNote();
        setEditingCueNumber(cueNumber);

        const cue = props.cues.find((cue) => cue.targetNumber === cueNumber);
        setEditNoteText(cue?.notes ?? '');

        refNoteInput.current?.focus();
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            discardNote();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown, false);

        return () => {
            document.removeEventListener('keydown', onKeyDown, false);
        };
    }, []);

    useEffect(() => {
        if (readyToNote) {
            refNoteInput.current?.focus();
        }
    }, [readyToNote]);

    useEffect(() => {
        if (!editingCueNumber) {
            setEditingCue(null);
            return;
        }

        const editingCue = props.cues.find(
            (cue) => cue.targetNumber === editingCueNumber,
        );
        setEditingCue(editingCue ?? null);
    }, [props.cues, editingCueNumber]);

    useEffect(() => {
        const ready = !!editingCue || !!props.activeCue;

        setReadyToNote(ready);
    }, [props.activeCue, editingCue]);

    return (
        <div className='flex h-full max-h-full gap-2'>
            <div className='basis-2/3 flex gap-3 flex-col min-w-0'>
                <div className='grow'>
                    <QuickNoteButtonGrid
                        disabled={!readyToNote}
                        onNoteTriggered={(note) => applyNoteToCurrentCue(note)}
                    />
                </div>
                <div className='grow-0 shrink-0'>
                    <PlaybackStatusDisplay
                        active={editingCue || props.activeCue}
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
                            className='grow-0 shrink-0 px-3 w-24 h-12 bg-neutral-900 disabled:opacity-50'
                            disabled={!readyToNote || !editingCue}
                            onClick={discardNote}
                        >
                            <div className='leading-5'>Cancel</div>
                            <div className='text-xs'>(Esc)</div>
                        </button>
                        <button
                            className='grow px-3 w-24 h-12 bg-neutral-900 disabled:opacity-50'
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
            <div className='basis-1/3 grow-0 shrink-0 flex gap-2 relative min-w-0'>
                <CueList
                    cues={props.cues}
                    activeCueNumber={props.activeCue?.targetNumber}
                    editingCueNumber={editingCueNumber}
                    focusCueNumber={
                        editingCueNumber || props.activeCue?.targetNumber
                    }
                    onTriggerClearCue={(cueNumber) =>
                        applyNoteToCue(cueNumber, '')
                    }
                    onTriggerEditCue={editCue}
                />
            </div>
        </div>
    );
};

export default CueNoteMain;
