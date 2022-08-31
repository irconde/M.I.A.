import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    AboutHeader,
    AboutHeaderInfo,
    AboutTitle,
    AppIcon,
    AppIconWrapper,
    AppSummary,
    AutoConnectContainer,
    ConnectionButton,
    ConnectionButtonSection,
    DefaultIconWrapper,
    FileManagementItem,
    FileManagementSection,
    FileSuffixField,
    HostTextField,
    IconWrapper,
    LeftAlignedWrapper,
    LocalFileOutputField,
    ModalRoot,
    ModalTabContext,
    ModalTabPanel,
    ModalTabWrapper,
    modalTheme,
    PortTextField,
    RemoteInputContainer,
    RemoteWorkContainer,
    SaveSettingsButton,
    ScrollableContainer,
    SelectFolderButton,
    SettingDescription,
    SettingOptionTitle,
    SettingsRow,
    StandardFormControl,
    StyledDivider,
    StyledFormGroup,
    StyledPaper,
    StyledSelect,
    StyledSwitch,
    StyledTab,
    SwitchWrapper,
    TabList,
    TeamAndLibrary,
    TeamLibraryHeader,
    TeamLibraryList,
    TeamLibraryTitle,
    TeamLibraryWrapper,
    VersionInfo,
    WorkingDirectory,
    WorkSpaceFormControl,
} from './settings-modal.styles';
import {
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    MenuItem,
    Modal,
    ThemeProvider,
    Tooltip,
} from '@mui/material';
import ConnectionResultComponent from './connection-result/connection-result.component';
import CheckConnectionIcon from '../../icons/settings-modal/check-connection-icon/check-connection.icon';
import {
    getSettingsVisibility,
    resetSelectedDetectionBoxesUpdate,
    setCollapsedSideMenu,
    toggleSettingsVisibility,
} from '../../redux/slices/ui/uiSlice';
import {
    clearAllSelection,
    getSelectedDetection,
} from '../../redux/slices/detections/detectionsSlice';
import {
    getFileSuffix,
    getLocalFileOutput,
    getSettings,
    saveElectronCookie,
    saveSettings,
} from '../../redux/slices/settings/settingsSlice';
import socketIOClient from 'socket.io-client';
import { Channels, SETTINGS } from '../../utils/enums/Constants';
import Utils from '../../utils/general/Utils';
import isElectron from 'is-electron';
import { setCurrentProcessingFile } from '../../redux/slices/server/serverSlice';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';
import CloudIcon from '../../icons/settings-modal/cloud-icon/cloud.icon';
import FolderIcon from '../../icons/shared/folder-icon/folder.icon';
import FileIcon from '../../icons/settings-modal/file-icon/file.icon';
import PencilIcon from '../../icons/settings-modal/pencil-icon/pencil.icon';
import FileSuffixIcon from '../../icons/settings-modal/file-suffix-icon/file-suffix.icon';
import InfoIcon from '../../icons/shared/info-icon/info.icon';
import VisualizationModePickerComponent from './visualization-mode-picker/visualization-mode-picker.component';
import CogWheelIcon from '../../icons/settings-modal/settings-cog-icon/settings-cog.icon';
import TeamIcon from '../../icons/settings-modal/team-icon/team.icon.component';
import CodeBracketsIcon from '../../icons/settings-modal/code-brackets-icon/code-brackets.icon.component';

let ipcRenderer;
if (isElectron()) {
    const electron = window.require('electron');
    ipcRenderer = electron.ipcRenderer;
}

/**
 * Component dialog for changing settings of application.
 *
 * @component
 *
 */

