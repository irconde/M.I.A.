import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SaveArrowIcon from '../../../icons/side-menu/save-arrow-icon/save-arrow.icon';

import {
    CollapsedButtonContainer,
    SideMenuButtonContainer,
} from './shared/button.styles';

import {
    SaveAsButtonContainer,
    SaveButtonContainer,
    SaveButtonFab,
    SaveButtonText,
} from './save-button.styles';
import Tooltip from '@mui/material/Tooltip';
import {
    getCurrFileName,
    getIsFABVisible,
    getSideMenuVisible,
} from '../../../redux/slices/ui.slice';
import {
    getHasAnnotationChanged,
    getIsAnyAnnotations,
    saveCurrentAnnotations,
} from '../../../redux/slices/annotation.slice';
import SaveAsIcon from '../../../icons/side-menu/save-as-icon/save-as.icon';

/**
 * Component button that allows user to save edited detections and load next files in queue. Similar to
 * NextButtonComponent compnent but for local files only.
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
    const isAnyAnnotations = useSelector(getIsAnyAnnotations);
    const currentFile = useSelector(getCurrFileName);
    const dispatch = useDispatch();

    const saveImageClick = () => {
        dispatch(saveCurrentAnnotations(currentFile));
    };

    if (isAnyAnnotations) {
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
                <SideMenuButtonContainer
                    // $isFaded={!detectionChanged}
                    enabled={detectionChanged}
                    id="SaveButtonComponent">
                    <Tooltip title={'Save Annotations'}>
                        <SaveButtonContainer onClick={() => saveImageClick()}>
                            <SaveButtonText>Save</SaveButtonText>
                        </SaveButtonContainer>
                    </Tooltip>
                    <Tooltip title={'Save As'}>
                        <SaveAsButtonContainer onClick={() => saveImageClick()}>
                            <SaveAsIcon
                                width={'32px'}
                                height={'32px'}
                                color={'white'}
                            />
                        </SaveAsButtonContainer>
                    </Tooltip>
                </SideMenuButtonContainer>
            );
    } else return null;
};

export default SaveButtonComponent;
