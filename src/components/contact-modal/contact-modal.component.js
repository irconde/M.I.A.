import { Modal, TextField, ThemeProvider } from '@mui/material';
import {
    CloseIconWrapper,
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
    RequiredLabel,
    SubmitButton,
} from './contact-modal.styles';
import LoadingIcon from '../../icons/contact-modal/loading-icon/loading.icon';
import { Channels } from '../../utils/enums/Constants';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';

const ipcRenderer = window.require('electron').ipcRenderer;

const FIELDS = [
    {
        name: 'First Name',
        placeholder: 'First Name',
        sm: true,
    },
    {
        name: 'Last Name',
        placeholder: 'Last Name',
        sm: true,
    },
    { name: 'Email', type: 'email', placeholder: 'Email' },
    {
        name: 'Institution Name',
        placeholder: 'Institution Name',
    },
    {
        name: 'Institution Website',
        required: false,
        placeholder: 'Institution Website',
    },
    {
        name: 'Description',
        placeholder: 'Description',
        multiline: true,
        rows: 4,
    },
];

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
                            <CloseIconWrapper
                                onClick={closeModal}
                                style={{ position: 'absolute', right: 0 }}>
                                <CloseIcon
                                    width={'32px'}
                                    height={'32px'}
                                    color={'white'}
                                />
                            </CloseIconWrapper>
                        </ContactHeader>
                        <form onSubmit={handleSubmit}>
                            <FormContainer>
                                {FIELDS.map(
                                    ({
                                        required = true,
                                        name,
                                        placeholder,
                                        variant = 'outlined',
                                        type = 'text',
                                        multiline = false,
                                        rows = 1,
                                        sm = false,
                                    }) => {
                                        const textField = (
                                            <TextField
                                                required={required}
                                                name={name}
                                                placeholder={`${placeholder}${
                                                    required ? '*' : ''
                                                }`}
                                                variant={variant}
                                                type={type}
                                                multiline={multiline}
                                                rows={rows}
                                                onChange={() =>
                                                    setStatus({
                                                        ...status,
                                                        error: '',
                                                    })
                                                }
                                            />
                                        );
                                        return sm ? (
                                            <FormFieldShort key={name}>
                                                {textField}
                                            </FormFieldShort>
                                        ) : (
                                            <FormFieldFull key={name}>
                                                {textField}
                                            </FormFieldFull>
                                        );
                                    }
                                )}
                                <RequiredLabel>* required</RequiredLabel>
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
