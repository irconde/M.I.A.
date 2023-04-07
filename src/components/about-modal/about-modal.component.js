import React from 'react';
import PropTypes from 'prop-types';
import {
    AboutHeader,
    AppSummary,
    CloseIconWrapper,
    ModalRoot,
    modalTheme,
    StyledPaper,
    TeamAndLibrary,
    TeamLibraryHeader,
    TeamLibraryList,
    TeamLibraryTitle,
    TeamLibraryWrapper,
} from './about-modal.styles';
import { Modal, ThemeProvider } from '@mui/material';
import TeamIcon from '../../icons/settings-modal/team-icon/team.icon.component';
import CodeBracketsIcon from '../../icons/settings-modal/code-brackets-icon/code-brackets.icon.component';
import { ReactComponent as AppIcon } from '../../icons/app-logo.icon.svg';
import CloseIcon from '../../icons/shared/close-icon/close.icon';

const shell = window.require('electron').shell;

/**
 * Component dialog for changing settings of application.
 *
 * @component
 *
 */

const AboutModal = ({ open, setOpen }) => {
    /**
     * Handles when the user taps the Close X Icon or outside the modal window. Does not save settings.
     */
    const handleClose = () => {
        setOpen(false);
    };

    const handleClick = (event) => {
        event.preventDefault();
        shell.openExternal(event.target.href);
    };

    return (
        <ThemeProvider theme={modalTheme}>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="about-modal"
                aria-describedby="information about the app and developers">
                <StyledPaper>
                    <ModalRoot>
                        <AboutHeader>
                            <AppIcon
                                width="228px"
                                height="75px"
                                color="white"
                            />
                            <CloseIconWrapper onClick={handleClose}>
                                <CloseIcon
                                    width={'32px'}
                                    height={'32px'}
                                    color={'white'}
                                />
                            </CloseIconWrapper>
                        </AboutHeader>
                        <AppSummary>
                            <p>
                                <strong>M.I.A.</strong> (Medical Imaging
                                Annotation) is a cross-platform application to{' '}
                                <strong>annotate</strong> (drawing bounding
                                boxes, polygon masks, etc.){' '}
                                <strong>standard medical</strong> imaging for
                                creating specific datasets.
                            </p>
                            <p>
                                The application is a spin off of the{' '}
                                <strong>Pilot System</strong>, an intelligent
                                decision support system for advanced threat
                                recognition on x-ray images developed by the{' '}
                                <strong>Emerging Analytics Center</strong>.
                            </p>
                        </AppSummary>
                        <TeamAndLibrary>
                            <TeamLibraryWrapper style={{ width: '182px' }}>
                                <TeamLibraryHeader>
                                    <TeamIcon
                                        width="24px"
                                        height="24px"
                                        color="#e1e1e1"
                                    />
                                    <TeamLibraryTitle>Team</TeamLibraryTitle>
                                </TeamLibraryHeader>
                                <TeamLibraryList>
                                    <ul>
                                        <li>Dr. Ivan Rodriguez-Conde</li>
                                        <li>James Bromley</li>
                                        <li>Dako Albeik</li>
                                        <li>Luka Woodson</li>
                                    </ul>
                                </TeamLibraryList>
                            </TeamLibraryWrapper>
                            <TeamLibraryWrapper style={{ width: '247px' }}>
                                <TeamLibraryHeader>
                                    <CodeBracketsIcon
                                        width="24px"
                                        height="24px"
                                        color="#e1e1e1"
                                    />
                                    <TeamLibraryTitle>
                                        Built With
                                    </TeamLibraryTitle>
                                </TeamLibraryHeader>
                                <TeamLibraryList
                                    style={{ width: '247px', display: 'flex' }}>
                                    <ul>
                                        <li>
                                            <a
                                                href="https://github.com/facebook/react/"
                                                onClick={handleClick}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                React.js
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://github.com/reduxjs/redux"
                                                onClick={handleClick}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                Redux
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://github.com/electron/electron"
                                                onClick={handleClick}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                ElectronJS
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://github.com/mui/material-ui"
                                                onClick={handleClick}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                MUI - Material UI
                                            </a>
                                        </li>
                                    </ul>
                                    <ul>
                                        <li>
                                            <a
                                                href="https://github.com/cornerstonejs/cornerstone"
                                                onClick={handleClick}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                CornerstoneJS
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://www.npmjs.com/package/eac-cornerstone-tools"
                                                onClick={handleClick}
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                Cornerstone Tools
                                            </a>
                                        </li>
                                    </ul>
                                </TeamLibraryList>
                            </TeamLibraryWrapper>
                        </TeamAndLibrary>
                    </ModalRoot>
                </StyledPaper>
            </Modal>
        </ThemeProvider>
    );
};

AboutModal.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
};

export default AboutModal;