const SettingsModal = (props) => {
    const dispatch = useDispatch();
    const settings = useSelector(getSettings);
    // TODO: Re-implement MUI Snackbar
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [remoteIp, setRemoteIp] = useState(settings.remoteIp);
    const [remotePort, setRemotePort] = useState(settings.remotePort);
    const [autoConnect, setAutoConnect] = useState(settings.autoConnect);
    const [fileFormat, setFileFormat] = useState(settings.fileFormat);
    const [annotationsFormat, setAnnotationsFormat] = useState(
        settings.annotationsFormat
    );
    const [localFileOutput, setLocalFileOutput] = useState(
        useSelector(getLocalFileOutput)
    );
    const [fileSuffix, setFileSuffix] = useState(useSelector(getFileSuffix));
    const [remoteOrLocal, setRemoteOrLocal] = useState(settings.remoteOrLocal);
    const [openFileFormat, setOpenFileFormat] = useState(false);
    const [connectionDisplay, setConnectionDisplay] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [testConnectionResult, setTestConnectionResult] = useState(false);
    const [openAnnotationsFormat, setOpenAnnotationsFormat] = useState(false);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const initDisplaySummarizedDetections =
        settings.displaySummarizedDetections;
    const [displaySummarizedDetections, setDisplaySummarizedDetections] =
        useState(initDisplaySummarizedDetections);
    const selectedDetection = useSelector(getSelectedDetection);

    /**
     * Event handler for when the snackbar closes
     *
     * @param {Event} event
     * @param {string} reason
     */
    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    /**
     * Tests the connection with the typed input fields. This does some simulation
     * by using setTimeout to provide useful user interaction and feedback.
     */
    const testConnection = () => {
        const testConnection = socketIOClient(
            `http://${remoteIp}:${remotePort}`
        );
        testConnection.connect();
        setConnecting(true);
        testConnection.on('connect', () => {
            setTimeout(() => {
                setTestConnectionResult(true);
                setConnectionDisplay(true);
                setConnecting(false);
                setTimeout(() => {
                    setTestConnectionResult(false);
                    setConnectionDisplay(false);
                }, 1750);
            }, 750);
        });
        testConnection.on('connect_error', (err) => {
            console.log(`connect_error due to ${err.message}`);
            if (
                err.message === 'xhr poll error' ||
                err.message === 'server error'
            ) {
                testConnection.disconnect();
                setTimeout(() => {
                    setTestConnectionResult(false);
                    setConnectionDisplay(true);
                    setConnecting(false);
                    setTimeout(() => {
                        setTestConnectionResult(false);
                        setConnectionDisplay(false);
                    }, 1750);
                }, 750);
            }
        });
    };

    /**
     * Handles when the user taps the Close X Icon or outside the modal window. Does not save settings.
     */
    const handleClose = () => {
        dispatch(toggleSettingsVisibility(false));
    };

    /**
     * It toggles between the display mode between detailed, or summarized depending on the displaySummarizedDetections
     */
    const updateVisualizationMode = () => {
        if (selectedDetection) {
            dispatch(clearAllSelection());
            dispatch(resetSelectedDetectionBoxesUpdate());
            props.resetCornerstoneTool();
            props.appUpdateImage();
        }

        // only update the UI when a new visualization mode is selected
        if (initDisplaySummarizedDetections === displaySummarizedDetections) {
            return;
        }

        // close the side menu if mode is summarized
        // open it if the app is in detailed mode
        if (isElectron() && remoteOrLocal && localFileOutput !== '') {
            dispatch(
                setCollapsedSideMenu({
                    cornerstone: props.cornerstone,
                    desktopMode: true,
                    collapsedSideMenu: displaySummarizedDetections,
                })
            );
        } else {
            dispatch(
                setCollapsedSideMenu({
                    cornerstone: props.cornerstone,
                    desktopMode: false,
                    collapsedSideMenu: displaySummarizedDetections,
                })
            );
        }
    };

    /**
     * Action triggered when the save settings button is tapped. It sends all data to the settings slice.
     * If the user entered connection information it will change the command server to the new one.
     */
    const saveSettingsEvent = () => {
        if (isElectron()) {
            if (remoteOrLocal === false && localFileOutput !== '') {
                ipcRenderer
                    .invoke(Channels.loadFiles, localFileOutput)
                    .then((result) => {
                        setSnackBarOpen(true);
                        dispatch(
                            saveElectronCookie({
                                remoteIp,
                                remotePort,
                                autoConnect,
                                localFileOutput,
                                fileFormat,
                                annotationsFormat,
                                fileSuffix,
                                remoteOrLocal,
                                deviceType: Utils.deviceType(),
                                displaySummarizedDetections,
                            })
                        );
                        dispatch(toggleSettingsVisibility(false));
                        dispatch(setCurrentProcessingFile(null));
                        updateVisualizationMode();
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                setSnackBarOpen(true);
                dispatch(
                    saveElectronCookie({
                        remoteIp,
                        remotePort,
                        autoConnect,
                        localFileOutput,
                        fileFormat,
                        annotationsFormat,
                        fileSuffix,
                        remoteOrLocal,
                        deviceType: Utils.deviceType(),
                        displaySummarizedDetections,
                    })
                );
                dispatch(toggleSettingsVisibility(false));
                updateVisualizationMode();
                if (
                    remoteOrLocal === true &&
                    (remoteIp !== '' || remotePort !== '')
                ) {
                    setTimeout(() => {
                        props.connectToCommandServer(true);
                    }, 0);
                }
            }
        } else {
            setSnackBarOpen(true);
            dispatch(
                saveSettings({
                    remoteIp,
                    remotePort,
                    autoConnect,
                    localFileOutput,
                    fileFormat,
                    annotationsFormat,
                    fileSuffix,
                    remoteOrLocal,
                    deviceType: Utils.deviceType(),
                    displaySummarizedDetections,
                })
            );
            dispatch(toggleSettingsVisibility(false));
            updateVisualizationMode();
            if (
                remoteOrLocal === true &&
                (remoteIp !== '' || remotePort !== '')
            ) {
                setTimeout(() => {
                    props.connectToCommandServer(true);
                }, 0);
            }
        }
    };

    const [tabIndex, setTabIndex] = React.useState(0);

    // const TabPanel = (props) => {
    //     const { children, value, index, ...other } = props;
    //
    //     return (
    //         <ModalTabPanel
    //             role="tabpanel"
    //             hidden={value !== index}
    //             id={`tabpanel-${index}`}
    //             aria-labelledby={`tab-${index}`}
    //             {...other}>
    //             {value === index && <StyledBox>{children}</StyledBox>}
    //         </ModalTabPanel>
    //     );
    // };
    //
    // TabPanel.propTypes = {
    //     children: PropTypes.node,
    //     index: PropTypes.number.isRequired,
    //     value: PropTypes.number.isRequired,
    // };

    const settingsIndex = 0;
    const aboutIndex = 1;

    let body = (
        <StyledPaper>
            <ModalRoot>
                <ModalTabContext>
                    <ModalTabWrapper>
                        <TabList
                            value={tabIndex}
                            onChange={(event, index) =>
                                setTabIndex(parseInt(index))
                            }
                            aria-label="Settings Modal Tab">
                            <StyledTab
                                icon={
                                    <CogWheelIcon
                                        width="24px"
                                        height="24px"
                                        color="#9d9d9d"
                                    />
                                }
                                iconPosition="start"
                                label="Settings"
                            />
                            <StyledTab
                                icon={
                                    <InfoIcon
                                        width="24px"
                                        height="24px"
                                        color="#9d9d9d"
                                    />
                                }
                                iconPosition="start"
                                label="About"
                            />
                        </TabList>
                        <DefaultIconWrapper onClick={() => handleClose()}>
                            <CloseIcon
                                height="32px"
                                width="32px"
                                color="white"
                            />
                        </DefaultIconWrapper>
                    </ModalTabWrapper>
                    <ModalTabPanel
                        role="tabpanel"
                        index={settingsIndex}
                        value={tabIndex}
                        hidden={tabIndex !== settingsIndex}
                        id={`tabpanel-${settingsIndex}`}
                        aria-labelledby={`tab-${settingsIndex}`}>
                        <StyledFormGroup>
                            <ScrollableContainer height={80}>
                                <VisualizationModePickerComponent
                                    isSummarized={displaySummarizedDetections}
                                    setIsSummarized={
                                        setDisplaySummarizedDetections
                                    }
                                />
                                <StyledDivider />
                                <div>
                                    <RemoteWorkContainer>
                                        <SettingOptionTitle>
                                            Work connected to a remote service
                                        </SettingOptionTitle>
                                        <SwitchWrapper>
                                            <StyledSwitch
                                                checked={remoteOrLocal}
                                                onChange={() =>
                                                    setRemoteOrLocal(
                                                        !remoteOrLocal
                                                    )
                                                }
                                            />
                                        </SwitchWrapper>
                                    </RemoteWorkContainer>
                                    {isElectron() && (
                                        <SettingDescription>
                                            Choose the option if you want to
                                            receive/send images from/to a server
                                        </SettingDescription>
                                    )}

                                    <SettingsRow>
                                        <RemoteInputContainer>
                                            <Tooltip title="Server address: ip address : port number">
                                                <LeftAlignedWrapper>
                                                    <CloudIcon
                                                        color={
                                                            remoteOrLocal
                                                                ? '#ffffff'
                                                                : '#9d9d9d'
                                                        }
                                                        height="24px"
                                                        width="24px"
                                                    />
                                                </LeftAlignedWrapper>
                                            </Tooltip>
                                            <FormControl>
                                                <HostTextField
                                                    value={remoteIp}
                                                    disabled={!remoteOrLocal}
                                                    onChange={(e) => {
                                                        setRemoteIp(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </FormControl>

                                            <IconWrapper>:</IconWrapper>

                                            <FormControl>
                                                <PortTextField
                                                    value={remotePort}
                                                    onChange={(e) => {
                                                        setRemotePort(
                                                            e.target.value
                                                        );
                                                    }}
                                                    disabled={!remoteOrLocal}
                                                />
                                            </FormControl>
                                        </RemoteInputContainer>

                                        <AutoConnectContainer>
                                            <Tooltip title="Enable/disable auto-connection with server">
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            disabled={
                                                                !remoteOrLocal
                                                            }
                                                            color={'primary'}
                                                            checked={
                                                                autoConnect
                                                            }
                                                            onChange={() => {
                                                                setAutoConnect(
                                                                    !autoConnect
                                                                );
                                                            }}
                                                            name="autoConnect"
                                                        />
                                                    }
                                                    label="Autoconnect"
                                                />
                                            </Tooltip>
                                        </AutoConnectContainer>
                                    </SettingsRow>
                                    <ConnectionButtonSection>
                                        <Tooltip title="Check whether the server is reachable">
                                            <ConnectionButton
                                                disabled={!remoteOrLocal}
                                                onClick={() => {
                                                    testConnection();
                                                }}>
                                                <LeftAlignedWrapper>
                                                    {connecting ? (
                                                        <CircularProgress
                                                            size={'24px'}
                                                        />
                                                    ) : (
                                                        <CheckConnectionIcon
                                                            color={
                                                                remoteOrLocal
                                                                    ? '#367eff'
                                                                    : '#9d9d9d'
                                                            }
                                                            width="24px"
                                                            height="24px"
                                                        />
                                                    )}
                                                </LeftAlignedWrapper>
                                                Check connection
                                            </ConnectionButton>
                                        </Tooltip>

                                        <ConnectionResultComponent
                                            display={connectionDisplay}
                                            connected={testConnectionResult}
                                        />
                                    </ConnectionButtonSection>
                                </div>
                                <div>
                                    <StyledDivider />
                                    <div>
                                        <SettingOptionTitle>
                                            File management
                                        </SettingOptionTitle>
                                        <SettingDescription>
                                            Default file management options to
                                            streamline file input and output
                                        </SettingDescription>
                                        {isElectron() && (
                                            <WorkingDirectory>
                                                <WorkSpaceFormControl>
                                                    <Tooltip title="Workspace location">
                                                        <LeftAlignedWrapper>
                                                            <FolderIcon
                                                                width="24px"
                                                                height="24px"
                                                                color={
                                                                    remoteOrLocal
                                                                        ? '#9d9d9d'
                                                                        : '#ffffff'
                                                                }
                                                            />
                                                        </LeftAlignedWrapper>
                                                    </Tooltip>
                                                    <LocalFileOutputField
                                                        value={localFileOutput}
                                                        disabled={remoteOrLocal}
                                                        onChange={(e) => {
                                                            setLocalFileOutput(
                                                                e.target.value
                                                            );
                                                        }}
                                                    />
                                                </WorkSpaceFormControl>
                                                <Tooltip title="Select workspace folder from the file explorer">
                                                    <SelectFolderButton
                                                        disabled={remoteOrLocal}
                                                        onClick={() => {
                                                            if (isElectron()) {
                                                                ipcRenderer
                                                                    .invoke(
                                                                        Channels.selectDirectory
                                                                    )
                                                                    .then(
                                                                        (
                                                                            result
                                                                        ) => {
                                                                            if (
                                                                                result.canceled ===
                                                                                    false &&
                                                                                result
                                                                                    .filePaths
                                                                                    .length >
                                                                                    0
                                                                            ) {
                                                                                setLocalFileOutput(
                                                                                    result
                                                                                        .filePaths[0]
                                                                                );
                                                                            }
                                                                        }
                                                                    )
                                                                    .catch(
                                                                        (
                                                                            err
                                                                        ) => {
                                                                            console.log(
                                                                                err
                                                                            );
                                                                        }
                                                                    );
                                                            }
                                                        }}>
                                                        Select Folder
                                                    </SelectFolderButton>
                                                </Tooltip>
                                            </WorkingDirectory>
                                        )}

                                        <FileManagementSection>
                                            <FileManagementItem>
                                                <Tooltip title="Select output file format">
                                                    <LeftAlignedWrapper>
                                                        <FileIcon
                                                            height="24px"
                                                            width="24px"
                                                            color="white"
                                                        />
                                                    </LeftAlignedWrapper>
                                                </Tooltip>
                                                <StandardFormControl>
                                                    <StyledSelect
                                                        open={openFileFormat}
                                                        defaultValue={
                                                            'Open Raster'
                                                        }
                                                        onClose={() => {
                                                            setOpenFileFormat(
                                                                false
                                                            );
                                                        }}
                                                        onOpen={() => {
                                                            setOpenFileFormat(
                                                                true
                                                            );
                                                        }}
                                                        value={fileFormat}
                                                        onChange={(e) => {
                                                            setFileFormat(
                                                                e.target.value
                                                            );
                                                        }}>
                                                        <MenuItem
                                                            value={''}
                                                            disabled>
                                                            Output file format
                                                        </MenuItem>

                                                        <MenuItem
                                                            value={
                                                                'Open Raster'
                                                            }>
                                                            Open Raster
                                                        </MenuItem>
                                                        <MenuItem
                                                            value={
                                                                'Zip Archive'
                                                            }>
                                                            Zip Archive
                                                        </MenuItem>
                                                    </StyledSelect>
                                                </StandardFormControl>
                                            </FileManagementItem>
                                            <FileManagementItem>
                                                <Tooltip title="Select format for annotations">
                                                    <LeftAlignedWrapper>
                                                        <PencilIcon
                                                            height="24px"
                                                            width="24px"
                                                            color="white"
                                                        />
                                                    </LeftAlignedWrapper>
                                                </Tooltip>

                                                <StandardFormControl>
                                                    <StyledSelect
                                                        open={
                                                            openAnnotationsFormat
                                                        }
                                                        onClose={() => {
                                                            setOpenAnnotationsFormat(
                                                                false
                                                            );
                                                        }}
                                                        onOpen={() => {
                                                            setOpenAnnotationsFormat(
                                                                true
                                                            );
                                                        }}
                                                        value={
                                                            annotationsFormat
                                                        }
                                                        onChange={(e) => {
                                                            setAnnotationsFormat(
                                                                e.target.value
                                                            );
                                                        }}>
                                                        <MenuItem
                                                            disabled
                                                            value={''}>
                                                            Annotations format
                                                        </MenuItem>
                                                        {Object.keys(
                                                            SETTINGS.ANNOTATIONS
                                                        ).map((key, index) => {
                                                            const annotation =
                                                                SETTINGS
                                                                    .ANNOTATIONS[
                                                                    key
                                                                ];
                                                            return (
                                                                <MenuItem
                                                                    key={index}
                                                                    value={
                                                                        annotation
                                                                    }>
                                                                    {annotation}
                                                                </MenuItem>
                                                            );
                                                        })}
                                                    </StyledSelect>
                                                </StandardFormControl>
                                            </FileManagementItem>

                                            <FileManagementItem>
                                                <Tooltip title="Input suffix appended to filenames">
                                                    <LeftAlignedWrapper>
                                                        <FileSuffixIcon
                                                            height="24px"
                                                            width="24px"
                                                            color="white"
                                                        />
                                                    </LeftAlignedWrapper>
                                                </Tooltip>
                                                <FormControl>
                                                    <FileSuffixField
                                                        value={fileSuffix}
                                                        onChange={(e) => {
                                                            setFileSuffix(
                                                                e.target.value
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                            </FileManagementItem>
                                        </FileManagementSection>
                                    </div>
                                </div>
                            </ScrollableContainer>

                            <SaveSettingsButton
                                onClick={() => saveSettingsEvent()}>
                                Save Settings
                            </SaveSettingsButton>
                        </StyledFormGroup>
                    </ModalTabPanel>
                    <ModalTabPanel
                        role="tabpanel"
                        index={aboutIndex}
                        value={tabIndex}
                        hidden={tabIndex !== aboutIndex}
                        id={`tabpanel-${aboutIndex}`}
                        aria-labelledby={`tab-${aboutIndex}`}>
                        <ScrollableContainer height={100}>
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
                                <strong>Emerging Analytics Center</strong> as a
                                part of the <strong>Pilot System</strong> - an
                                intelligent decision support system for baggage
                                screening - in order to enable x-ray machine
                                operators to visually check the multiple
                                detections or objects identified as potentially
                                of interest by the system itself.
                            </AppSummary>
                            <TeamAndLibrary>
                                <TeamLibraryWrapper>
                                    <TeamLibraryHeader>
                                        <TeamIcon
                                            width="32px"
                                            height="32px"
                                            color="#e1e1e1"
                                        />
                                        <TeamLibraryTitle>
                                            Team
                                        </TeamLibraryTitle>
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
                        </ScrollableContainer>
                    </ModalTabPanel>
                </ModalTabContext>
            </ModalRoot>
        </StyledPaper>
    );

    return (
        <ThemeProvider theme={modalTheme}>
            <Modal
                open={settingsVisibility}
                onClose={handleClose}
                aria-labelledby="settings-window"
                aria-describedby="control the apps remote and local settings">
                {body}
            </Modal>
        </ThemeProvider>
    );
};

SettingsModal.propTypes = {
    title: PropTypes.string,
    connectToCommandServer: PropTypes.func,
    resetCornerstoneTool: PropTypes.func,
    appUpdateImage: PropTypes.func,
    cornerstone: PropTypes.object,
};

export default SettingsModal;
