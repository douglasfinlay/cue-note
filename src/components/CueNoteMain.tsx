import { Cue, CueList as EosCueList, TargetNumber } from 'eos-console';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { RemoveEventListenerFunc } from '../preload';
import NoteInput, { NoteInputHandle } from './NoteInput';
import PlaybackStatusDisplay from './PlaybackStatusDisplay';
import QuickNoteButtonGrid from './QuickNoteButtonGrid';
import CueList from './sidebar/CueList';
import CueListSelect from './sidebar/CueListSelect';

const CueNoteMain = () => {
    // TODO: allow null?
    const [cueListNumber, setCueListNumber] = useState<TargetNumber>(1);
    const [cueLists, setCueLists] = useState<EosCueList[]>([]);

    const [cues, setCues] = useState<Cue[]>([]);
    const [activeCue, setActiveCue] = useState<Cue | null>(null);
    const [activeCueNumber, setActiveCueNumber] = useState<TargetNumber | null>(
        null,
    );
    const [editingCue, setEditingCue] = useState<Cue | null>(null);
    const [editingCueNumber, setEditingCueNumber] =
        useState<TargetNumber | null>(null);

    const [loadingCues, setLoadingCues] = useState(true);

    const [editNoteText, setEditNoteText] = useState('');
    const [readyToNote, setReadyToNote] = useState(false);

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
            setEditingCueNumber(activeCue?.targetNumber ?? null);
        }

        setEditNoteText(text);
    };

    const applyNoteToCue = (cueNumber: TargetNumber, note: string) => {
        window.api.updateCueNotes(cueListNumber, cueNumber, note.trimEnd());
        discardNote();
    };

    const applyNoteToCurrentCue = (note: string) => {
        const targetCueNumber = editingCueNumber || activeCue?.targetNumber;

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
        const cue = cues.find((cue) => cue.targetNumber === cueNumber);
        setEditNoteText(cue?.notes ?? '');

        refNoteInput.current?.focus();
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            discardNote();
        }
    };

    const loadCues = async () => {
        setLoadingCues(true);

        try {
            const cues = await window.api.getCues(cueListNumber);
            setCues(cues);

            const acn = await window.api.getCurrentCue();
            setActiveCueNumber(
                acn?.cueList === cueListNumber ? acn.cueNumber : null,
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCues(false);
        }
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

    const replaceCue = (cues: Cue[], updatedCue: Cue) => {
        return cues.map((cue) =>
            cue.targetNumber === updatedCue.targetNumber ? updatedCue : cue,
        );
    };

    const onCuesChanged = (
        cueNumbers: TargetNumber[],
        cueListNumber: TargetNumber,
    ) => {
        if (cueListNumber !== cueListNumber) {
            return;
        }

        for (const cueNumber of cueNumbers) {
            window.api.getCue(cueListNumber, cueNumber).then((cue) => {
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

    useEffect(() => {
        const ipcEventListeners: RemoveEventListenerFunc[] = [
            window.api.onActiveCue(setActiveCueNumber),
            window.api.onCueChange(onCuesChanged),
            // window.api.onGetCuesProgress(setSyncProgress)
        ];

        document.addEventListener('keydown', onKeyDown, false);

        // loadCues();

        (async () => {
            setCueLists(await window.api.getCueLists());
        })();

        return () => {
            for (const removeListener of ipcEventListeners) {
                removeListener();
            }

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

        const editingCue = cues.find(
            (cue) => cue.targetNumber === editingCueNumber,
        );
        setEditingCue(editingCue ?? null);
    }, [cues, editingCueNumber]);

    useEffect(() => {
        const ready = !!editingCue || !!activeCue;

        setReadyToNote(ready);
    }, [activeCue, editingCue]);

    useEffect(() => {
        if (activeCueNumber) {
            const activeCue = cues.find(
                (cue) => cue.targetNumber === activeCueNumber,
            );
            setActiveCue(activeCue ?? null);
        } else {
            setActiveCue(null);
        }
    }, [cues, activeCueNumber]);

    useEffect(() => {
        loadCues();
    }, [cueListNumber]);

    return (
        <div className='flex h-full max-h-full gap-2'>
            <div className='basis-2/3 flex gap-3 flex-col'>
                <div className='grow'>
                    <QuickNoteButtonGrid
                        disabled={!readyToNote}
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
            <div className='basis-1/3 flex flex-col'>
                <div className='grow overflow-hidden'>
                    <CueList
                        cues={cues}
                        loading={loadingCues}
                        activeCueNumber={activeCue?.targetNumber}
                        editingCueNumber={editingCueNumber}
                        focusCueNumber={
                            editingCueNumber || activeCue?.targetNumber
                        }
                        onTriggerClearCue={(cueNumber) =>
                            applyNoteToCue(cueNumber, '')
                        }
                        onTriggerEditCue={editCue}
                    />
                </div>
                <div className='h-10 shrink-0'>
                    <CueListSelect
                        cueLists={cueLists}
                        onCueListSelected={setCueListNumber}
                    />
                </div>
            </div>
        </div>
    );
};

export default CueNoteMain;
