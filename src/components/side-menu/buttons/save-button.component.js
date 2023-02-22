import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SaveArrowIcon from '../../../icons/side-menu/save-arrow-icon/save-arrow.icon';

import {
    CollapsedButtonContainer,
    SideMenuButtonContainer,
} from './shared/button.styles';

import { SaveButtonFab, SaveButtonText } from './save-button.styles';
import Tooltip from '@mui/material/Tooltip';
import {
    getIsFABVisible,
    getSideMenuVisible,
} from '../../../redux/slices/ui.slice';
import {
    getHasAnnotationChanged,
    saveCurrentAnnotations,
} from '../../../redux/slices/annotation.slice';

/**
 * Component button that allows user to save edited detections and load next files in queue. Similar to NextButtonComponent compnent but for local files only.
 *
 * @component
 *
 *
 */

const SaveButtonComponent = () => {
    const isCollapsed = useSelector(getSideMenuVisible);
    /*const isImageToolsOpen = useSelector(getIsImageToolsOpen);*/
    const detectionChanged = useSelector(getHasAnnotationChanged);
    const isBoundPolyVisible = useSelector(getIsFABVisible);
    const dispatch = useDispatch();

    const saveImageClick = () => {
        dispatch(saveCurrentAnnotations());
    };
    if (!isCollapsed)
        return (
            <Tooltip
                disableHoverListener={!detectionChanged}
                title={'Save Annotations'}>
                <CollapsedButtonContainer
                    $isFaded={!detectionChanged}
                    isCollapsed={isCollapsed}>
                    <SaveButtonFab
                        onClick={() => saveImageClick()}
                        $enabled={detectionChanged}
                        disabled={!isBoundPolyVisible}
                        color="primary">
                        <SaveArrowIcon
                            width="24px"
                            height="24px"
                            color="white"
                        />
                    </SaveButtonFab>
                </CollapsedButtonContainer>
            </Tooltip>
        );
    else
        return (
            <Tooltip title={'Save Annotations'}>
                <SideMenuButtonContainer
                    $isFaded={!detectionChanged}
                    enabled={detectionChanged}
                    onClick={() => saveImageClick()}
                    id="SaveButtonComponent">
                    <SaveArrowIcon width="24px" height="24px" color="white" />
                    <SaveButtonText>Save File</SaveButtonText>
                </SideMenuButtonContainer>
            </Tooltip>
        );
};

export default SaveButtonComponent;
