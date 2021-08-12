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
    setRemotePort,
} from '../../redux/slices/settings/settingsSlice';
import {
    getConnected,
    setConnected,
} from '../../redux/slices/server/serverSlice';
import SettingsCog from '../../icons/SettingsCog';

const SettingsModal = (props) => {
    const settings = useSelector(getSettings);
    const {
        remoteIp,
        remotePort,
        autoConnect,
        fileFormat,
        annotationsFormat,
        localFileOutput,
        fileSuffix,
    } = settings;
    const connected = useSelector(getConnected);
    const [modalStyle] = useState(getModalStyle);
    const [openFileFormat, setOpenFileFormat] = useState(false);
    const [openAnnotationsFormat, setOpenAnnotationsFormat] = useState(false);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const dispatch = useDispatch();

    const getPath = () => {
        var path = 'C:/user_example/test_output_folder';
        return path;
    };

    function getModalStyle() {
        return {
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
            backgroundColor: '#1f1f1f',
            border: '0',
            outline: 'none',
        };
    }

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
            modal: {
                position: 'absolute',
                minWidth: '60vw',
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
            saveButton: {
                marginTop: theme.spacing(2),
                float: 'right',
                backgroundColor: '#367eff',
                display: 'flex',
                alignSelf: 'flex-end',
            },
            connectionLabel: {
                margin: 'auto',
            },
            connectionSection: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
                marginTop: theme.spacing(2),
            },
            circularProgress: {
                marginRight: theme.spacing(2),
                display: connected ? 'none' : 'initial',
            },
            displayListSection: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'start',
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
                color: 'gray',
            },
            settingsContainer: {
                display: 'flex',
                flexDirection: 'row',
            },
            settingsCogwheel: {
                marginTop: '1.6rem',
                marginRight: '1.5rem',
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
                    <h2>Settings</h2>
                </div>
                <Divider variant="middle" />
                <FormGroup className={classes.formControl}>
                    <div className={classes.optionsContainer}>
                        <div>
                            <h4>Work connected to a remote service</h4>
                            <p className={classes.greyText}>
                                Chose the option if you want to receive/send
                                images from/to a server
                            </p>
                            <FormControl>
                                <TextField
                                    required
                                    className={classes.textField}
                                    id="remoteIp"
                                    label="IP Address:"
                                    value={remoteIp}
                                    onChange={(e) => {
                                        dispatch(setRemoteIp(e.target.value));
                                    }}
                                />
                            </FormControl>
                            <FormControl>
                                <TextField
                                    required
                                    id="remotePort"
                                    className={classes.textField}
                                    label="Port:"
                                    value={remotePort}
                                    onChange={(e) => {
                                        dispatch(setRemotePort(e.target.value));
                                    }}
                                    inputProps={{
                                        maxLength: 4,
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                    }}
                                />
                            </FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={autoConnect}
                                        onChange={() => {
                                            dispatch(
                                                setAutoConnect(!autoConnect)
                                            );
                                        }}
                                        name="autoConnect"
                                    />
                                }
                                label="AutoConnect?"
                            />
                            <div className={classes.connectionSection}>
                                <CircularProgress
                                    className={classes.circularProgress}
                                />
                                <Typography className={classes.connectionLabel}>
                                    {connected ? 'Connected' : 'Connecting...'}
                                </Typography>
                            </div>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    // setConnectionStatus(checkConnection());
                                    dispatch(setConnected(false));
                                    setTimeout(() => {
                                        props.connectToCommandServer(true);
                                    }, 750);
                                }}>
                                Connect
                            </Button>
                        </div>
                        <Divider variant="middle" />
                        <div>
                            <h4>File management</h4>
                            <p className={classes.greyText}>
                                Default file management options to streamline
                                file input and output
                            </p>
                            <div className={classes.displayListSection}>
                                <Typography className={classes.sectionLabel}>
                                    Output file format:
                                </Typography>
                                <Select
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
                                    <MenuItem value={'ORA'}>ORA</MenuItem>
                                    <MenuItem value={'ZIP'}>ZIP</MenuItem>
                                </Select>
                            </div>

                            <div className={classes.displayListSection}>
                                <Typography className={classes.sectionLabel}>
                                    Annotations format:
                                </Typography>
                                <Select
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
                                    <MenuItem value={'MS COCO'}>
                                        MS COCO
                                    </MenuItem>
                                    <MenuItem value={'Pascal VOC'}>
                                        Pascal VOC
                                    </MenuItem>
                                </Select>
                            </div>
                            <div className={classes.outputFolderSection}>
                                <div
                                    className={
                                        classes.outputFolderSectionLabel
                                    }>
                                    <Typography>Output folder path:</Typography>
                                </div>
                                <div
                                    className={
                                        classes.outputFolderSectionContent
                                    }>
                                    <FormControl>
                                        <TextField
                                            required
                                            className={classes.textField}
                                            id="localFileOutput"
                                            label="Path:"
                                            value={localFileOutput}
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
                                        variant="outlined"
                                        onClick={() => {
                                            dispatch(
                                                setLocalFileOutput(getPath())
                                            );
                                        }}>
                                        Add path
                                    </Button>
                                </div>
                                <div className={classes.suffixSection}>
                                    <FormControl>
                                        <TextField
                                            required
                                            className={classes.textField}
                                            id="outputSuffix"
                                            label="Save files with suffix:"
                                            value={fileSuffix}
                                            onChange={(e) => {
                                                dispatch(
                                                    setFileSuffix(
                                                        e.target.value
                                                    )
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </div>
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
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description">
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
