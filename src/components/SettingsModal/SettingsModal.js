import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
    Grid,
    Paper,
    Button,
    Divider,
    Typography,
    TextField,
    InputLabel,
    FormControl,
    FormGroup,
    Select,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Switch,
    withStyles,
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
import {
    getSettings,
    setAnnotationsFormat,
    setAutoConnect,
    setFileFormat,
    setFileSuffix,
    setLocalFileOutput,
    setRemoteIp,
    setRemoteOrLocal,
    setRemotePort,
} from '../../redux/slices/settings/settingsSlice';
import {
    getConnected,
    setConnected,
} from '../../redux/slices/server/serverSlice';
import SettingsCog from '../../icons/SettingsCog';
import { ReactComponent as CloseIcon } from '../../icons/ic_close.svg';
import { ReactComponent as CloudIcon } from '../../icons/ic_cloud.svg';
import CheckConnectionIcon from '../../icons/CheckConnectionIcon.js';
import FileOpenIcon from '../../icons/FileOpenIcon.js';
import FileAnnotationsIcon from '../../icons/FileAnnotationsIcon.js';
import FileFormatIcon from '../../icons/FileFormatIcon.js';
import FileSuffixIcon from '../../icons/FileSuffixIcon.js';
import ConnectionResult from './ConnectionResult';
import socketIOClient from 'socket.io-client';

const CustomSwitch = withStyles({
    colorSecondary: {
        '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#367eff',
        },
    },
    track: {
        backgroundColor: '#fff',
    },
    thumb: {
        backgroundColor: 'black',
    },
})(Switch);

