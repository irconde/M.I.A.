import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Paper,
    Button,
    Divider,
    TextField,
    FormControl,
    FormGroup,
    Select,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Switch,
    Snackbar,
    SnackbarContent,
} from '@material-ui/core';
import {
    makeStyles,
    createTheme,
    ThemeProvider,
} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { CircularProgress } from '@material-ui/core';
import {
    toggleSettingsVisibility,
    getSettingsVisibility,
} from '../../redux/slices/ui/uiSlice';
import { saveSettings } from '../../redux/slices/settings/settingsSlice';
import SettingsCog from '../../icons/SettingsCog';
import { ReactComponent as IcCloseIcon } from '../../icons/ic_close.svg';
import CloudIcon from '../../icons/CloudIcon.js';
import CheckConnectionIcon from '../../icons/CheckConnectionIcon.js';
import FileOpenIcon from '../../icons/FileOpenIcon.js';
import FileAnnotationsIcon from '../../icons/FileAnnotationsIcon.js';
import FileFormatIcon from '../../icons/FileFormatIcon.js';
import FileSuffixIcon from '../../icons/FileSuffixIcon.js';
import ConnectionResult from './ConnectionResult';
import socketIOClient from 'socket.io-client';
import { SETTINGS } from '../../utils/Constants';

