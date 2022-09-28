import React from 'react';
import { Button, Modal } from '@mui/material';
import {
    ConfirmButton,
    ModalBody,
    ModalSection,
    ModalTitle,
    OutlinedButton,
    SaveIconWrapper,
    StyledInput,
    StyledModal,
} from './import-modal.styles';
import ImagesIcon from '../../icons/import-modal/images-icon/images.icon';
import AnnotationsIcon from '../../icons/import-modal/annotations-icon/annotations.icon';
import SaveArrowIcon from '../../icons/side-menu/save-arrow-icon/save-arrow.icon';

const ImportModalComponent = (props) => {
    const [open, setOpen] = React.useState(true);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
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
                                placeholder={'Path to folder with images'}
                                helperText={''}
                            />
                            <OutlinedButton>Import Images</OutlinedButton>
                        </ModalSection>
                        <ModalSection>
                            <AnnotationsIcon
                                width={'24px'}
                                height={'24px'}
                                color={'white'}
                            />
                            <StyledInput
                                placeholder={'Path to folder with annotations'}
                                helperText={'This field is mandatory'}
                                error
                            />
                            <OutlinedButton>Import Annotations</OutlinedButton>
                        </ModalSection>
                        <ConfirmButton disabled={false}>
                            CONFIRM DATA IMPORT
                            <SaveIconWrapper>
                                <SaveArrowIcon
                                    width={'24px'}
                                    height={'24px'}
                                    color={'white'}
                                />
                            </SaveIconWrapper>
                        </ConfirmButton>
                    </ModalBody>
                </StyledModal>
            </Modal>
        </div>
    );
};

export default ImportModalComponent;
