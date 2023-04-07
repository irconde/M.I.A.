import React, { useRef } from 'react';
import {
    getAnnotationContextVisible,
    getEditLabelVisible,
    updateAnnotationContextVisibility,
    updateEditLabelVisibility,
} from '../../redux/slices/ui.slice';
import { useDispatch, useSelector } from 'react-redux';

function useWidgetsManager() {
    const isEditLabelVisible = useSelector(getEditLabelVisible);
    const isAnnotationContextVisible = useSelector(getAnnotationContextVisible);
    const dispatch = useDispatch();
    const widgetsDisplay = useRef({
        timeout: null,
        pending: {
            context: false,
            text: false,
        },
        clientX: 0,
        clientY: 0,
    });

    const handleWheel = () => {
        if (isEditLabelVisible) {
            dispatch(updateEditLabelVisibility(false));
            widgetsDisplay.current.pending.text = true;
        }

        if (isAnnotationContextVisible) {
            dispatch(updateAnnotationContextVisibility(false));
            widgetsDisplay.current.pending.context = true;
        }

        const { text, context } = widgetsDisplay.current.pending;
        if (text || context) {
            clearTimeout(widgetsDisplay.current.timeout);
            widgetsDisplay.current.timeout = setTimeout(() => {
                // runs when done scrolling
                text && dispatch(updateEditLabelVisibility(true));
                context && dispatch(updateAnnotationContextVisibility(true));
                widgetsDisplay.current.pending = {
                    text: false,
                    context: false,
                };
            }, 300);
        }
    };

    // step 1: if a widget is visible, save the mouse position
    const handleMouseDown = ({ clientX, clientY }) => {
        if (!isEditLabelVisible && !isAnnotationContextVisible) return;

        widgetsDisplay.current.clientX = clientX;
        widgetsDisplay.current.clientY = clientY;
        widgetsDisplay.current.pending = {
            text: isEditLabelVisible,
            context: isAnnotationContextVisible,
        };
        isEditLabelVisible && dispatch(updateEditLabelVisibility(false));
        isAnnotationContextVisible &&
            dispatch(updateAnnotationContextVisibility(false));
    };

    // step 2: if the mouse position is different then we have a drag event
    const handleMouseUp = (e) => {
        const { clientX, clientY, pending } = widgetsDisplay.current;
        if (e.clientX !== clientX || e.clientY !== clientY) {
            pending.text && dispatch(updateEditLabelVisibility(true));
            pending.context &&
                dispatch(updateAnnotationContextVisibility(true));
        }
        widgetsDisplay.current.pending = { text: false, context: false };
    };

    return [handleWheel, handleMouseDown, handleMouseUp];
}

export default useWidgetsManager;
