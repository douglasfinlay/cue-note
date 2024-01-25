import { Cue, TargetNumber } from 'eos-console';
import { useEffect, useRef } from 'react';
import CueListItem from './CueListItem';

interface CueListProps {
    activeCueNumber?: TargetNumber | null;
    cues: Cue[];
    editingCueNumber?: TargetNumber | null;
    focusCueNumber?: TargetNumber | null;
    loading?: boolean;
    showParts?: boolean;

    onTriggerClearCue?: (cueNumber: TargetNumber) => void;
    onTriggerEditCue?: (cueNumber: TargetNumber) => void;
    onTriggerGoToCue?: (cueNumber: TargetNumber) => void;
}

function CueList({
    activeCueNumber,
    cues,
    editingCueNumber,
    focusCueNumber,
    loading,
    showParts = false,
    onTriggerClearCue,
    onTriggerEditCue,
    onTriggerGoToCue,
}: CueListProps) {
    if (!showParts) {
        cues = cues.filter((cue) => cue.cuePartIndex === null);
    }

    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToCue = (cueNumber: TargetNumber) => {
        if (!containerRef.current) {
            return;
        }

        const cueIndex = cues.findIndex(
            (cue) => cue.targetNumber === cueNumber,
        );

        if (cueIndex === -1) {
            return;
        }

        const el = containerRef.current?.children[cueIndex] as HTMLElement;

        if (!el) {
            return;
        }

        const top =
            el.offsetTop -
            containerRef.current.offsetTop -
            containerRef.current.clientHeight / 4;

        containerRef.current?.scrollTo({
            top,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        if (focusCueNumber) {
            scrollToCue(focusCueNumber);
        }
    }, [focusCueNumber, cues]);

    if (loading) {
        return (
            <div className='h-full max-h-full min-w-full max-w-full flex flex-col items-center justify-center'>
                <div className='animate-pulse'>Loading cues...</div>
            </div>
        );
    }

    if (!cues.length) {
        return (
            <div className='h-full max-h-full min-w-full max-w-full flex flex-col items-center justify-center'>
                <div>No cues</div>
            </div>
        );
    }

    const cueComponents = cues.map((cue, i) => (
        <CueListItem
            key={i}
            cue={cue}
            active={!!activeCueNumber && cue.targetNumber === activeCueNumber}
            editing={
                !!editingCueNumber && cue.targetNumber === editingCueNumber
            }
            onTriggerClear={
                onTriggerClearCue && (() => onTriggerClearCue(cue.targetNumber))
            }
            onTriggerEdit={
                onTriggerEditCue && (() => onTriggerEditCue(cue.targetNumber))
            }
            onTriggerGoTo={
                onTriggerGoToCue && (() => onTriggerGoToCue(cue.targetNumber))
            }
        />
    ));

    return (
        <div
            className='h-full max-h-full min-w-full max-w-full overflow-y-scroll scrollbar-hidden'
            ref={containerRef}
        >
            {cueComponents}
        </div>
    );
}

export default CueList;
