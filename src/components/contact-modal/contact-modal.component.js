import {
    Button,
    FormControl,
    Modal,
    TextField,
    ThemeProvider,
} from '@mui/material';
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
} from './contact-modal.styles';
import Box from '@mui/material/Box';
import { colors } from '../../utils/enums/Constants';

const FORM_URL =
    'https://script.google.com/macros/s/AKfycbzlhA1q21UnuKDTkIqm7iZ-yKmAHCRmoUUTdKATipwV62ih9CZWCbP6tLaRc5c6F_T7Qg/exec';

const ContactModal = ({ open, closeModal }) => {
    const [status, setStatus] = useState({
        success: undefined,
        submitting: false,
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const formData = new URLSearchParams(form).toString();
        setStatus({
            success: undefined,
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
            setStatus({
                submitting: false,
                success: true,
            });
            setTimeout(closeModal, 1000);
        } catch (e) {
            console.log(e);
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
                            <Box
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'end',
                                }}>
                                <FormControl
                                    style={{ width: '48%', padding: '1%' }}>
                                    <TextField
                                        required={true}
                                        name={'First Name'}
                                        variant={'outlined'}
                                        placeholder={'First Name'}
                                    />
                                </FormControl>
                                <FormControl
                                    style={{ width: '48%', padding: '1%' }}>
                                    <TextField
                                        required={true}
                                        name={'Last Name'}
                                        variant={'outlined'}
                                        placeholder={'Last Name'}
                                    />
                                </FormControl>
                                <FormControl
                                    style={{ width: '100%', padding: '1%' }}>
                                    <TextField
                                        type={'email'}
                                        required={true}
                                        name={'Email'}
                                        variant={'outlined'}
                                        placeholder={'Email'}
                                    />
                                </FormControl>
                                <FormControl
                                    style={{ width: '100%', padding: '1%' }}>
                                    <TextField
                                        required={true}
                                        name={'Institution Name'}
                                        variant={'outlined'}
                                        placeholder={'Institution Name'}
                                    />
                                </FormControl>
                                <FormControl
                                    style={{ width: '100%', padding: '1%' }}>
                                    <TextField
                                        required={true}
                                        name={'Institution Website'}
                                        variant={'outlined'}
                                        placeholder={'Institution Website'}
                                    />
                                </FormControl>
                                <FormControl
                                    style={{ width: '100%', padding: '1%' }}>
                                    <TextField
                                        required={true}
                                        name={'Description'}
                                        variant={'outlined'}
                                        placeholder={'Description'}
                                        multiline={true}
                                        rows={4}
                                    />
                                </FormControl>
                                <Button
                                    type={'submit'}
                                    variant="contained"
                                    sx={{
                                        margin: '1%',
                                        width: '10rem',
                                        height: '3rem',
                                        background: colors.BLUE,
                                        color: colors.WHITE,
                                        mt: '7%',
                                    }}>
                                    {status.submitting
                                        ? 'Loading...'
                                        : status.success === undefined
                                        ? 'Submit'
                                        : status.success
                                        ? 'Successful'
                                        : 'Error'}
                                </Button>
                            </Box>
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
