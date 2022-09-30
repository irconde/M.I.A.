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
import { useDispatch, useSelector } from 'react-redux';
import { getAssetsDirPaths } from '../../redux/slices/settings/settings.slice';

const ipcRenderer = window.require('electron').ipcRenderer;

const TYPE = {
    IMAGES: 'images',
    ANNOTATIONS: 'annotations',
};

const ERROR = {
    MANDATORY: 'Field is mandatory',
    INVALID: 'Directory path is invalid',
    BLANK: '',
};

const ImportModalComponent = (props) => {
    const dispatch = useDispatch();
    const { selectedImagesDirPath, selectedAnnotationsDirPath } =
        useSelector(getAssetsDirPaths);
    const [open, setOpen] = useState(true);
    const [paths, setPaths] = useState({
        images: selectedImagesDirPath,
        annotations: selectedAnnotationsDirPath,
        isLoading: false,
        imagesError: '',
        annotationsError: '',
    });
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
                return setPaths({
                    ...paths,
                    images: value,
                    isLoading: false,
                    imagesError: '',
                });
            case TYPE.ANNOTATIONS:
                return setPaths({
                    ...paths,
                    annotations: value,
                    isLoading: false,
                    annotationsError: '',
                });
            default:
                throw new Error(`Event of type ${type} is unhandled`);
        }
    };

    const handleConfirmBtnClick = async () => {
        const { MANDATORY, INVALID } = ERROR;
        // don't allow importing if no images' dir is selected
        if (paths.images.trim() === '') {
            setPaths({ ...paths, imagesError: MANDATORY });
            return;
        }

        // construct an object of paths to be verified by electron
        const data = {
            selectedImagesDirPath: paths.images,
        };
        const onlyImagesPath = paths.annotations.trim() === '';
        if (!onlyImagesPath) {
            data.selectedAnnotationsDirPath = paths.annotations;
        }
        const result = await ipcRenderer.invoke(Channels.selectDirectory, data);

        // set errors for input fields if either path is invalid
        setPaths({
            ...paths,
            imagesError: result.selectedImagesDirPath ? '' : INVALID,
            annotationsError:
                result.selectedAnnotationsDirPath || onlyImagesPath
                    ? ''
                    : INVALID,
        });

        // update the redux store and close the modal if no errors
        if (
            result.selectedImagesDirPath &&
            (result.selectedAnnotationsDirPath || onlyImagesPath)
        ) {
            handleClose();
        }
    };

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
                                    helperText={paths.imagesError}
                                    value={paths.images}
                                    onChange={({ target }) =>
                                        updatePaths(target.value, TYPE.IMAGES)
                                    }
                                    error={!!paths.imagesError}
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
                                    helperText={paths.annotationsError}
                                    value={paths.annotations}
                                    onChange={({ target }) =>
                                        updatePaths(
                                            target.value,
                                            TYPE.ANNOTATIONS
                                        )
                                    }
                                    error={!!paths.annotationsError}
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
                                    !paths.images.trim() ||
                                    paths.isLoading ||
                                    !!paths.annotationsError ||
                                    !!paths.imagesError
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
