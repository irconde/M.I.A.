import { Modal, ThemeProvider } from '@mui/material';
import { modalTheme } from '../about-modal/about-modal.styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
    CloseIconWrapper,
    ContactTitle,
    FooterText,
    FormField,
    ModalIcon,
    StyledForm,
    StyledInput,
    StyledPaper,
    StyledRow,
    SubmitButton,
} from './contact-modal.styles';
import { Channels } from '../../utils/enums/Constants';
import CloseIcon from '../../icons/shared/close-icon/close.icon';
import { CONTACT_MODAL_ROWS } from './rows';
import SendIcon from '../../icons/contact-modal/send-icon/send.icon';
import useValidate from './useValidate';
import SpinnerIcon from '../../icons/shared/spinner-icon/spinner.icon';
import CheckMarkIcon from '../../icons/shared/check-mark-icon/check-mark.icon';
import ErrorIcon from '../../icons/contact-modal/error-icon/error.icon';

const ipcRenderer = window.require('electron').ipcRenderer;

const iconProps = { width: '20px', height: '20px', color: 'white' };

const ContactModal = ({ open, closeModal }) => {
    const [status, setStatus] = useState({
        success: null,
        submitting: false,
        error: '',
    });
    const [error, validate, resetError] = useValidate();

    const handleClose = () => {
        if (!status.submitting) closeModal();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status.submitting || !validate(e.target)) return;
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
            e.target.reset();
            setTimeout(closeModal, 1000);
        } catch (e) {
            setStatus({
                error: e.message || e,
                success: false,
                submitting: false,
            });
        } finally {
            setTimeout(
                () =>
                    setStatus({
                        submitting: false,
                        error: '',
                        success: null,
                    }),
                2000
            );
        }
    };

    const getDisabled = () =>
        !!(status.submitting || status.success || status.error);

    return (
        <ThemeProvider theme={modalTheme}>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="contact-window"
                aria-describedby="send information to the development team">
                <StyledPaper>
                    <ContactTitle>
                        CONTACT US
                        <CloseIconWrapper onClick={handleClose}>
                            <CloseIcon
                                width={'24px'}
                                height={'24px'}
                                color={'white'}
                            />
                        </CloseIconWrapper>
                    </ContactTitle>

                    <StyledForm
                        onSubmit={handleSubmit}
                        disabled={getDisabled()}>
                        {CONTACT_MODAL_ROWS.map(({ Icon, inputs }, i) => (
                            <StyledRow key={i}>
                                {Icon && (
                                    <ModalIcon>
                                        <Icon {...iconProps} />
                                    </ModalIcon>
                                )}
                                {inputs.map(
                                    ({
                                        name,
                                        placeholder,
                                        width,
                                        required = true,
                                        variant = 'standard',
                                        type = 'text',
                                        multiline = false,
                                        rows = 1,
                                    }) => (
                                        <FormField key={name} width={width}>
                                            <StyledInput
                                                required={required}
                                                name={name}
                                                variant={variant}
                                                type={type}
                                                multiline={multiline}
                                                rows={rows}
                                                disabled={getDisabled()}
                                                error={error.name === name}
                                                placeholder={`${placeholder}${
                                                    required ? '*' : ''
                                                }`}
                                                helperText={
                                                    error.name === name
                                                        ? error.text
                                                        : ''
                                                }
                                                onFocus={() =>
                                                    error.name === name &&
                                                    resetError()
                                                }
                                            />
                                        </FormField>
                                    )
                                )}
                            </StyledRow>
                        ))}
                        <FooterText error={status.error}>
                            {status.error
                                ? 'An unexpected error occurred. Try it again, or wait a few minutes'
                                : '*Required fields'}
                        </FooterText>
                        <SubmitButton
                            $success={status.success}
                            $submitting={status.submitting}
                            $error={status.error}
                            type={'submit'}
                            variant="contained">
                            {status.submitting ? (
                                <>
                                    SENDING MESSAGE
                                    <SpinnerIcon {...iconProps} />
                                </>
                            ) : status.success === null ? (
                                <>
                                    SEND MESSAGE
                                    <SendIcon {...iconProps} />
                                </>
                            ) : status.success ? (
                                <>
                                    MESSAGE SENT
                                    <CheckMarkIcon {...iconProps} />
                                </>
                            ) : (
                                <>
                                    SUBMISSION FAILED
                                    <ErrorIcon {...iconProps} />
                                </>
                            )}
                        </SubmitButton>
                    </StyledForm>
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
