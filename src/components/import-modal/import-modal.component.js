import React, { useState } from 'react';
import {
    ConfirmButton,
    ModalBody,
    ModalSection,
    modalTheme,
    ModalTitle,
    OutlinedButton,
    SaveIconWrapper,
    StyledInput,
    StyledModal,
} from './import-modal.styles';
import { ThemeProvider } from '@mui/material/styles';
import { Button, Modal } from '@mui/material';
import ImagesIcon from '../../icons/import-modal/images-icon/images.icon';
import AnnotationsIcon from '../../icons/import-modal/annotations-icon/annotations.icon';
import SaveArrowIcon from '../../icons/side-menu/save-arrow-icon/save-arrow.icon';
import { Channels } from '../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

const TYPE = {
    IMAGES: 'images',
    ANNOTATIONS: 'annotations',
};

const ImportModalComponent = (props) => {
    const [open, setOpen] = useState(true);
    const [paths, setPaths] = useState({
        images: '',
        annotations: '',
        isLoading: false,
    });
    const [triedSubmitting, setTriedSubmitting] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleDirPathSelection = async (type) => {
        setPaths({ ...paths, isLoading: true });
        const path = await ipcRenderer.invoke(Channels.showFolderPicker, null);
        updatePaths(path || '', type);
    };

    const updatePaths = (value, type) => {
        switch (type) {
            case TYPE.IMAGES:
                return setPaths({ ...paths, images: value, isLoading: false });
            case TYPE.ANNOTATIONS:
                return setPaths({
                    ...paths,
                    annotations: value,
                    isLoading: false,
                });
            default:
                throw new Error(`Event of type ${type} is unhandled`);
        }
    };

    const handleConfirmBtnClick = async (e) => {
        await ipcRenderer.invoke(Channels.selectDirectory, {
            selectedImagesDirPath: paths.images,
            selectedAnnotationsDirPath: paths.annotations,
        });

        setTriedSubmitting(true);
    };

    const getHelperText = (value) =>
        value.trim() === '' && triedSubmitting ? 'This field is mandatory' : '';

    const shouldDisableSubmit = () =>
        !(paths.annotations.trim() && paths.images.trim());

    return (
        <ThemeProvider theme={modalTheme}>
            <div>
                <Button onClick={handleOpen}>Open modal</Button>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description">
                    <StyledModal>
                        <ModalTitle>SELECT DATA SOURCES</ModalTitle>
                        <ModalBody>
                            <ModalSection>
                                <ImagesIcon
                                    width={'24px'}
                                    height={'24px'}
                                    color={'white'}
                                />
                                <StyledInput
                                    disabled={paths.isLoading}
                                    placeholder={'Path to folder with images'}
                                    helperText={getHelperText(paths.images)}
                                    value={paths.images}
                                    onChange={({ target }) =>
                                        updatePaths(target.value, TYPE.IMAGES)
                                    }
                                    error={
                                        paths.images === '' && triedSubmitting
                                    }
                                />
                                <OutlinedButton
                                    disabled={paths.isLoading}
                                    onClick={() =>
                                        handleDirPathSelection(TYPE.IMAGES)
                                    }>
                                    Import Images
                                </OutlinedButton>
                            </ModalSection>
                            <ModalSection>
                                <AnnotationsIcon
                                    width={'24px'}
                                    height={'24px'}
                                    color={'white'}
                                />
                                <StyledInput
                                    disabled={paths.isLoading}
                                    placeholder={
                                        'Path to folder with annotations'
                                    }
                                    helperText={getHelperText(
                                        paths.annotations
                                    )}
                                    value={paths.annotations}
                                    onChange={({ target }) =>
                                        updatePaths(
                                            target.value,
                                            TYPE.ANNOTATIONS
                                        )
                                    }
                                    error={
                                        paths.annotations === '' &&
                                        triedSubmitting
                                    }
                                />
                                <OutlinedButton
                                    disabled={paths.isLoading}
                                    onClick={() =>
                                        handleDirPathSelection(TYPE.ANNOTATIONS)
                                    }>
                                    Import Annotations
                                </OutlinedButton>
                            </ModalSection>
                            <ConfirmButton
                                onClick={handleConfirmBtnClick}
                                disabled={
                                    shouldDisableSubmit() || paths.isLoading
                                }>
                                CONFIRM DATA IMPORT
                                <SaveIconWrapper>
                                    <SaveArrowIcon
                                        width={'36px'}
                                        height={'36px'}
                                        color={'white'}
                                    />
                                </SaveIconWrapper>
                            </ConfirmButton>
                        </ModalBody>
                    </StyledModal>
                </Modal>
            </div>
        </ThemeProvider>
    );
};

export default ImportModalComponent;
