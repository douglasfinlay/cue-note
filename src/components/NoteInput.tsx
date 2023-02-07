function NoteInput() {
    const text =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce accumsan ullamcorper diam nec sollicitudin. Vivamus imperdiet orci vitae augue tempus laoreet. Phasellus id justo sed arcu pulvinar feugiat. Aliquam tincidunt dui quam, non ultricies orci placerat vitae. Phasellus sed diam dignissim, faucibus justo congue, tincidunt augue. Vivamus nulla enim, tincidunt nec finibus vitae, consequat at augue. Morbi congue sed orci sed luctus. In hac habitasse platea dictumst. Etiam at dolor et ligula semper sodales.';

    return (
        <textarea
            className='h-full w-full px-3 py-2 text-lg align-top rounded bg-black border border-solid border-eos-yellow resize-none'
            defaultValue={text}
        ></textarea>
    );
}

export default NoteInput;
