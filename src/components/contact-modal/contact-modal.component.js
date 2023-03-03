import { Modal, TextField, ThemeProvider } from '@mui/material';
import {
    ModalRoot,
    modalTheme,
    StyledPaper,
} from '../about-modal/about-modal.styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
    ContactHeader,
    ContactHeaderInfo,
    ContactHeaderParagraph,
    ContactTitle,
    FormContainer,
    FormFieldFull,
    FormFieldShort,
    SubmitButton,
} from './contact-modal.styles';
import LoadingIcon from '../../icons/contact-modal/loading-icon/loading.icon';
import { Channels } from '../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

const ContactModal = ({ open, closeModal }) => {
    const [status, setStatus] = useState({
        success: null,
        submitting: false,
        error: '',
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const formData = new URLSearchParams(form).toString();
        setStatus({
            error: '',
            success: null,
            submitting: true,
        });
        try {
            const { success, error } = await ipcRenderer.invoke(
                Channels.sentFeedbackHTTP,
                formData
            );
            if (error) throw error;
            setStatus({
                error: '',
                success,
                submitting: false,
            });
            if (success) {
                e.target.reset();
                setTimeout(closeModal, 1000);
            }
        } catch (e) {
            setStatus({
                error: e.message || e,
                success: false,
                submitting: false,
            });
            setTimeout(
                () =>
                    setStatus((st) => ({
                        ...st,
                        error: '',
                        success: null,
                    })),
                2000
            );
        }
    };

    return (
        <ThemeProvider theme={modalTheme}>
            <Modal
                open={open}
                onClose={closeModal}
                aria-labelledby="contact-window"
                aria-describedby="send information to the development team">
                <StyledPaper>
                    <ModalRoot>
                        <ContactHeader>
                            <ContactHeaderInfo>
                                <ContactTitle>Contact Us</ContactTitle>
                                <ContactHeaderParagraph error={status.error}>
                                    {status.error
                                        ? status.error
                                        : 'Your feedback will help us improve the user experience.'}
                                </ContactHeaderParagraph>
                            </ContactHeaderInfo>
                        </ContactHeader>
                        <form onSubmit={handleSubmit}>
                            <FormContainer>
                                <FormFieldShort>
                                    <TextField
                                        required={true}
                                        name={'First Name'}
                                        variant={'outlined'}
                                        placeholder={'First Name'}
                                    />
                                </FormFieldShort>
                                <FormFieldShort>
                                    <TextField
                                        required={true}
                                        name={'Last Name'}
                                        variant={'outlined'}
                                        placeholder={'Last Name'}
                                    />
                                </FormFieldShort>
                                <FormFieldFull>
                                    <TextField
                                        type={'email'}
                                        required={true}
                                        name={'Email'}
                                        variant={'outlined'}
                                        placeholder={'Email'}
                                    />
                                </FormFieldFull>
                                <FormFieldFull>
                                    <TextField
                                        required={true}
                                        name={'Institution Name'}
                                        variant={'outlined'}
                                        placeholder={'Institution Name'}
                                    />
                                </FormFieldFull>
                                <FormFieldFull>
                                    <TextField
                                        required={true}
                                        name={'Institution Website'}
                                        variant={'outlined'}
                                        placeholder={'Institution Website'}
                                    />
                                </FormFieldFull>
                                <FormFieldFull>
                                    <TextField
                                        required={true}
                                        name={'Description'}
                                        variant={'outlined'}
                                        placeholder={'Description'}
                                        multiline={true}
                                        rows={4}
                                    />
                                </FormFieldFull>
                                <SubmitButton
                                    $success={status.success}
                                    $submitting={status.submitting}
                                    type={'submit'}
                                    variant="contained">
                                    {status.submitting ? (
                                        <LoadingIcon
                                            width={'24px'}
                                            height={'24px'}
                                            color={'white'}
                                        />
                                    ) : status.success === null ? (
                                        'SUBMIT'
                                    ) : status.success ? (
                                        'SENT'
                                    ) : (
                                        'FAILED'
                                    )}
                                </SubmitButton>
                            </FormContainer>
                        </form>
                    </ModalRoot>
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
