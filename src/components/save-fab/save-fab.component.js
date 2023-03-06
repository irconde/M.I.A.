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
import { useSelector } from 'react-redux';
import { getSideMenuVisible } from '../../redux/slices/ui.slice';

const iconProps = {
    width: '24px',
    height: '24px',
    color: 'white',
};

const ExpandableFab = () => {
    const sideMenuVisible = useSelector(getSideMenuVisible);
    const [isExpanded, setIsExpanded] = useState(false);
    const fabRef = useRef(null);

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
        console.log('Save');
    };

    const handleSaveAs = () => {
        console.log('Save As');
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
                expanded={isExpanded}
                onClick={handleFabClick}
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
