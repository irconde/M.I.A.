import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    ModalBody,
    ModalSection,
    modalTheme,
    ModalTitle,
    OutlinedButton,
    StyledInput,
    StyledModal,
} from './import-modal.styles';
import { ThemeProvider } from '@mui/material/styles';
import { Modal } from '@mui/material';
import ImagesIcon from '../../icons/import-modal/images-icon/images.icon';
import AnnotationsIcon from '../../icons/import-modal/annotations-icon/annotations.icon';
import { Channels } from '../../utils/enums/Constants';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAssetsDirPaths,
    updateSettings,
} from '../../redux/slices/settings.slice';
import ImportButtonComponent from './import-button/import-button.component';

const ipcRenderer = window.require('electron').ipcRenderer;

const TYPE = {
    IMAGES: 'images',
    ANNOTATIONS: 'annotations',
    CANCEL: 'cancel',
};

const ERROR = {
    MANDATORY: 'Field is mandatory',
    INVALID: 'Directory path is invalid',
    BLANK: '',
};

const ImportModalComponent = ({ open, setOpen }) => {
    const dispatch = useDispatch();
    const { selectedImagesDirPath, selectedAnnotationFile } =
        useSelector(getAssetsDirPaths);
    const [paths, setPaths] = useState({
        images: selectedImagesDirPath || '',
        annotations: selectedAnnotationFile || '',
        isLoading: false,
        imagesError: '',
        annotationsError: '',
    });

    const handleClose = () => selectedImagesDirPath && setOpen(false);
    useEffect(() => {
        if (selectedAnnotationFile !== paths.annotations) {
            setPaths({
                ...paths,
                annotations: selectedAnnotationFile,
            });
        }
    }, [selectedAnnotationFile]);

    const handleDirPathSelection = async (type) => {
        setPaths({ ...paths, isLoading: true });
        const path = await ipcRenderer.invoke(Channels.showFolderPicker, type);
        // if event is cancelled, then the path is null
        updatePaths(path, path === null ? TYPE.CANCEL : type);
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
            case TYPE.CANCEL:
                return setPaths({ ...paths, isLoading: false });
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
        const onlyImagesPath = paths.annotations === '';
        if (!onlyImagesPath) {
            data.selectedAnnotationFile = paths.annotations;
        }
        const result = await ipcRenderer.invoke(
            Channels.verifyDirectories,
            data
        );

        // set errors for input fields if either path is invalid
        setPaths({
            ...paths,
            imagesError: result.selectedImagesDirPath ? '' : INVALID,
            annotationsError: false,
        });

        // update the redux store and close the modal if no errors
        if (result.selectedImagesDirPath) {
            dispatch(
                updateSettings({
                    selectedImagesDirPath: paths.images,
                    selectedAnnotationFile: paths.annotations,
                })
            ).then();
        }
    };

    return (
        <ThemeProvider theme={modalTheme}>
            <div>
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
                            <ImportButtonComponent
                                handleClick={handleConfirmBtnClick}
                                setOpen={setOpen}
                                paths={paths}
                            />
                        </ModalBody>
                    </StyledModal>
                </Modal>
            </div>
        </ThemeProvider>
    );
};

ImportModalComponent.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
};

export default ImportModalComponent;
