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
import React from 'react';
import {
    ContactHeader,
    ContactHeaderInfo,
    ContactHeaderParagraph,
    ContactTitle,
} from './contact-modal.styles';
import Box from '@mui/material/Box';
import { colors } from '../../utils/enums/Constants';

const ContactModal = ({ open, closeModal }) => {
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
                        <Box
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'end',
                            }}>
                            <FormControl
                                style={{ width: '48%', padding: '1%' }}>
                                <TextField
                                    name={'First Name'}
                                    variant={'outlined'}
                                    placeholder={'First Name'}
                                />
                            </FormControl>
                            <FormControl
                                style={{ width: '48%', padding: '1%' }}>
                                <TextField
                                    name={'Last Name'}
                                    variant={'outlined'}
                                    placeholder={'Last Name'}
                                />
                            </FormControl>
                            <FormControl
                                style={{ width: '100%', padding: '1%' }}>
                                <TextField
                                    name={'Email'}
                                    variant={'outlined'}
                                    placeholder={'Email'}
                                />
                            </FormControl>
                            <FormControl
                                style={{ width: '100%', padding: '1%' }}>
                                <TextField
                                    name={'Institution Name'}
                                    variant={'outlined'}
                                    placeholder={'Institution Name'}
                                />
                            </FormControl>
                            <FormControl
                                style={{ width: '100%', padding: '1%' }}>
                                <TextField
                                    name={'Institution Website'}
                                    variant={'outlined'}
                                    placeholder={'Institution Website'}
                                />
                            </FormControl>
                            <FormControl
                                style={{ width: '100%', padding: '1%' }}>
                                <TextField
                                    name={'Placeholder'}
                                    variant={'outlined'}
                                    placeholder={'Placeholder'}
                                    multiline={true}
                                    rows={4}
                                />
                            </FormControl>
                            <Button
                                variant="contained"
                                sx={{
                                    margin: '1%',
                                    width: '10rem',
                                    height: '3rem',
                                    background: colors.BLUE,
                                    color: colors.WHITE,
                                    mt: '7%',
                                }}>
                                Submit
                            </Button>
                        </Box>
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
