import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Grid, Paper, Button, Divider, Typography, TextField, InputLabel, FormControl, Input } from '@material-ui/core';
import { makeStyles, createTheme, ThemeProvider } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { CircularProgress } from "@material-ui/core";

const SettingsIcon = ({ title }) => {

    const [modalStyle] = useState(getModalStyle);
    const [remoteSelected, selector] = useState(false);
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const [settingsInputIP, setSettingsInputIP] = useState();

    // const handleChange = e => {
    //     setBody(e.target.value);
    // };
    
    // const handleSubmit = e => {
    //   e.preventDefault();
    //   console.log("body", textBody);
    // };

    function getModalStyle() {
        return {
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
        };
    }

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
            selector: {

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
            root: {
                flexGrow: 1,
            },
            topSection: {
                margin: theme.spacing(2,1),
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
            container: {
              display: 'flex',
              flexWrap: 'wrap',
            },
        }
    });

    const classes = useStyles();

    let body = (
            <Paper 
                style={modalStyle}
                elevation={3}
                className={classes.modal}>
                    <div className={classes.root}>
                        <Grid container 
                        spacing={2}
                        direction={'row'}
                        justifyContent={'center'}
                        className={classes.topSection}>
                            <Grid item>
                                <Button variant="body2" className={remoteSelected ? classes.links : classes.linkSelected} onClick={() => selector(false)}>
                                Local files
                                </Button>
                            </Grid>
                            <Divider orientation="vertical" flexItem />
                            <Grid item>
                                <Button variant="body2" className={remoteSelected ? classes.linkSelected : classes.links} onClick={() => selector(true)}>
                                Remote service
                                </Button>
                            </Grid>
                        </Grid>
                        <Divider variant="middle"/>

                        <div className={classes.optionsContainer}>
                            <div className={classes.localFileOptions}>
                                <h1>Local file settings</h1>
                                <TextField></TextField>
                                <FormControl className={classes.formControl}>
                                    <InputLabel htmlFor="name-simple">Name</InputLabel>
                                    <Input id="name-simple" value={settingsInputIP} onChange={(e) => {setSettingsInputIP(e.target.value)}} />
                                </FormControl>
                            </div>

                            <div className={classes.remoteServiceOptions}> 
                                <h1>Remote service settings</h1>
                            </div>

                        </div>

                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </div>
            </Paper>
    );

    const IconStyle = styled.div`
        margin: 1rem 2.5rem 0.5rem 0rem;
    `;

    return (
        <ThemeProvider theme={ theme }>
            <>
                <IconStyle onClick={handleOpen}>
                    <svg
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg">
                        <title>{title}</title>
                        <g
                            id="Page-1"
                            stroke="none"
                            strokeWidth="1"
                            fill="none"
                            fillRule="evenodd">
                            <g
                                id="collapsible_menu_02"
                                transform="translate(-1286.000000, -14.000000)">
                                <g
                                    id="settings_white_24dp"
                                    transform="translate(1286.000000, 14.000000)">
                                    <polygon
                                        id="Path"
                                        points="0 0 24 0 24 24 0 24"></polygon>
                                    <path
                                        d="M19.2092523,12.5366071 C19.2496402,12.2285714 19.2698342,11.9102679 19.2698342,11.5714286 C19.2698342,11.2428571 19.2496402,10.9142857 19.1991553,10.60625 L21.2488446,8.98392857 C21.4305905,8.84017857 21.4810755,8.56294643 21.3700085,8.35758929 L19.4313861,4.94866071 C19.3102222,4.72276786 19.0577974,4.65089286 18.8356636,4.72276786 L16.4224825,5.70848214 C15.9176329,5.31830357 15.3824923,4.98973214 14.7867698,4.74330357 L14.4232781,2.13526786 C14.3828901,1.88883929 14.1809503,1.71428571 13.9386225,1.71428571 L10.0613775,1.71428571 C9.81904974,1.71428571 9.62720689,1.88883929 9.58681892,2.13526786 L9.22332721,4.74330357 C8.62760468,4.98973214 8.08236712,5.32857143 7.58761451,5.70848214 L5.17443343,4.72276786 C4.95229961,4.640625 4.69987481,4.72276786 4.57871091,4.94866071 L2.65018544,8.35758929 C2.52902154,8.57321429 2.56940951,8.84017857 2.77134935,8.98392857 L4.82103871,10.60625 C4.77055375,10.9142857 4.73016579,11.253125 4.73016579,11.5714286 C4.73016579,11.8897321 4.75035977,12.2285714 4.80084473,12.5366071 L2.75115536,14.1589286 C2.56940951,14.3026786 2.51892455,14.5799107 2.62999146,14.7852679 L4.56861392,18.1941964 C4.68977782,18.4200893 4.94220262,18.4919643 5.16433644,18.4200893 L7.57751752,17.434375 C8.08236712,17.8245536 8.61750769,18.153125 9.21323022,18.3995536 L9.57672193,21.0075893 C9.62720689,21.2540179 9.81904974,21.4285714 10.0613775,21.4285714 L13.9386225,21.4285714 C14.1809503,21.4285714 14.3828901,21.2540179 14.4131811,21.0075893 L14.7766728,18.3995536 C15.3723953,18.153125 15.9176329,17.8245536 16.4123855,17.434375 L18.8255666,18.4200893 C19.0477004,18.5022321 19.3001252,18.4200893 19.4212891,18.1941964 L21.3599115,14.7852679 C21.4810755,14.559375 21.4305905,14.3026786 21.2387476,14.1589286 L19.2092523,12.5366071 Z M12,15.2678571 C10.0007956,15.2678571 8.36508289,13.6044643 8.36508289,11.5714286 C8.36508289,9.53839286 10.0007956,7.875 12,7.875 C13.9992044,7.875 15.6349171,9.53839286 15.6349171,11.5714286 C15.6349171,13.6044643 13.9992044,15.2678571 12,15.2678571 Z"
                                        id="Shape"
                                        fill="#FFFFFF"
                                        fillRule="nonzero"></path>
                                </g>
                            </g>
                        </g>
                    </svg>
                </IconStyle>
                
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description">
                    {body}
                </Modal>
            </>
        </ThemeProvider>
    );
};

SettingsIcon.propTypes = {
    title: PropTypes.string,
};

export default SettingsIcon;
