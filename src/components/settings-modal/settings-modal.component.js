import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
} from '@mui/material';
import Modal from '@mui/material/Modal';
import ConnectionResultComponent from './connection-result.component';
import SettingsCog from '../../icons/SettingsCog';
import { ReactComponent as IcCloseIcon } from '../../icons/ic_close.svg';
import CloudIcon from '../../icons/CloudIcon.js';
import CheckConnectionIcon from '../../icons/CheckConnectionIcon.js';
import FileOpenIcon from '../../icons/FileOpenIcon.js';
import FileAnnotationsIcon from '../../icons/FileAnnotationsIcon.js';
import FileFormatIcon from '../../icons/FileFormatIcon.js';
import FileSuffixIcon from '../../icons/FileSuffixIcon.js';
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
import { Channels, SETTINGS } from '../../utils/Constants';
import Utils from '../../utils/Utils';
import isElectron from 'is-electron';
import Tooltip from '@mui/material/Tooltip';
import DetailedModeIconSrc from '../../icons/ic_detailed_mode.svg';
import SummarizedModeIconSrc from '../../icons/ic_summarized_mode.svg';
import DetailedModeIconCheckedSrc from '../../icons/ic_detailed_mode_checked.svg';
import SummarizedModeIconCheckedSrc from '../../icons/ic_summarized_mode_checked.svg';
import { setCurrentProcessingFile } from '../../redux/slices/server/serverSlice';
import {
    StyledPaper,
    ModalRoot,
    SettingsHeader,
    SettingsCogwheel,
    SettingsTitle,
    CloseIconWrapper,
    StyledDivider,
    ScrollableContainer,
    SettingOptionTitle,
    SettingDescription,
    VisualizationModeContainer,
    VisualizationModeLabel,
    RemoteWorkContainer,
    SwitchWrapper,
    SettingsRow,
    IconWrapper,
    WorkingDirectory,
    VisualiationModeIcon,
    RemoteInputContainer,
    AutoConnectContainer,
    ConnectionButtonSection,
    FileManagementSection,
    FileManagementItem,
    SaveSettingsButton,
    StyledFormGroup,
    ConnectionButton,
    StyledSwitch,
    HostTextField,
} from './settings-modal.styles';

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
    const [modalStyle] = useState(getModalStyle);
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
    const svgContainerStyle = {
        margin: '0.3rem',
        marginRight: '1rem',
        display: 'flex',
        float: 'left',
    };
    const svgStyle = {
        height: '24px',
        width: '24px',
        color: '#ffffff',
    };

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
     * Returns the main modal body style
     *
     * @returns {Object} Containing styles for the modal
     */
    function getModalStyle() {
        return {
            position: 'absolute',
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
            backgroundColor: '#1f1f1f',
            outline: 'none',
            fontFamily: 'Noto Sans JP',
            width: '30vw',
            minWidth: '32rem',
            maxWidth: '40rem',
            padding: '2rem',
        };
    }

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

    const theme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                light: '#5e97ff',
                main: '#367eff',
                dark: '#2558b2',
                contrastText: '#9d9d9d',
            },
        },
        zIndex: {
            modal: 3,
        },
        transitions: {
            duration: {
                shortest: 150,
                shorter: 200,
                // most basic recommended timing
                standard: 300,
                // this is to be used in complex animations
                complex: 375,
                // recommended when something is entering screen
                enteringScreen: 225,
                // recommended when something is leaving screen
                leavingScreen: 195,
            },
        },
    });

    const classes = {
        pathButton: {
            color: '#367eff',
            textTransform: 'none',
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
        },
        snackBarClass: {
            backgroundColor: '#1f1f1f',
            color: '#ffffff',
        },
        checkIcon: {
            margin: '0.3rem',
            display: 'flex',
        },
        checkConnectionButton: {
            color: '#367eff',
            textTransform: 'none',
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
        },
        links: {
            fontSize: theme.typography.fontSize,
            color: theme.palette.primary,
            cursor: 'pointer',
        },
        linkSelected: {
            fontSize: theme.typography.fontSize,
            color: theme.palette.primary,
            background: '#515151',
            cursor: 'pointer',
        },
        form: {
            margin: theme.spacing(1),
        },
        longTextField: {
            display: 'flex',
            flexDirection: 'row',
            width: '70%',
        },
        connectionLabel: {
            margin: 'auto',
        },
        circularProgress: {
            marginRight: theme.spacing(2),
            display: connecting ? 'none' : 'initial',
        },
        sectionLabel: {
            marginRight: theme.spacing(2),
        },
        outputFolderSection: {
            display: 'flex',
            flexDirection: 'column',
        },
        container: {
            display: 'flex',
        },
        disabledText: {
            color: '#9d9d9d',
        },
        closeIconStyle: {
            alignSelf: 'center',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
        },
        fileIconContainer: {
            alignSelf: 'center',
        },
        displayListSectionInput: {
            width: '70%',
        },
    };

    let body = (
        <StyledPaper>
            <ModalRoot>
                <SettingsHeader>
                    <SettingsCogwheel>
                        <SettingsCog title={props.title} />
                    </SettingsCogwheel>
                    <SettingsTitle>Settings</SettingsTitle>
                    <CloseIconWrapper
                        onClick={() => handleClose()}
                        style={classes.closeIconStyle}>
                        <IcCloseIcon />
                    </CloseIconWrapper>
                </SettingsHeader>
                <StyledDivider />
                <StyledFormGroup>
                    <ScrollableContainer>
                        <div>
                            <SettingOptionTitle>
                                Visualization Mode
                            </SettingOptionTitle>
                            <SettingDescription>
                                Pick the visual granularity to use when
                                displaying multi-algorithm results.
                            </SettingDescription>
                            <VisualizationModeContainer>
                                <div>
                                    <VisualiationModeIcon
                                        src={
                                            displaySummarizedDetections
                                                ? DetailedModeIconSrc
                                                : DetailedModeIconCheckedSrc
                                        }
                                        selected={!displaySummarizedDetections}
                                        alt={'Detailed mode'}
                                        onClick={() => {
                                            setDisplaySummarizedDetections(
                                                false
                                            );
                                        }}
                                    />
                                    <VisualizationModeLabel
                                        selected={!displaySummarizedDetections}>
                                        Detailed
                                    </VisualizationModeLabel>
                                </div>
                                <div>
                                    <VisualiationModeIcon
                                        src={
                                            displaySummarizedDetections
                                                ? SummarizedModeIconCheckedSrc
                                                : SummarizedModeIconSrc
                                        }
                                        selected={displaySummarizedDetections}
                                        alt={'Summarized mode'}
                                        onClick={() => {
                                            setDisplaySummarizedDetections(
                                                true
                                            );
                                        }}
                                    />
                                    <VisualizationModeLabel
                                        selected={displaySummarizedDetections}>
                                        Summarized
                                    </VisualizationModeLabel>
                                </div>
                            </VisualizationModeContainer>
                        </div>
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
                                            setRemoteOrLocal(!remoteOrLocal)
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
                                        <IconWrapper>
                                            <CloudIcon
                                                style={svgContainerStyle}
                                                svgStyle={{
                                                    ...svgStyle,
                                                    color: remoteOrLocal
                                                        ? '#ffffff'
                                                        : '#9d9d9d',
                                                }}
                                            />
                                        </IconWrapper>
                                    </Tooltip>
                                    <FormControl>
                                        <HostTextField
                                            value={remoteIp}
                                            disabled={!remoteOrLocal}
                                            onChange={(e) => {
                                                setRemoteIp(e.target.value);
                                            }}
                                        />
                                    </FormControl>

                                    <IconWrapper>:</IconWrapper>

                                    <FormControl>
                                        <TextField
                                            required
                                            id="remotePort"
                                            placeholder="Port"
                                            value={remotePort}
                                            onChange={(e) => {
                                                setRemotePort(e.target.value);
                                            }}
                                            disabled={!remoteOrLocal}
                                            inputProps={{
                                                size: 6,
                                                maxLength: 5,
                                                inputMode: 'numeric',
                                                pattern: '[0-9]*',
                                            }}
                                            style={classes.cloudIconContainer}
                                            variant="standard"
                                        />
                                    </FormControl>
                                </RemoteInputContainer>

                                <AutoConnectContainer>
                                    <Tooltip title="Enable/disable auto-connection with server">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    disabled={!remoteOrLocal}
                                                    color={'primary'}
                                                    checked={autoConnect}
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
                                        {connecting ? (
                                            <div>
                                                <CircularProgress
                                                    size={'24px'}
                                                />
                                            </div>
                                        ) : (
                                            <CheckConnectionIcon
                                                style={svgContainerStyle}
                                                svgStyle={{
                                                    ...svgStyle,
                                                    color: remoteOrLocal
                                                        ? '#367eff'
                                                        : '#9d9d9d',
                                                }}
                                            />
                                        )}
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
                                        <FormControl
                                            style={classes.longTextField}>
                                            <Tooltip title="Workspace location">
                                                <div
                                                    style={
                                                        classes.fileIconContainer
                                                    }>
                                                    <FileOpenIcon
                                                        style={
                                                            svgContainerStyle
                                                        }
                                                        svgStyle={{
                                                            ...svgStyle,
                                                            color:
                                                                remoteOrLocal ===
                                                                true
                                                                    ? '#9d9d9d'
                                                                    : '#ffffff',
                                                        }}
                                                    />
                                                </div>
                                            </Tooltip>
                                            <TextField
                                                required
                                                fullWidth={true}
                                                id="localFileOutput"
                                                placeholder={
                                                    'Working directory'
                                                }
                                                value={localFileOutput}
                                                disabled={remoteOrLocal}
                                                inputProps={{
                                                    size: '40',
                                                }}
                                                onChange={(e) => {
                                                    setLocalFileOutput(
                                                        e.target.value
                                                    );
                                                }}
                                                variant="standard"
                                            />
                                        </FormControl>
                                        <Tooltip title="Select workspace folder from the file explorer">
                                            <Button
                                                disabled={remoteOrLocal}
                                                variant="outlined"
                                                size="medium"
                                                id="btnFolder"
                                                style={classes.pathButton}
                                                onClick={() => {
                                                    if (isElectron()) {
                                                        ipcRenderer
                                                            .invoke(
                                                                Channels.selectDirectory
                                                            )
                                                            .then((result) => {
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
                                                            })
                                                            .catch((err) => {
                                                                console.log(
                                                                    err
                                                                );
                                                            });
                                                    }
                                                }}>
                                                Select Folder
                                            </Button>
                                        </Tooltip>
                                    </WorkingDirectory>
                                )}

                                <FileManagementSection>
                                    <FileManagementItem>
                                        <FileFormatIcon
                                            style={svgContainerStyle}
                                            svgStyle={svgStyle}
                                        />
                                        <FormControl
                                            style={
                                                classes.displayListSectionInput
                                            }
                                            variant="standard">
                                            <Select
                                                style={
                                                    fileFormat === ''
                                                        ? classes.disabledText
                                                        : null
                                                }
                                                displayEmpty={true}
                                                open={openFileFormat}
                                                defaultValue="Open Raster"
                                                onClose={() => {
                                                    setOpenFileFormat(false);
                                                }}
                                                onOpen={() => {
                                                    setOpenFileFormat(true);
                                                }}
                                                value={fileFormat}
                                                onChange={(e) => {
                                                    setFileFormat(
                                                        e.target.value
                                                    );
                                                }}>
                                                <MenuItem value={''} disabled>
                                                    Output file format
                                                </MenuItem>

                                                <MenuItem value={'Open Raster'}>
                                                    Open Raster
                                                </MenuItem>
                                                <MenuItem value={'Zip Archive'}>
                                                    Zip Archive
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </FileManagementItem>
                                    <FileManagementItem>
                                        <FileAnnotationsIcon
                                            style={svgContainerStyle}
                                            svgStyle={svgStyle}
                                        />

                                        <FormControl
                                            style={
                                                classes.displayListSectionInput
                                            }
                                            variant="standard">
                                            <Select
                                                style={
                                                    annotationsFormat === ''
                                                        ? classes.disabledText
                                                        : null
                                                }
                                                displayEmpty={true}
                                                open={openAnnotationsFormat}
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
                                                value={annotationsFormat}
                                                onChange={(e) => {
                                                    setAnnotationsFormat(
                                                        e.target.value
                                                    );
                                                }}>
                                                <MenuItem disabled value={''}>
                                                    Annotations format
                                                </MenuItem>
                                                {Object.keys(
                                                    SETTINGS.ANNOTATIONS
                                                ).map((key, index) => {
                                                    return (
                                                        <MenuItem
                                                            key={index}
                                                            value={
                                                                SETTINGS
                                                                    .ANNOTATIONS[
                                                                    key
                                                                ]
                                                            }>
                                                            {
                                                                SETTINGS
                                                                    .ANNOTATIONS[
                                                                    key
                                                                ]
                                                            }
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </FileManagementItem>

                                    <FileManagementItem>
                                        <FileSuffixIcon
                                            style={svgContainerStyle}
                                            svgStyle={svgStyle}
                                        />
                                        <FormControl>
                                            <TextField
                                                required
                                                id="outputSuffix"
                                                placeholder="Filename suffix"
                                                value={fileSuffix}
                                                inputProps={{
                                                    size: '10',
                                                }}
                                                onChange={(e) => {
                                                    setFileSuffix(
                                                        e.target.value
                                                    );
                                                }}
                                                variant="standard"
                                            />
                                        </FormControl>
                                    </FileManagementItem>
                                </FileManagementSection>
                            </div>
                        </div>
                    </ScrollableContainer>

                    <SaveSettingsButton onClick={() => saveSettingsEvent()}>
                        Save Settings
                    </SaveSettingsButton>
                </StyledFormGroup>
            </ModalRoot>
        </StyledPaper>
    );

    return (
        <ThemeProvider theme={theme}>
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
