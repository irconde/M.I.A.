import React, { useEffect, useState } from 'react';
import { Channels } from '../../utils/enums/Constants';
import {
    CloseModalBody,
    ModalButton,
    ModalButtonRow,
    ModalText,
    ModalWrapper,
} from './close-modal.styles';
import { useDispatch } from 'react-redux';
import { closeAppAndSaveAnnotations } from '../../redux/slices/annotation.slice';

const ipcRenderer = window.require('electron').ipcRenderer;

function CloseModalComponent() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        ipcRenderer.on(Channels.closeApp, () => setIsOpen(true));
    }, []);

    const handleYes = () => {
        dispatch(closeAppAndSaveAnnotations());
    };

    return (
        <ModalWrapper onClick={() => setIsOpen(false)}>
            {isOpen && (
                <CloseModalBody onClick={(e) => e.stopPropagation()}>
                    <ModalText>
                        You have unsaved changes. Are you sure you want to
                        terminate the app?
                    </ModalText>
                    <ModalButtonRow>
                        <ModalButton onClick={() => setIsOpen(false)}>
                            No
                        </ModalButton>
                        <ModalButton onClick={handleYes}>Yes</ModalButton>
                    </ModalButtonRow>
                </CloseModalBody>
            )}
        </ModalWrapper>
    );
}

CloseModalComponent.propTypes = {};

export default CloseModalComponent;