const SettingsModal = (props) => {
    // TODO: Do we update the settings as typed or upon save settings?
    const settings = useSelector(getSettings);
    const {
        remoteIp,
        remotePort,
        autoConnect,
        fileFormat,
        annotationsFormat,
        localFileOutput,
        fileSuffix,
        remoteOrLocal,
    } = settings;
    const connected = useSelector(getConnected);
    const [modalStyle] = useState(getModalStyle);
    const [openFileFormat, setOpenFileFormat] = useState(false);
    const [connectionDisplay, setConnectionDisplay] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [testConnectionResult, setTestConnectionResult] = useState(false);
    const [openAnnotationsFormat, setOpenAnnotationsFormat] = useState(false);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const dispatch = useDispatch();

    const getPath = () => {
        var path = 'C:/user_example/test_output_folder';
        return path;
    };

    function getModalStyle() {
        return {
            position: 'absolute',
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
            backgroundColor: '#1f1f1f',
            outline: 'none',
            fontFamily: 'NotoSansJP',
            minWidth: '30vw',
        };
    }

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
            if (err.message === 'xhr poll error') {
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

    const handleClose = () => {
        dispatch(toggleSettingsVisibility(false));
    };

    const theme = createTheme({
        palette: {
            type: 'dark',
        },
    });

    const useStyles = makeStyles((theme) => {
        return {
            workingDirectory: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
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
                width: '-webkit-fill-available',
            },
            saveButton: {
                marginTop: theme.spacing(2),
                float: 'right',
                backgroundColor: '#367eff',
                display: 'flex',
                alignSelf: 'flex-end',
                outline: 'none',
                '&:hover': {
                    backgroundColor: '#71a4ff',
                    outline: 'none',
                },
            },
            connectionLabel: {
                margin: 'auto',
            },
            connectionSection: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(2),
            },
            circularProgress: {
                marginRight: theme.spacing(2),
                display: connected ? 'none' : 'initial',
            },
            displayListSection: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                alignItems: 'center',
                marginBottom: theme.spacing(2),
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
                fontSize: '10px',
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
                fontFamily: 'NotoSansJP',
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
                fontFamily: 'NotoSansJP',
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
                        <CloseIcon />
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
                                    <CustomSwitch
                                        checked={remoteOrLocal}
                                        size="small"
                                        onChange={() =>
                                            dispatch(
                                                setRemoteOrLocal(!remoteOrLocal)
                                            )
                                        }
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
                                    <CloudIcon />
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
                                            dispatch(
                                                setRemoteIp(e.target.value)
                                            );
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
                                            dispatch(
                                                setRemotePort(e.target.value)
                                            );
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
                                            checked={autoConnect}
                                            onChange={() => {
                                                dispatch(
                                                    setAutoConnect(!autoConnect)
                                                );
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
                                    className={classes.checkConnectionButton}
                                    disabled={!remoteOrLocal}
                                    onClick={() => {
                                        testConnection();
                                    }}>
                                    {connecting ? (
                                        <div className={classes.checkIcon}>
                                            <CircularProgress size={'22px'} />
                                        </div>
                                    ) : (
                                        <CheckConnectionIcon
                                            style={{
                                                margin: '0.3rem',
                                                display: 'flex',
                                            }}
                                            svgStyle={{
                                                height: '24px',
                                                width: '24px',
                                                color: '#367eff',
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
                                        style={{
                                            margin: '0.3rem',
                                            display: 'flex',
                                        }}
                                        svgStyle={{
                                            height: '24px',
                                            width: '24px',
                                            color:
                                                remoteOrLocal === true
                                                    ? '#d1d1d1'
                                                    : '#ffffff',
                                        }}
                                    />
                                    <TextField
                                        required
                                        id="localFileOutput"
                                        placeholder={'Working directory'}
                                        value={localFileOutput}
                                        disabled={remoteOrLocal}
                                        inputProps={
                                            {
                                                // size: '40',
                                            }
                                        }
                                        onChange={(e) => {
                                            dispatch(
                                                setLocalFileOutput(
                                                    e.target.value
                                                )
                                            );
                                        }}
                                    />
                                </FormControl>
                                <Button
                                    className={classes.pathButton}
                                    disabled={remoteOrLocal}
                                    variant="outlined"
                                    size={'small'}
                                    onClick={() => {
                                        dispatch(setLocalFileOutput(getPath()));
                                    }}>
                                    Select Folder
                                </Button>
                            </div>
                            <div className={classes.displayListSection}>
                                <FileFormatIcon
                                    style={{
                                        margin: '0.3rem',
                                        display: 'flex',
                                    }}
                                    svgStyle={{
                                        height: '24px',
                                        width: '24px',
                                        color: '#ffffff',
                                    }}
                                />
                                <Select
                                    displayEmpty={true}
                                    open={openFileFormat}
                                    onClose={() => {
                                        setOpenFileFormat(false);
                                    }}
                                    onOpen={() => {
                                        setOpenFileFormat(true);
                                    }}
                                    value={fileFormat}
                                    onChange={(e) => {
                                        dispatch(setFileFormat(e.target.value));
                                    }}>
                                    <MenuItem value={''}>
                                        Output file format
                                    </MenuItem>
                                    <MenuItem value={'ORA'}>ORA</MenuItem>
                                    <MenuItem value={'ZIP'}>ZIP</MenuItem>
                                </Select>
                                <FileAnnotationsIcon
                                    style={{
                                        margin: '0.3rem',
                                        display: 'flex',
                                    }}
                                    svgStyle={{
                                        height: '24px',
                                        width: '24px',
                                        color: '#ffffff',
                                    }}
                                />
                                <Select
                                    displayEmpty={true}
                                    open={openAnnotationsFormat}
                                    onClose={() => {
                                        setOpenAnnotationsFormat(false);
                                    }}
                                    onOpen={() => {
                                        setOpenAnnotationsFormat(true);
                                    }}
                                    value={annotationsFormat}
                                    onChange={(e) => {
                                        dispatch(
                                            setAnnotationsFormat(e.target.value)
                                        );
                                    }}>
                                    <MenuItem value={''}>
                                        Annotations format
                                    </MenuItem>
                                    <MenuItem value={'MS COCO'}>
                                        MS COCO
                                    </MenuItem>
                                    <MenuItem value={'Pascal VOC'}>
                                        Pascal VOC
                                    </MenuItem>
                                </Select>
                                <FileSuffixIcon
                                    style={{
                                        margin: '0.3rem',
                                        display: 'flex',
                                    }}
                                    svgStyle={{
                                        height: '24px',
                                        width: '24px',
                                        color: '#ffffff',
                                    }}
                                />
                                <FormControl>
                                    <TextField
                                        required
                                        className={classes.textField}
                                        id="outputSuffix"
                                        placeholder="Filename suffix"
                                        value={fileSuffix}
                                        onChange={(e) => {
                                            dispatch(
                                                setFileSuffix(e.target.value)
                                            );
                                        }}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <Button
                        className={classes.saveButton}
                        variant="outlined"
                        onClick={() => handleClose()}>
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
        </ThemeProvider>
    );
};

SettingsModal.propTypes = {
    title: PropTypes.string,
    connectToCommandServer: PropTypes.func,
};

export default SettingsModal;
