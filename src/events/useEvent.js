/**
 * Created by fulle on 2025/07/04.
 */
import { useEffect } from 'react';
import eventBus from './eventBus';

const useEvent = (event, callback, dependencies = []) => {
    useEffect(() => {
        const unsubscribe = eventBus.on(event, callback);
        return () => unsubscribe();
    }, [event, ...dependencies]);
};

export default useEvent;