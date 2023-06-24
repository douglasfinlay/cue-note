import { useState, useEffect, Dispatch, SetStateAction } from 'react';

const useLocalStorage = <T>(
    key: string,
    initialValue: T,
): [T, Dispatch<SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        const item = localStorage.getItem(key);

        if (item === null) {
            return initialValue;
        }

        try {
            return JSON.parse(item) ?? initialValue;
        } catch (err) {
            console.warn(`Failed to parse "${key}" from localStorage: ${err}`);
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);

    return [value, setValue];
};

export default useLocalStorage;
