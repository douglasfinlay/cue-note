import { useEffect, useRef } from 'react';
import { Cue } from '../../models/eos';
import CueListItem from './CueListItem';

interface CueListProps {
    activeCueNumber?: string | null;
    cues: Cue[];
    editingCueNumber?: string | null;
    focusCueNumber?: string | null;
    showParts?: boolean;
    onTriggerClearCue?: (cueNumber: string) => void;
    onTriggerEditCue?: (cueNumber: string) => void;
    onTriggerGoToCue?: (cueNumber: string) => void;
}

function CueList({
    activeCueNumber,
    cues,
    editingCueNumber,
    focusCueNumber,
    showParts = false,
    onTriggerClearCue,
    onTriggerEditCue,
    onTriggerGoToCue,
}: CueListProps) {
    if (!showParts) {
        cues = cues.filter((cue) => !cue.isPart);
    }

    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToCue = (cueNumber: string) => {
        if (!containerRef.current) {
            return;
        }

        const cueIndex = cues.findIndex((cue) => cue.cueNumber === cueNumber);

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

    const cueComponents = cues.map((cue, i) => (
        <CueListItem
            key={i}
            cue={cue}
            active={!!activeCueNumber && cue.cueNumber === activeCueNumber}
            editing={!!editingCueNumber && cue.cueNumber === editingCueNumber}
            onTriggerClear={
                onTriggerClearCue && (() => onTriggerClearCue(cue.cueNumber))
            }
            onTriggerEdit={
                onTriggerEditCue && (() => onTriggerEditCue(cue.cueNumber))
            }
            onTriggerGoTo={
                onTriggerGoToCue && (() => onTriggerGoToCue(cue.cueNumber))
            }
        />
    ));

    return (
        <div className='max-h-full overflow-y-scroll' ref={containerRef}>
            {cueComponents}
        </div>
    );
}

export default CueList;
