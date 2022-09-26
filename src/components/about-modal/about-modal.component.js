import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    AboutHeader,
    AboutHeaderInfo,
    AboutTitle,
    AppIcon,
    AppIconWrapper,
    AppSummary,
    ModalRoot,
    modalTheme,
    StyledPaper,
    TeamAndLibrary,
    TeamLibraryHeader,
    TeamLibraryList,
    TeamLibraryTitle,
    TeamLibraryWrapper,
    VersionInfo,
} from './about-modal.styles';
import { Modal, ThemeProvider } from '@mui/material';
import {
    getSettingsVisibility,
    toggleSettingsVisibility,
} from '../../redux/slices-old/ui/uiSlice';
import TeamIcon from '../../icons/settings-modal/team-icon/team.icon.component';
import CodeBracketsIcon from '../../icons/settings-modal/code-brackets-icon/code-brackets.icon.component';

/**
 * Component dialog for changing settings of application.
 *
 * @component
 *
 */

const AboutModal = () => {
    const dispatch = useDispatch();
    const settingsVisibility = useSelector(getSettingsVisibility);

    /**
     * Handles when the user taps the Close X Icon or outside the modal window. Does not save settings.
     */
    const handleClose = () => {
        dispatch(toggleSettingsVisibility(false));
    };

    return (
        <ThemeProvider theme={modalTheme}>
            <Modal
                open={settingsVisibility}
                onClose={handleClose}
                aria-labelledby="settings-window"
                aria-describedby="control the apps remote and local settings">
                <StyledPaper>
                    <ModalRoot>
                        <AboutHeader>
                            <AppIconWrapper>
                                <AppIcon />
                            </AppIconWrapper>
                            <AboutHeaderInfo>
                                <AboutTitle>
                                    Pilot<strong>GUI</strong>
                                </AboutTitle>
                                <VersionInfo>
                                    Version {process.env.REACT_APP_VERSION}
                                </VersionInfo>
                            </AboutHeaderInfo>
                        </AboutHeader>
                        <AppSummary>
                            The Pilot GUI is a cross-platform application,
                            developed by the{' '}
                            <strong>Emerging Analytics Center</strong> as a part
                            of the <strong>Pilot System</strong> - an
                            intelligent decision support system for baggage
                            screening - in order to enable x-ray machine
                            operators to visually check the multiple detections
                            or objects identified as potentially of interest by
                            the system itself.
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
                                        <li>Toby Ebarb</li>
                                        <li>Dylan Johnson</li>
                                        <li>Stephanie Bagandov</li>
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
                                        <li>
                                            <a
                                                href="https://github.com/socketio/socket.io"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                Socket.IO
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

export default AboutModal;
