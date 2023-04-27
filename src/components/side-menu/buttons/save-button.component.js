import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    SaveAsButtonContainer,
    SaveButtonContainer,
    SaveButtonText,
    SaveIconContainer,
    SideMenuButtonContainer,
} from './save-button.styles';
import Tooltip from '@mui/material/Tooltip';
import {
    getHasAnyTempOrCurrentChanged,
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
    const annotationChanges = useSelector(getHasAnyTempOrCurrentChanged);
    const openModal = useSelector(getIsSaveModalOpen);
    const dispatch = useDispatch();

    useEffect(() => {
        ipcRenderer.on(Channels.updateSaveModalStatus, (e, args) => {
            dispatch(updateShowSaveAsModal(args));
        });
    });

    const saveImageClick = () => {
        dispatch(saveCurrentAnnotations());
    };

    const saveAsImageClick = () => {
        dispatch(saveAsCurrentFile());
    };

    return (
        <>
            {openModal ? <SavingModal /> : null}
            <SideMenuButtonContainer
                id="SaveButtonComponent"
                disabled={!annotationChanges}>
                <Tooltip title={'Save Annotations'}>
                    <SaveButtonContainer onClick={saveImageClick}>
                        <SaveIconContainer>
                            <SaveButtonText>Save</SaveButtonText>
                            <GrainIcon
                                width="24px"
                                height="24px"
                                color="#fff"
                            />
                        </SaveIconContainer>
                    </SaveButtonContainer>
                </Tooltip>
                <Tooltip title={'Save As'}>
                    <SaveAsButtonContainer onClick={saveAsImageClick}>
                        <SaveAsIcon
                            width={'24px'}
                            height={'24px'}
                            color={'white'}
                        />
                    </SaveAsButtonContainer>
                </Tooltip>
            </SideMenuButtonContainer>
        </>
    );
};

export default SaveButtonComponent;
