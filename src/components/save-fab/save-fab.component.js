import React, { useEffect, useRef, useState } from 'react';
import SaveAsIcon from '../../icons/save-fab/save-as-icon/save-as.icon';
import SaveIcon from '../../icons/save-fab/save-icon/save.icon';
import CloseIcon from '../../icons/shared/close-icon/close.icon';
import FabIcon from '../../icons/save-fab/fab-icon/fab.icon';
import {
    FabBackground,
    FabButton,
    FabItem,
    FabWrapper,
} from './save-fab.styles';
import { useDispatch, useSelector } from 'react-redux';
import { getSideMenuVisible } from '../../redux/slices/ui.slice';
import {
    getHasAnyTempOrCurrentChanged,
    saveAsCurrentFile,
    saveCurrentAnnotations,
} from '../../redux/slices/annotation.slice';
import Tooltip from '@mui/material/Tooltip';

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
    const hasAnnotationsChanged = useSelector(getHasAnyTempOrCurrentChanged);

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
            <Tooltip title={'Save to New File'} placement={'left'}>
                <FabItem
                    index={2}
                    enabled={hasAnnotationsChanged}
                    expanded={isExpanded}
                    onClick={handleSaveAs}>
                    <SaveAsIcon {...iconProps} />
                </FabItem>
            </Tooltip>
            <Tooltip title={'Save Changes'} placement={'left'}>
                <FabItem
                    index={1}
                    enabled={hasAnnotationsChanged}
                    expanded={isExpanded}
                    onClick={handleSave}>
                    <SaveIcon {...iconProps} />
                </FabItem>
            </Tooltip>
            <Tooltip title={'Save'} placement={'left'}>
                <FabButton
                    enabled={hasAnnotationsChanged}
                    expanded={isExpanded}
                    onClick={() => {
                        if (hasAnnotationsChanged) {
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
            </Tooltip>
            <FabBackground />
        </FabWrapper>
    );
};

export default ExpandableFab;
