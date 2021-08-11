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
    const [remoteSelected, selector] = useState(false);
    const [openFileFormat, setOpenFileFormat] = useState(false);
    const [openAnnotationsFormat, setOpenAnnotationsFormat] = useState(false);
    // const [pathInput, setPath] = useState('');
    // const [suffixInput, setSuffix] = useState('');

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
                border: '2px solid #000',
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
            topSection: {
                margin: theme.spacing(2, 1),
            },
            optionsContainer: {
                padding: theme.spacing(2),
            },
            localFileOptions: {
                display: remoteSelected ? 'none' : 'initial',
            },
            remoteServiceOptions: {
                display: remoteSelected ? 'initial' : 'none',
            },
            form: {
                margin: theme.spacing(1),
            },
            formControl: {
                margin: theme.spacing.unit,
            },
            textField: {
                margin: theme.spacing.unit,
            },
            closeButton: {
                marginTop: theme.spacing(2),
                float: 'right',
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
                flexWrap: 'wrap',
            },
        };
    });

    const classes = useStyles();

    let body = (
        <Paper style={modalStyle} elevation={3} className={classes.modal}>
            <div className={classes.root}>
                <Grid
                    container
                    spacing={2}
                    direction={'row'}
                    justifyContent={'center'}
                    className={classes.topSection}>
                    <Grid item>
                        <Button
                            variant="body2"
                            className={
                                remoteSelected
                                    ? classes.links
                                    : classes.linkSelected
                            }
                            onClick={() => selector(false)}>
                            Local files
                        </Button>
                    </Grid>
                    <Divider orientation="vertical" flexItem />
                    <Grid item>
                        <Button
                            variant="body2"
                            className={
                                remoteSelected
                                    ? classes.linkSelected
                                    : classes.links
                            }
                            onClick={() => selector(true)}>
                            Remote service
                        </Button>
                    </Grid>
                </Grid>
                <Divider variant="middle" />

                <div className={classes.optionsContainer}>
                    <div className={classes.localFileOptions}>
                        <h1>Local file settings</h1>

                        <FormControl className={classes.formControl}>
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
                                    <TextField
                                        required
                                        className={classes.textField}
                                        id="standard-required"
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
                                    <TextField
                                        required
                                        className={classes.textField}
                                        id="standard-required"
                                        label="Save files with suffix:"
                                        value={fileSuffix}
                                        onChange={(e) => {
                                            dispatch(
                                                setFileSuffix(e.target.value)
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </FormControl>
                    </div>

                    <div className={classes.remoteServiceOptions}>
                        <h1>Remote service settings</h1>
                        <FormControl className={classes.formControl}>
                            <TextField
                                required
                                className={classes.textField}
                                id="standard-required"
                                label="IP Address:"
                                value={remoteIp}
                                onChange={(e) => {
                                    dispatch(setRemoteIp(e.target.value));
                                }}
                            />
                            <TextField
                                required
                                id="standard-required"
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
                                className={classes.closeButton}
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
                        </FormControl>
                    </div>
                </div>

                <Button
                    className={classes.closeButton}
                    variant="outlined"
                    onClick={() => handleClose()}>
                    Close
                </Button>
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
