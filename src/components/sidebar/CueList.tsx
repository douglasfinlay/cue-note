import { Cue } from '../../models/eos';
import CueListItem from './CueListItem';

interface CueListProps {
    cues: Cue[];
}

function CueList({ cues }: CueListProps) {
    const cueComponents = cues.map((cue, i) => (
        <CueListItem key={i} cue={cue} current={cue.cueNumber === '1'} />
    ));

    return <div>{cueComponents}</div>;
}

export default CueList;
