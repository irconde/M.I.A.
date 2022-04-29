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
    Snackbar,
    SnackbarContent,
    Switch,
    TextField,
} from '@mui/material';
import Modal from '@mui/material/Modal';
import ConnectionResult from './ConnectionResult';
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
    toggleSettingsVisibility,
} from '../../redux/slices/ui/uiSlice';
import {
    getLocalFileOutput,
    getSettings,
    saveSettings,
} from '../../redux/slices/settings/settingsSlice';
import socketIOClient from 'socket.io-client';
import { Channels, SETTINGS } from '../../utils/Constants';
import Utils from '../../utils/Utils';
import isElectron from 'is-electron';

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
    const settings = useSelector(getSettings);
    const initLocalFileOutput = useSelector(getLocalFileOutput);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [remoteIp, setRemoteIp] = useState(settings.remoteIp);
    const [remotePort, setRemotePort] = useState(settings.remotePort);
    const [autoConnect, setAutoConnect] = useState(settings.autoConnect);
    const [fileFormat, setFileFormat] = useState(settings.fileFormat);
    const [annotationsFormat, setAnnotationsFormat] = useState(
        settings.annotationsFormat
    );
    const [localFileOutput, setLocalFileOutput] = useState(
        initLocalFileOutput !== '' ? initLocalFileOutput : ''
    );
    const [fileSuffix, setFileSuffix] = useState(settings.fileSuffix);
    const [remoteOrLocal, setRemoteOrLocal] = useState(settings.remoteOrLocal);
    const [modalStyle] = useState(getModalStyle);
    const [openFileFormat, setOpenFileFormat] = useState(false);
    const [connectionDisplay, setConnectionDisplay] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [testConnectionResult, setTestConnectionResult] = useState(false);
    const [openAnnotationsFormat, setOpenAnnotationsFormat] = useState(false);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const dispatch = useDispatch();
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
            minWidth: '30vw',
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
     * Action triggered when the save settings button is tapped. It sends all data to the settings slice.
     * If the user entered connection information it will change the command server to the new one.
     */
    const saveSettingsEvent = () => {
        if (isElectron() && remoteOrLocal === false && localFileOutput !== '') {
            ipcRenderer
                .invoke(Channels.loadFiles, localFileOutput)
                .then((result) => {
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
                        })
                    );
                    dispatch(toggleSettingsVisibility(false));
                })
                .catch((error) => {
                    // TODO: Error handling for an incorrectly typed directory
                    console.log(error);
                });
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
                })
            );
            dispatch(toggleSettingsVisibility(false));
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
            type: 'dark',
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
        workingDirectory: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
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
        remoteWorkContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        switchContainer: {
            alignSelf: 'flex-end',
        },
        modal: {
            /*boxShadow: theme.shadows[5],*/
            padding: theme.spacing(2, 4, 4),
        },
        paper: {
            padding: theme.spacing(1),
            textAlign: 'center',
            /*color: theme.palette.text.primary,*/
        },
        selector: {},
        links: {
            /*fontSize: theme.typography.fontSize,*/
            color: theme.palette.primary,
            cursor: 'pointer',
        },
        linkSelected: {
            /*fontSize: theme.typography.fontSize,*/
            color: theme.palette.primary,
            background: '#515151',
            cursor: 'pointer',
        },
        root: {
            flexGrow: 1,
        },
        optionsContainer: {},
        form: {
            margin: theme.spacing(1),
        },
        formControl: {},
        textField: {},
        longTextField: {
            // width: '-webkit-fill-available',
            display: 'flex',
            flexDirection: 'row',
            width: '70%',
        },
        saveButton: {
            marginTop: theme.spacing(2),
            float: 'right',
            backgroundColor: '#367eff',
            display: 'flex',
            alignSelf: 'flex-end',
            outline: 'none',
            '&:hover': {
                backgroundColor: '#5e97ff',
                outline: 'none',
            },
        },
        connectionLabel: {
            margin: 'auto',
        },
        connectionSection: {
            display: 'flex',
            flexShrink: '0',
            flexDirection: 'row',
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
            justifyContent: 'flex-start',
            alignContent: 'center',
            alignItems: 'center',
        },
        circularProgress: {
            marginRight: theme.spacing(2),
            display: connecting ? 'none' : 'initial',
        },
        displayListSection: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            // alignItems: 'center',
            marginBottom: theme.spacing(2),
            marginTop: theme.spacing(4),
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
        greyText: {
            color: '#9d9d9d',
            fontSize: '12px',
            margin: '0',
            marginBottom: '2rem',
        },
        disabledText: {
            color: '#9d9d9d',
        },
        settingsContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: '1rem 0',
        },
        settingsCogwheel: {
            marginRight: '1rem',
            marginLeft: '0',
            width: '20px',
            height: '20px',
            alignSelf: 'center',
        },
        closeIconStyle: {
            alignSelf: 'center',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
        },
        settingsText: {
            objectFit: 'contain',
            fontFamily: 'Noto Sans JP',
            fontSize: '22px',
            fontWeight: '500',
            fontStretch: 'normal',
            fontStyle: 'normal',
            lineHeight: 'normal',
            letterSpacing: 'normal',
            color: '#fff',
            flex: 'auto',
            alignSelf: 'center',
        },
        optionText: {
            fontFamily: 'Noto Sans JP',
            fontSize: '1rem',
            fontWeight: 'normal',
            fontStretch: 'normal',
            fontStyle: 'normal',
            lineHeight: 'normal',
            letterSpacing: 'normal',
            color: '#fff',
            marginBottom: '0.25rem',
            marginTop: '0.75rem',
        },
        remoteInputContainer: {
            display: 'inline-flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '70%',
        },
        cloudIconContainer: {
            alignSelf: 'center',
        },
        autoConnectContainer: {
            display: 'inline-block',
            float: 'right',
            color: '#9d9d9d',
            marginTop: 'auto',
        },
        flexAuto: {
            flex: 'auto',
        },
        remoteWorkRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem',
        },
        displayListSectionItem: {
            display: 'flex',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            flexGrow: '1',
            width: '33%',
        },
        displayListSectionInput: {
            width: '70%',
        },
    };

    let body = (
        <Paper style={modalStyle} elevation={3}>
            <div style={classes.root}>
                <div style={classes.settingsContainer}>
                    <div style={classes.settingsCogwheel}>
                        <SettingsCog title={props.title} />
                    </div>
                    <div style={classes.settingsText}>Settings</div>
                    <div
                        onClick={() => handleClose()}
                        style={classes.closeIconStyle}>
                        <IcCloseIcon />
                    </div>
                </div>
                <Divider style={{ margin: 'auto' }} variant="middle" />
                <FormGroup style={classes.formControl}>
                    <div style={classes.optionsContainer}>
                        <div>
                            <div style={classes.remoteWorkContainer}>
                                <p style={classes.optionText}>
                                    Work connected to a remote service
                                </p>
                                <div style={classes.switchContainer}>
                                    <Switch
                                        checked={remoteOrLocal}
                                        size="small"
                                        onChange={() =>
                                            setRemoteOrLocal(!remoteOrLocal)
                                        }
                                        color="primary"
                                        name="remoteOrLocal"
                                        inputProps={{
                                            'aria-label': 'secondary checkbox',
                                        }}
                                    />
                                </div>
                            </div>
                            {isElectron() ? (
                                <p style={classes.greyText}>
                                    Choose the option if you want to
                                    receive/send images from/to a server
                                </p>
                            ) : null}

                            <div style={classes.remoteWorkRow}>
                                <div style={classes.remoteInputContainer}>
                                    <div style={classes.cloudIconContainer}>
                                        <CloudIcon
                                            style={svgContainerStyle}
                                            svgStyle={{
                                                ...svgStyle,
                                                color: remoteOrLocal
                                                    ? '#ffffff'
                                                    : '#9d9d9d',
                                            }}
                                        />
                                    </div>
                                    <FormControl style={classes.flexAuto}>
                                        <TextField
                                            required
                                            id="remoteIp"
                                            placeholder="Host"
                                            value={remoteIp}
                                            disabled={!remoteOrLocal}
                                            inputProps={{
                                                size: 30,
                                            }}
                                            onChange={(e) => {
                                                setRemoteIp(e.target.value);
                                            }}
                                            style={classes.textField}
                                            /*style={{
                                                marginRight: '0.75rem',
                                            }}*/
                                        />
                                    </FormControl>
                                    <span style={classes.cloudIconContainer}>
                                        :
                                    </span>
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
                                            style={classes.textField}
                                            /*style={{
                                                marginLeft: '0.75rem',
                                            }}*/
                                        />
                                    </FormControl>
                                </div>
                                <div style={classes.autoConnectContainer}>
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
                                </div>
                            </div>
                            <div style={classes.connectionSection}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={!remoteOrLocal}
                                    style={classes.checkConnectionButton}
                                    onClick={() => {
                                        testConnection();
                                    }}>
                                    {connecting ? (
                                        <div>
                                            <CircularProgress size={'24px'} />
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
                                </Button>

                                <ConnectionResult
                                    display={connectionDisplay}
                                    connected={testConnectionResult}
                                />
                            </div>
                        </div>
                        <div>
                            <Divider
                                style={{ margin: 'auto' }}
                                variant="middle"
                            />
                            <div>
                                <p style={classes.optionText}>
                                    File management
                                </p>
                                <p style={classes.greyText}>
                                    Default file management options to
                                    streamline file input and output
                                </p>
                                {isElectron() ? (
                                    <div style={classes.workingDirectory}>
                                        <FormControl
                                            style={classes.longTextField}>
                                            <FileOpenIcon
                                                style={svgContainerStyle}
                                                svgStyle={{
                                                    ...svgStyle,
                                                    color:
                                                        remoteOrLocal === true
                                                            ? '#9d9d9d'
                                                            : '#ffffff',
                                                }}
                                            />
                                            {/* TODO: For a user typing a directory, verify it exists when finished typing */}
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
                                            />
                                        </FormControl>
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
                                                                result.filePaths
                                                                    .length > 0
                                                            ) {
                                                                setLocalFileOutput(
                                                                    result
                                                                        .filePaths[0]
                                                                );
                                                            }
                                                        })
                                                        .catch((err) => {
                                                            console.log(err);
                                                        });
                                                }
                                            }}>
                                            Select Folder
                                        </Button>
                                    </div>
                                ) : (
                                    <></>
                                )}
                                <div style={classes.displayListSection}>
                                    <div style={classes.displayListSectionItem}>
                                        <FileFormatIcon
                                            style={svgContainerStyle}
                                            svgStyle={svgStyle}
                                        />
                                        <FormControl
                                            style={
                                                classes.displayListSectionInput
                                            }>
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
                                    </div>
                                    <div style={classes.displayListSectionItem}>
                                        <FileAnnotationsIcon
                                            style={svgContainerStyle}
                                            svgStyle={svgStyle}
                                        />
                                        <FormControl
                                            style={
                                                classes.displayListSectionInput
                                            }>
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
                                    </div>
                                    <div style={classes.displayListSectionItem}>
                                        <FileSuffixIcon
                                            style={svgContainerStyle}
                                            svgStyle={svgStyle}
                                        />
                                        <FormControl
                                            style={
                                                classes.displayListSectionInput
                                            }>
                                            <TextField
                                                style={classes.textField}
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
                                            />
                                        </FormControl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outlined"
                        onClick={() => saveSettingsEvent()}>
                        Save Settings
                    </Button>
                </FormGroup>
            </div>
        </Paper>
    );

    return (
        <ThemeProvider theme={theme}>
            <Modal
                open={settingsVisibility}
                onClose={handleClose}
                aria-labelledby="settings-window"
                aria-describedby="control the apps remote and local settings">
                <div>{body}</div>
            </Modal>
        </ThemeProvider>
    );
};

SettingsModal.propTypes = {
    title: PropTypes.string,
    connectToCommandServer: PropTypes.func,
};

export default SettingsModal;
