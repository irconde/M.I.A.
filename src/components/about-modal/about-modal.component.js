import React from 'react';
import PropTypes from 'prop-types';
import {
    AboutHeader,
    AppSummary,
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

    return (
        <ThemeProvider theme={modalTheme}>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="settings-window"
                aria-describedby="control the apps remote and local settings">
                <StyledPaper>
                    <ModalRoot>
                        <AboutHeader>
                            {/*<AppIconWrapper>*/}
                            <AppIcon
                                width="228px"
                                height="75px"
                                color="white"
                            />
                            {/*</AppIconWrapper>*/}
                            {/*<AboutHeaderInfo>*/}
                            {/*    <AboutTitle>*/}
                            {/*        Pilot<strong>GUI</strong>*/}
                            {/*    </AboutTitle>*/}
                            {/*    /!*<VersionInfo>*!/*/}
                            {/*    /!*    Version {process.env.REACT_APP_VERSION}*!/*/}
                            {/*    /!*</VersionInfo>*!/*/}
                            {/*</AboutHeaderInfo>*/}
                        </AboutHeader>
                        <AppSummary>
                            M.I.A. (Medical Imaging Annotation) is a
                            cross-platform application to{' '}
                            <strong>annotate</strong> (drawing bounding boxes,
                            polygon masks, etc.){' '}
                            <strong>standard medical</strong> imaging for
                            creating specific datasets.
                            <br></br>
                            <br></br>
                            The application is a spin off of the{' '}
                            <strong>Pilot System</strong>, an intelligent
                            decision support system for advanced threat
                            recognition on x-ray images developed by the
                            <strong>Emerging Analytics Center</strong>.
                        </AppSummary>
                        <TeamAndLibrary>
                            <TeamLibraryWrapper>
                                <TeamLibraryHeader>
                                    <TeamIcon
                                        width="32px"
                                        height="32px"
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
                            <TeamLibraryWrapper>
                                <TeamLibraryHeader>
                                    <CodeBracketsIcon
                                        width="32px"
                                        height="32px"
                                        color="#e1e1e1"
                                    />
                                    <TeamLibraryTitle>
                                        Built With
                                    </TeamLibraryTitle>
                                </TeamLibraryHeader>
                                <TeamLibraryList>
                                    <ul>
                                        <li>
                                            <a
                                                href="https://github.com/facebook/react/"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                React.js
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://github.com/mui/material-ui"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                MUI - Material UI
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://github.com/cornerstonejs/cornerstone"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                CornerstoneJS
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://github.com/reduxjs/redux"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                Redux
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://www.npmjs.com/package/eac-cornerstone-tools"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                EAC Cornerstone Tools
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="https://github.com/electron/electron"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                ElectronJS
                                            </a>
                                        </li>
                                        {/*<li>*/}
                                        {/*    <a*/}
                                        {/*        href="https://github.com/socketio/socket.io"*/}
                                        {/*        target="_blank"*/}
                                        {/*        rel="noopener noreferrer">*/}
                                        {/*        Socket.IO*/}
                                        {/*    </a>*/}
                                        {/*</li>*/}
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
