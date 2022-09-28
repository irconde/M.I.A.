import React from 'react';
import { Button, Modal } from '@mui/material';
import {
    ConfirmButton,
    ModalBody,
    ModalSection,
    ModalTitle,
    StyledModal,
} from './import-modal.styles';

const ImportModalComponent = (props) => {
    const [open, setOpen] = React.useState(false);
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
                        <ModalSection></ModalSection>
                        <ModalSection></ModalSection>
                        <ConfirmButton>CONFIRM DATA IMPORT</ConfirmButton>
                    </ModalBody>
                </StyledModal>
            </Modal>
        </div>
    );
};

export default ImportModalComponent;
