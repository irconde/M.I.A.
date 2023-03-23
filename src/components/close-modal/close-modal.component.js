import React, { useEffect, useRef, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import {
    closeAppAndSaveAnnotations,
    closeAppAndDontSaveAnnotations,
    getHasAnyTempOrCurrentChanged,
} from '../../redux/slices/annotation.slice';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';
import WarningIcon from '../../icons/close-modal/warning-icon/warning.icon';
import FabIcon from '../../icons/close-modal/fab-icon/fab.icon';
import { getAssetsDirPaths } from '../../redux/slices/settings.slice';

const ipcRenderer = window.require('electron').ipcRenderer;

function CloseModalComponent() {
    const [isOpen, setIsOpen] = useState(false);
    const annotationsHaveChanged = useSelector(getHasAnyTempOrCurrentChanged);
    const annotationsHaveChangedRef = useRef(annotationsHaveChanged);
    const { selectedAnnotationFile } = useSelector(getAssetsDirPaths);
    const annotationFileName = () => {
        let tempPath = selectedAnnotationFile.replace(/\\/g, '\\\\');
        return `${tempPath.match(/.*\\(.*)/)[1]}`;
    };
    const dispatch = useDispatch();

    useEffect(() => {
        annotationsHaveChangedRef.current = annotationsHaveChanged;
    }, [annotationsHaveChanged]);

    useEffect(() => {
        ipcRenderer.on(Channels.closeApp, () =>
            annotationsHaveChangedRef.current
                ? setIsOpen(true)
                : handleDontSave()
        );
    }, [annotationsHaveChangedRef]);

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
                                <strong>{annotationFileName()}</strong> before
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
