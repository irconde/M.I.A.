import { Modal, ThemeProvider } from '@mui/material';
import { modalTheme } from '../about-modal/about-modal.styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
    CloseIconWrapper,
    ContactTitle,
    FormField,
    RequiredLabel,
    StyledForm,
    StyledInput,
    StyledPaper,
    StyledRow,
    SubmitButton,
} from './contact-modal.styles';
import LoadingIcon from '../../icons/contact-modal/loading-icon/loading.icon';
import { Channels } from '../../utils/enums/Constants';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';
import { CONTACT_MODAL_ROWS } from './rows';

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
                            <CloseIcon
                                width={'14px'}
                                height={'14px'}
                                color={'white'}
                            />
                        </CloseIconWrapper>
                    </ContactTitle>

                    <StyledForm
                        onSubmit={handleSubmit}
                        style={{ flex: 1, outline: '1px solid orange' }}>
                        {CONTACT_MODAL_ROWS.map(({ Icon, inputs }, i) => (
                            <StyledRow key={i}>
                                {Icon && (
                                    <span
                                        style={{
                                            width: '20px',
                                            aspectRatio: '1',
                                            outline: '1px solid white',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}>
                                        <Icon
                                            width={'20px'}
                                            height={'20px'}
                                            color={'white'}
                                        />
                                    </span>
                                )}
                                {inputs.map(
                                    ({
                                        required = true,
                                        name,
                                        placeholder,
                                        variant = 'standard',
                                        type = 'text',
                                        multiline = false,
                                        rows = 1,
                                        width,
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
                                                onChange={() =>
                                                    setStatus({
                                                        ...status,
                                                        error: '',
                                                    })
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
                                    <LoadingIcon
                                        width={'24px'}
                                        height={'24px'}
                                        color={'white'}
                                    />
                                </>
                            ) : status.success === null ? (
                                'SEND MESSAGE'
                            ) : status.success ? (
                                'MESSAGE SENT'
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
