import React, { useEffect, useRef, useState } from 'react';
import { Channels } from '../../utils/enums/Constants';
import {
    CloseIconWrapper,
    CloseModalBody,
    CloseModalTitle,
    Content,
    ContentText,
    IconWrapper,
    ModalButton,
    ModalButtonRow,
    ModalText,
    ModalWrapper,
} from './close-modal.styles';
import { useDispatch, useSelector } from 'react-redux';
import {
    closeAppAndDontSaveAnnotations,
    closeAppAndSaveAnnotations,
    getHasAnyTempOrCurrentChanged,
} from '../../redux/slices/annotation.slice';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';
import WarningIcon from '../../icons/close-modal/warning-icon/warning.icon';
import FabIcon from '../../icons/close-modal/fab-icon/fab.icon';
import { getAssetsDirPaths } from '../../redux/slices/settings.slice';

const ipcRenderer = window.require('electron').ipcRenderer;
const isWindows = navigator.userAgent.includes('Windows');

function CloseModalComponent() {
    const [isOpen, setIsOpen] = useState(false);
    const annotationsHaveChanged = useSelector(getHasAnyTempOrCurrentChanged);
    const annotationsHaveChangedRef = useRef(annotationsHaveChanged);
    const { selectedAnnotationFile } = useSelector(getAssetsDirPaths);

    const annotationFileName = () => {
        let regex = isWindows ? /.*\\(.*)/ : /.*\/(.*)/;

        const matchResult = selectedAnnotationFile.match(regex);

        if (matchResult !== null) {
            return matchResult[1];
        } else {
            return 'No file name found';
        }
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
                    <CloseModalTitle>
                        UNSAVED ANNOTATIONS
                        <CloseIconWrapper onClick={() => setIsOpen(false)}>
                            <CloseIcon
                                color={'white'}
                                height={'24px'}
                                width={'24px'}
                            />
                        </CloseIconWrapper>
                    </CloseModalTitle>
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
                                    marginTop: '19px',
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
