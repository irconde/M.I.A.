import React from 'react';
import { Button, Input, Modal } from '@mui/material';
import {
    ConfirmButton,
    ModalBody,
    ModalSection,
    ModalTitle,
    StyledModal,
} from './import-modal.styles';
import ImagesIcon from '../../icons/import-modal/images-icon/images.icon';
import AnnotationsIcon from '../../icons/import-modal/annotations-icon/annotations.icon';

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
                            <Input />
                            <Button>Import Images</Button>
                        </ModalSection>
                        <ModalSection>
                            <AnnotationsIcon
                                width={'24px'}
                                height={'24px'}
                                color={'white'}
                            />
                            <Input />
                            <Button>Import Annotations</Button>
                        </ModalSection>
                        <ConfirmButton>CONFIRM DATA IMPORT</ConfirmButton>
                    </ModalBody>
                </StyledModal>
            </Modal>
        </div>
    );
};

export default ImportModalComponent;
