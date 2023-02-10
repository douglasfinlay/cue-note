import { useEffect, useRef } from 'react';
import { Cue } from '../../models/eos';
import CueListItem from './CueListItem';

interface CueListProps {
    activeCueNumber?: string;
    cues: Cue[];
    showParts?: boolean;
}

function CueList({ activeCueNumber, cues, showParts = false }: CueListProps) {
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
        if (activeCueNumber) {
            scrollToCue(activeCueNumber);
        }
    }, [activeCueNumber, cues]);

    const cueComponents = cues.map((cue, i) => (
        <CueListItem
            key={i}
            cue={cue}
            current={cue.cueNumber === activeCueNumber}
        />
    ));

    return (
        <div className='max-h-full overflow-y-scroll' ref={containerRef}>
            {cueComponents}
        </div>
    );
}

export default CueList;
