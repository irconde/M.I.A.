import React, { useEffect, useRef, useState } from 'react';
import SaveAsIcon from '../../icons/save-fab/save-as-icon/save-as.icon';
import SaveIcon from '../../icons/save-fab/save-icon/save.icon';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';
import FabIcon from '../../icons/save-fab/fab-icon/fab.icon';
import {
    FabButton,
    FabWrapper,
    SaveAsFabBtn,
    SaveFabBtn,
} from './save-fab.styles';
import { useDispatch, useSelector } from 'react-redux';
import { getSideMenuVisible } from '../../redux/slices/ui.slice';
import {
    getHasAllAnnotationsDeleted,
    getHasAnnotationChanged,
    saveAsCurrentFile,
    saveCurrentAnnotations,
} from '../../redux/slices/annotation.slice';

const iconProps = {
    width: '24px',
    height: '24px',
    color: 'white',
};

const ExpandableFab = () => {
    const sideMenuVisible = useSelector(getSideMenuVisible);
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(false);
    const fabRef = useRef(null);
    const hasAnnotationsChanged = useSelector(getHasAnnotationChanged);
    const hasAllAnnotationsDeleted = useSelector(getHasAllAnnotationsDeleted);
    const enabled = hasAnnotationsChanged || hasAllAnnotationsDeleted;

    useEffect(() => {
        // only add the click listener to the document when the fab is open
        if (!isExpanded) return;

        // if clicked on outside of element
        function handleClickOutside(event) {
            if (fabRef.current && !fabRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const handleFabClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSave = () => {
        dispatch(saveCurrentAnnotations());
    };

    const handleSaveAs = () => {
        dispatch(saveAsCurrentFile());
    };

    return (
        <FabWrapper show={!sideMenuVisible}>
            <SaveAsFabBtn
                index={2}
                expanded={isExpanded}
                onClick={handleSaveAs}>
                <SaveAsIcon {...iconProps} />
            </SaveAsFabBtn>
            <SaveFabBtn index={1} expanded={isExpanded} onClick={handleSave}>
                <SaveIcon {...iconProps} />
            </SaveFabBtn>
            <FabButton
                enabled={enabled}
                expanded={isExpanded}
                onClick={() => {
                    if (enabled) {
                        handleFabClick();
                    }
                }}
                ref={fabRef}>
                {isExpanded ? (
                    <CloseIcon {...iconProps} />
                ) : (
                    <FabIcon {...iconProps} />
                )}
            </FabButton>
        </FabWrapper>
    );
};

export default ExpandableFab;
