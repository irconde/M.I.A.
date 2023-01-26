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

const FORM_URL =
    'https://script.google.com/macros/s/AKfycbzlhA1q21UnuKDTkIqm7iZ-yKmAHCRmoUUTdKATipwV62ih9CZWCbP6tLaRc5c6F_T7Qg/exec';

const ContactModal = ({ open, closeModal }) => {
    const [status, setStatus] = useState({
        success: null,
        submitting: false,
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const formData = new URLSearchParams(form).toString();
        setStatus({
            success: null,
            submitting: true,
        });
        try {
            const result = await fetch(FORM_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                body: formData,
            });
            const success = result.status === 200;
            setStatus({
                success,
                submitting: false,
            });
            if (success) {
                e.target.reset();
                setTimeout(closeModal, 1000);
            }
        } catch (e) {
            setStatus({
                success: false,
                submitting: false,
            });
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
                                <ContactHeaderParagraph>
                                    Your feedback will help us improve the user
                                    experience.
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
