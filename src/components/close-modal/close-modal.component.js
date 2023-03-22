import React, { useEffect, useState } from 'react';
import { Channels } from '../../utils/enums/Constants';
import {
    CloseModalBody,
    CloseModalTitle,
    Content,
    ContentText,
    Divider,
    CloseIconWrapper,
    ModalButton,
    ModalButtonRow,
    ModalText,
    ModalWrapper,
    IconWrapper,
} from './close-modal.styles';
import { useDispatch } from 'react-redux';
import {
    closeAppAndSaveAnnotations,
    closeAppAndDontSaveAnnotations,
} from '../../redux/slices/annotation.slice';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';
import WarningIcon from '../../icons/close-modal/warning-icon/warning.icon';
import FabIcon from '../../icons/close-modal/fab-icon/fab.icon';

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

    const handleDontSave = () => {
        dispatch(closeAppAndDontSaveAnnotations());
    };

    return (
        <ModalWrapper>
            {isOpen && (
                <CloseModalBody onClick={(e) => e.stopPropagation()}>
                    <CloseModalTitle>UNSAVED ANNOTATIONS</CloseModalTitle>
                    <CloseIconWrapper onClick={() => setIsOpen(false)}>
                        <CloseIcon
                            color={'white'}
                            height={'24px'}
                            width={'24px'}
                        />
                    </CloseIconWrapper>
                    <Divider />
                    <Content>
                        <IconWrapper>
                            <WarningIcon
                                width={'100px'}
                                height={'88px'}
                                color={'#ffcb00'}
                            />
                            <FabIcon
                                width={'39px'}
                                height={'39px'}
                                color={'#ffffff'}
                            />
                            <FabIcon
                                width={'39px'}
                                height={'39px'}
                                color={'rgba(0,0,0,0.7)'}
                            />
                        </IconWrapper>
                        <ContentText>
                            <ModalText>
                                Save new annotations to{' '}
                                {/* //TODO: use annotation file name */}
                                <strong>annotations-01.json</strong> before
                                closing?
                            </ModalText>
                            <ModalText
                                style={{
                                    fontSize: '14px',
                                }}>
                                If you don’t save them, they will be lost.
                            </ModalText>
                        </ContentText>
                    </Content>
                    <ModalButtonRow>
                        {/* //TODO: implement functionality for dont save button*/}
                        <ModalButton
                            onClick={
                                handleDontSave
                            }>{`Don't Save`}</ModalButton>
                        <ModalButton onClick={() => setIsOpen(false)}>
                            Cancel
                        </ModalButton>
                        <ModalButton onClick={handleYes}>Save</ModalButton>
                    </ModalButtonRow>
                </CloseModalBody>
            )}
        </ModalWrapper>
    );
}

CloseModalComponent.propTypes = {};

export default CloseModalComponent;
