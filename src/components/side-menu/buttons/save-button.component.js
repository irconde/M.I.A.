import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SaveArrowIcon from '../../../icons/side-menu/save-arrow-icon/save-arrow.icon';

import {
    CollapsedButtonContainer,
    SideMenuButtonContainer,
} from './shared/button.styles';

import {
    SaveAsButtonContainer,
    SaveAsDivider,
    SaveButtonContainer,
    SaveButtonFab,
    SaveButtonText,
    SaveIconContainer,
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
    getIsSaveModalOpen,
    saveAsCurrentFile,
    saveCurrentAnnotations,
    updateShowSaveAsModal,
} from '../../../redux/slices/annotation.slice';
import SaveAsIcon from '../../../icons/side-menu/save-as-icon/save-as.icon';
import SavingModal from '../../saving-modal/saving-modal.component';
import GrainIcon from '../../../icons/grain-icon/grain.icon';
import { Channels } from '../../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

/**
 * Component button that allows user to save edited detections and load next files in queue.
 *
 * @component
 *
 *
 */

const SaveButtonComponent = () => {
    const isCollapsed = useSelector(getSideMenuVisible);
    /*const isImageToolsOpen = useSelector(getIsImageToolsOpen);*/
    const annotationChanges = useSelector(getHasAnnotationChanged);
    const isBoundPolyVisible = useSelector(getIsFABVisible);
    const isAnyAnnotations = useSelector(getIsAnyAnnotations);
    const currentFile = useSelector(getCurrFileName);
    const openModal = useSelector(getIsSaveModalOpen);
    const dispatch = useDispatch();

    useEffect(() => {
        ipcRenderer.on(Channels.updateSaveModalStatus, (e, args) => {
            dispatch(updateShowSaveAsModal(args));
        });
    });

    const saveImageClick = () => {
        dispatch(saveCurrentAnnotations(currentFile));
    };

    const saveAsImageClick = () => {
        dispatch(saveAsCurrentFile(currentFile));
    };

    if (isAnyAnnotations) {
        if (!isCollapsed)
            return (
                <Tooltip
                    disableHoverListener={!annotationChanges}
                    title={'Save Annotations'}>
                    <CollapsedButtonContainer
                        $isFaded={!annotationChanges}
                        isCollapsed={isCollapsed}>
                        <SaveButtonFab
                            onClick={() => saveImageClick()}
                            $enabled={annotationChanges}
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
                <>
                    {openModal ? <SavingModal /> : null}
                    <SideMenuButtonContainer id="SaveButtonComponent">
                        <Tooltip title={'Save Annotations'}>
                            <SaveButtonContainer
                                $isFaded={!annotationChanges}
                                enabled={annotationChanges}
                                onClick={() => saveImageClick()}>
                                <SaveIconContainer>
                                    <GrainIcon
                                        width="24px"
                                        height="24px"
                                        color="#fff"
                                    />
                                </SaveIconContainer>
                                <SaveButtonText>Save</SaveButtonText>
                            </SaveButtonContainer>
                        </Tooltip>
                        <SaveAsDivider />
                        <Tooltip title={'Save As'}>
                            <SaveAsButtonContainer
                                $isFaded={!annotationChanges}
                                enabled={annotationChanges}
                                onClick={() => {
                                    saveAsImageClick();
                                }}>
                                <SaveAsIcon
                                    width={'32px'}
                                    height={'32px'}
                                    color={'white'}
                                />
                            </SaveAsButtonContainer>
                        </Tooltip>
                    </SideMenuButtonContainer>
                </>
            );
    } else return null;
};

export default SaveButtonComponent;
