function ConsoleConnection() {
    return (
        <div className='flex'>
            <input
                type='text'
                className='flex-grow px-2 rounded bg-black border border-solid border-eos-yellow'
                placeholder='EOS Console IP Address'
            ></input>

            <button className='px-3 py-1 ml-2 rounded bg-eos-grey-dark border-2 border-solid border-eos-grey-light'>
                Connect
            </button>
        </div>
    );
}

export default ConsoleConnection;
