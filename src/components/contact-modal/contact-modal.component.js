import { Modal, ThemeProvider } from '@mui/material';
import {
    ModalRoot,
    modalTheme,
    StyledPaper,
} from '../about-modal/about-modal.styles';
import PropTypes from 'prop-types';
import React from 'react';

const ContactModal = ({ open, closeModal }) => {
    return (
        <ThemeProvider theme={modalTheme}>
            <Modal
                open={open}
                onClose={closeModal}
                aria-labelledby="contact-window"
                aria-describedby="send information to the development team">
                <StyledPaper>
                    <ModalRoot>Hello</ModalRoot>
                </StyledPaper>
            </Modal>
        </ThemeProvider>
    );
};

ContactModal.propTypes = {
    open: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
};

export default ContactModal;
