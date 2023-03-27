import { Modal, ThemeProvider } from '@mui/material';
import { modalTheme } from '../about-modal/about-modal.styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
    CloseIconWrapper,
    ContactTitle,
    FormField,
    ModalIcon,
    RequiredLabel,
    StyledForm,
    StyledInput,
    StyledPaper,
    StyledRow,
    SubmitButton,
} from './contact-modal.styles';
import { Channels } from '../../utils/enums/Constants';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';
import { CONTACT_MODAL_ROWS } from './rows';
import SendIcon from '../../icons/contact-modal/send-icon/send.icon';
import useValidate from './useValidate';
import SpinnerIcon from '../../icons/shared/spinner-icon/spinner.icon';
import CheckMarkIcon from '../../icons/shared/check-mark-icon/check-mark.icon';

const ipcRenderer = window.require('electron').ipcRenderer;

const iconProps = { width: '20px', height: '20px', color: 'white' };

const ContactModal = ({ open, closeModal }) => {
    const [status, setStatus] = useState({
        success: null,
        submitting: false,
        error: '',
    });
    const [error, validate, resetError] = useValidate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate(e.target)) return;
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

    return (
        <ThemeProvider theme={modalTheme}>
            <Modal
                open={open}
                onClose={closeModal}
                aria-labelledby="contact-window"
                aria-describedby="send information to the development team">
                <StyledPaper>
                    <ContactTitle>
                        CONTACT US
                        <CloseIconWrapper onClick={closeModal}>
                            <CloseIcon {...iconProps} />
                        </CloseIconWrapper>
                    </ContactTitle>

                    <StyledForm onSubmit={handleSubmit}>
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
                                                placeholder={`${placeholder}${
                                                    required ? '*' : ''
                                                }`}
                                                variant={variant}
                                                type={type}
                                                multiline={multiline}
                                                rows={rows}
                                                helperText={
                                                    error.name === name
                                                        ? error.text
                                                        : ''
                                                }
                                                error={error.name === name}
                                                onChange={() =>
                                                    error.name === name &&
                                                    resetError()
                                                }
                                            />
                                        </FormField>
                                    )
                                )}
                            </StyledRow>
                        ))}
                        <RequiredLabel>*Required fields</RequiredLabel>
                        <SubmitButton
                            $success={status.success}
                            $submitting={status.submitting}
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
                                'FAILED'
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