const SettingsModal = (props) => {
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [remoteIp, setRemoteIp] = useState('127.0.0.1');
    const [remotePort, setRemotePort] = useState('4001');
    const [autoConnect, setAutoConnect] = useState(true);
    const [fileFormat, setFileFormat] = useState('ORA');
    const [annotationsFormat, setAnnotationsFormat] = useState('');
    const [localFileOutput, setLocalFileOutput] = useState('');
    const [fileSuffix, setFileSuffix] = useState('');
    const [remoteOrLocal, setRemoteOrLocal] = useState(true);
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
        display: 'flex',
    };
    const svgStyle = {
        height: '24px',
        width: '24px',
        color: '#ffffff',
    };
    const getPath = () => {
        var path = 'C:/user_example/test_output_folder';
        return path;
    };

    /**
     * handleSnackBarClose - Event handler for when the snackbar closes
     *
     * @param {Event} event
     * @param {String} reason
     * @returns
     */
    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    /**
     * getModalStyle - Returns the main modal body style
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
        };
    }

    /**
     * testConnection - Will a test connection with the typed input fields. This does some simulation
     *                  by using setTimeout to provide useful user interaction and feedback.
     *
     * @param {None}
     * @returns {None}
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
     * handleClose - For when the user taps the Close X Icon or outside the modal window. Does not save settings.
     *
     * @param {None}
     * @returns {None}
     */
    const handleClose = () => {
        dispatch(toggleSettingsVisibility(false));
    };

    /**
     * saveSettingsEvent - For when the save settings button is tapped. Will send all data to the settings slice.
     *                     If the user entered connection information it will change the command server to the new one.
     */
    const saveSettingsEvent = () => {
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
            })
        );
        dispatch(toggleSettingsVisibility(false));
        if (remoteIp !== '' || remotePort !== '') {
            setTimeout(() => {
                props.connectToCommandServer(true);
            }, 0);
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
    });

    const useStyles = makeStyles((theme) => {
        return {
            pathButton: {
                color: '#367eff',
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
                boxShadow: theme.shadows[5],
                padding: theme.spacing(2, 4, 3),
            },
            paper: {
                padding: theme.spacing(1),
                textAlign: 'center',
                color: theme.palette.text.primary,
            },
            selector: {},
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
            root: {
                flexGrow: 1,
            },
            optionsContainer: {
                padding: theme.spacing(2),
            },
            form: {
                margin: theme.spacing(1),
            },
            formControl: {
                margin: theme.spacing(1),
            },
            textField: {
                margin: theme.spacing(1),
            },
            longTextField: {
                // width: '-webkit-fill-available',
                display: 'flex',
                flexDirection: 'row',
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
                justifyContent: 'space-evenly',
                alignItems: 'center',
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
                marginRight: '0.5rem',
                marginLeft: '1rem',
                width: '20px',
                height: '20px',
                alignSelf: 'center',
            },
            closeIconStyle: {
                marginRight: '1.5rem',
                alignSelf: 'center',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
            },
            settingsText: {
                objectFit: 'contain',
                fontFamily: 'Noto Sans JP',
                fontSize: '26px',
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
                fontSize: '18px',
                fontWeight: 'normal',
                fontStretch: 'normal',
                fontStyle: 'normal',
                lineHeight: 'normal',
                letterSpacing: 'normal',
                color: '#fff',
                marginBottom: '0.25rem',
            },
            remoteInputContainer: {
                display: 'inline-flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            cloudIconContainer: {
                alignSelf: 'center',
            },
            autoConnectContainer: {
                display: 'inline-block',
                float: 'right',
                color: '#9d9d9d',
            },
            flexAuto: {
                flex: 'auto',
            },
        };
    });

    const classes = useStyles();

    let body = (
        <Paper style={modalStyle} elevation={3} className={classes.modal}>
            <div className={classes.root}>
                <div className={classes.settingsContainer}>
                    <div className={classes.settingsCogwheel}>
                        <SettingsCog title={props.title} />
                    </div>
                    <div className={classes.settingsText}>Settings</div>
                    <div
                        onClick={() => handleClose()}
                        className={classes.closeIconStyle}>
                        <IcCloseIcon />
                    </div>
                </div>
                <Divider variant="middle" />
                <FormGroup className={classes.formControl}>
                    <div className={classes.optionsContainer}>
                        <div>
                            <div className={classes.remoteWorkContainer}>
                                <p className={classes.optionText}>
                                    Work connected to a remote service
                                </p>
                                <div className={classes.switchContainer}>
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
                            <p className={classes.greyText}>
                                Choose the option if you want to receive/send
                                images from/to a server
                            </p>
                            <div className={classes.remoteInputContainer}>
                                <div className={classes.cloudIconContainer}>
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
                                <FormControl className={classes.flexAuto}>
                                    <TextField
                                        required
                                        className={classes.textField}
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
                                    />
                                </FormControl>
                                <span className={classes.cloudIconContainer}>
                                    :
                                </span>
                                <FormControl>
                                    <TextField
                                        required
                                        id="remotePort"
                                        className={classes.textField}
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
                                    />
                                </FormControl>
                            </div>
                            <div className={classes.autoConnectContainer}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            disabled={!remoteOrLocal}
                                            color={'primary'}
                                            checked={autoConnect}
                                            onChange={() => {
                                                setAutoConnect(!autoConnect);
                                            }}
                                            name="autoConnect"
                                        />
                                    }
                                    label="Autoconnect"
                                />
                            </div>
                            <div className={classes.connectionSection}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    className={classes.checkConnectionButton}
                                    disabled={!remoteOrLocal}
                                    onClick={() => {
                                        testConnection();
                                    }}>
                                    {connecting ? (
                                        <div className={classes.checkIcon}>
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
                                    Check Connection
                                </Button>

                                <ConnectionResult
                                    display={connectionDisplay}
                                    connected={testConnectionResult}
                                />
                            </div>
                        </div>
                        <Divider style={{ margin: 'auto' }} variant="middle" />
                        <div>
                            <p className={classes.optionText}>
                                File management
                            </p>
                            <p className={classes.greyText}>
                                Default file management options to streamline
                                file input and output
                            </p>
                            <div className={classes.workingDirectory}>
                                <FormControl className={classes.longTextField}>
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
                                    <TextField
                                        required
                                        fullWidth={true}
                                        id="localFileOutput"
                                        placeholder={'Working directory'}
                                        value={localFileOutput}
                                        disabled={remoteOrLocal}
                                        inputProps={{
                                            size: '40',
                                        }}
                                        onChange={(e) => {
                                            setLocalFileOutput(e.target.value);
                                        }}
                                    />
                                </FormControl>
                                <Button
                                    className={classes.pathButton}
                                    disabled={remoteOrLocal}
                                    variant="outlined"
                                    size="medium"
                                    onClick={() => {
                                        setLocalFileOutput(getPath());
                                    }}>
                                    Select Folder
                                </Button>
                            </div>
                            <div className={classes.displayListSection}>
                                <FileFormatIcon
                                    style={svgContainerStyle}
                                    svgStyle={svgStyle}
                                />
                                <FormControl>
                                    <Select
                                        displayEmpty={true}
                                        open={openFileFormat}
                                        defaultValue={'ORA'}
                                        className={
                                            fileFormat === ''
                                                ? classes.disabledText
                                                : null
                                        }
                                        onClose={() => {
                                            setOpenFileFormat(false);
                                        }}
                                        onOpen={() => {
                                            setOpenFileFormat(true);
                                        }}
                                        value={fileFormat}
                                        onChange={(e) => {
                                            setFileFormat(e.target.value);
                                        }}>
                                        <MenuItem value={''} disabled>
                                            Output file format
                                        </MenuItem>
                                        <MenuItem value={'ORA'}>
                                            Open Raster
                                        </MenuItem>
                                        <MenuItem value={'ZIP'}>
                                            Zip Archive
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <FileAnnotationsIcon
                                    style={svgContainerStyle}
                                    svgStyle={svgStyle}
                                />
                                <FormControl>
                                    <Select
                                        displayEmpty={true}
                                        open={openAnnotationsFormat}
                                        className={
                                            annotationsFormat === ''
                                                ? classes.disabledText
                                                : null
                                        }
                                        onClose={() => {
                                            setOpenAnnotationsFormat(false);
                                        }}
                                        onOpen={() => {
                                            setOpenAnnotationsFormat(true);
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
                                        {Object.keys(SETTINGS.ANNOTATIONS).map(
                                            (key, index) => {
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
                                            }
                                        )}
                                    </Select>
                                </FormControl>
                                <FileSuffixIcon
                                    style={svgContainerStyle}
                                    svgStyle={svgStyle}
                                />
                                <FormControl>
                                    <TextField
                                        required
                                        className={classes.textField}
                                        id="outputSuffix"
                                        placeholder="Filename suffix"
                                        value={fileSuffix}
                                        inputProps={{
                                            size: '10',
                                        }}
                                        onChange={(e) => {
                                            setFileSuffix(e.target.value);
                                        }}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <Button
                        className={classes.saveButton}
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
                onClose={() => handleClose()}
                aria-labelledby="settings-window"
                aria-describedby="control the apps remote and local settings">
                {body}
            </Modal>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={snackBarOpen}
                autoHideDuration={3000}
                onClose={handleSnackBarClose}>
                <SnackbarContent
                    message="Settings Saved"
                    className={classes.snackBarClass}
                />
            </Snackbar>
        </ThemeProvider>
    );
};

SettingsModal.propTypes = {
    title: PropTypes.string,
    connectToCommandServer: PropTypes.func,
};

export default SettingsModal;
