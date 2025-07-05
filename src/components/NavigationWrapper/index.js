/**
 * Created by fulle on 2025/07/04.
 */
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { eventBus, EVENTS } from '../../events';

const NavigationWrapper = ({ children }) => {
    const location = useLocation();
    const navigationType = useNavigationType();
    const navigationId = useRef(0);

    useEffect(() => {

        // Generate unique ID for this navigation
        const currentNavigationId = ++navigationId.current;
        console.log(`Navigation started (ID: ${currentNavigationId})`);

        /*// Show loading screen when navigation starts
        eventBus.emit(EVENTS.LOADING_SHOW, { source: 'navigation',
            navigationId: currentNavigationId
        });

        // Hide loading screen when navigation completes
        return () => {
            console.log(`Navigation completed (ID: ${currentNavigationId})`);
            window.console.log("Page loaded");
            eventBus.emit(EVENTS.LOADING_HIDE, { source: 'navigation',
                navigationId: currentNavigationId });
        };*/
    }, [location.key, navigationType]);

    return children;
};

export default NavigationWrapper;