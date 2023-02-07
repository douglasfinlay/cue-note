import Cue from './Cue';

function CueList() {
    const cues = [
        {
            number: '0.5',
            label: 'Preset',
        },
        {
            number: '1',
            label: 'Houselights Out',
        },
        {
            number: '2',
            label: '== Walk This Way ==',
        },
        {
            number: '3',
            label: 'Verse',
            note: 'Add more downstage fill',
        },
        {
            number: '3.5',
            label: 'Chorus',
        },
        {
            number: '3.7',
            label: 'Company D/S',
        },
        {
            number: '4',
            label: 'Snap to Mark',
            note: 'Special Focus',
        },
        {
            number: '5',
            label: 'Restore',
        },
        {
            number: '6',
            label: 'Add BVs',
            note: 'Live Move',
        },
        {
            number: '7',
            label: 'Final Chorus',
        },
        {
            number: '8',
            label: 'END',
            note: 'Tidy Button Focus',
        },
        {
            number: '0.5',
            label: 'Preset',
        },
        {
            number: '1',
            label: 'Houselights Out',
        },
        {
            number: '2',
            label: '== Walk This Way ==',
        },
        {
            number: '3',
            label: 'Verse',
            note: 'Add more downstage fill',
        },
        {
            number: '3.5',
            label: 'Chorus',
        },
        {
            number: '3.7',
            label: 'Company D/S',
        },
        {
            number: '4',
            label: 'Snap to Mark',
            note: 'Special Focus',
        },
        {
            number: '5',
            label: 'Restore',
        },
        {
            number: '6',
            label: 'Add BVs',
            note: 'Live Move',
        },
        {
            number: '7',
            label: 'Final Chorus',
        },
        {
            number: '8',
            label: 'END',
            note: 'Tidy Button Focus',
        },
        {
            number: '0.5',
            label: 'Preset',
        },
        {
            number: '1',
            label: 'Houselights Out',
        },
        {
            number: '2',
            label: '== Walk This Way ==',
        },
        {
            number: '3',
            label: 'Verse',
            note: 'Add more downstage fill',
        },
        {
            number: '3.5',
            label: 'Chorus',
        },
        {
            number: '3.7',
            label: 'Company D/S',
        },
        {
            number: '4',
            label: 'Snap to Mark',
            note: 'Special Focus',
        },
        {
            number: '5',
            label: 'Restore',
        },
        {
            number: '6',
            label: 'Add BVs',
            note: 'Live Move',
        },
        {
            number: '7',
            label: 'Final Chorus',
        },
        {
            number: '8',
            label: 'END',
            note: 'Tidy Button Focus',
        },
        {
            number: '0.5',
            label: 'Preset',
        },
        {
            number: '1',
            label: 'Houselights Out',
        },
        {
            number: '2',
            label: '== Walk This Way ==',
        },
        {
            number: '3',
            label: 'Verse',
            note: 'Add more downstage fill',
        },
        {
            number: '3.5',
            label: 'Chorus',
        },
        {
            number: '3.7',
            label: 'Company D/S',
        },
        {
            number: '4',
            label: 'Snap to Mark',
            note: 'Special Focus',
        },
        {
            number: '5',
            label: 'Restore',
        },
        {
            number: '6',
            label: 'Add BVs',
            note: 'Live Move',
        },
        {
            number: '7',
            label: 'Final Chorus',
        },
        {
            number: '8',
            label: 'END',
            note: 'Tidy Button Focus',
        },
    ];

    const cueComponents = cues.map((cue, i) => (
        <Cue key={i} cue={cue} current={cue.number === '1'} />
    ));

    return <div>{cueComponents}</div>;
}

export default CueList;
