import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FileQueueIcon from '../../icons/FileQueueIcon';
import SettingsIcon from '../../icons/SettingsIcon';
import { getTopBarInfo } from '../../redux/slices/server/serverSlice';
import ConnectionStatus from './ConnectionStatus';
import FileUploadStatus from './FileUploadStatus';
import MenuToggleIcon from '../../icons/MenuToggleIcon';
import {
    getFirstDisplaySettings,
    getHasFileOutput,
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import OpenIcon from '../../icons/OpenIcon';
import { ConnectionTypeInfo, InfoDivider, TitleLabelContainer, TopBarStyle } from './top-bar-styles';

/**
 * Component for GUI's top bar display.
 *
 * @component
 *
 */
const TopBar = (props) => {
    const reduxInfo = useSelector(getTopBarInfo);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const hasFileOutput = useSelector(getHasFileOutput);
    const localFileOutput = useSelector(getLocalFileOutput);
    const firstDisplaySettings = useSelector(getFirstDisplaySettings);

    const {
        processingFile,
        connectedServer,
        numberOfFiles,
        isDownload,
        isUpload,
        isConnected,
    } = reduxInfo;

    const styles = {
        // bar: {
        //     position: 'absolute',
        //     display: 'flex',
        //     height: '3.375rem',
        //     backgroundColor: '#3a3a3a',
        //     left: '0',
        //     top: '0',
        //     width: '100%',
        //     zIndex: '1',
        //     alignItems: 'center',
        //     justifyContent: 'flex-end',
        //     color: 'white',
        //     boxShadow: '0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5)',
        // },
        lazyMenuToggleContainer: {
            position: 'absolute',
            zIndex: '2',
        },
        // titleLabelContainer: {
        //     position: 'absolute',
        //     display: 'flex',
        //     height: '3.375rem',
        //     backgroundColor: '#3a3a3a',
        //     left: '0',
        //     top: '0',
        //     width: '100%',
        //     zIndex: '1',
        //     alignItems: 'center',
        //     color: 'white',
        //     justifyContent: 'center',
        //     fontWeight: 500,
        //     fontSize: '10pt',
        //     boxShadow: '0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5)',
        // },
        connectionStatusIconsContainer: {
            position: 'absolute',
            display: 'flex',
            height: '3.375rem',
            left: '0',
            top: '0',
            width: '35%',
            zIndex: '1',
            marginLeft: '65%',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: 'white',
        },
        // icon: {
        //     margin: '0.75rem',
        // },
        // lastIcon: {
        //     margin: '0.5rem 1.5rem 0.5rem -0.5rem',
        // },
        typeInfo: {
            color: '#C3C3C3',
        },
        divider: {
            color: '#6A6A6A',
            fontWeight: 'bold',
        },
        verticalDivider: {
            border: '1px solid #5B5B5B',
            height: '50%',
        },
        openFileContainer: {
            cursor: 'pointer',
            display: 'flex',
            height: 'inherit',
            alignItems: 'center',
            position: 'fixed',
            float: 'left',
            left: '0',
        },
        openFileText: {
            marginRight: '1.5rem',
            fontWeight: '400',
            fontSize: 'medium',
        },
    };
    return processingFile || isConnected ? (
        <TopBarStyle>
            <TitleLabelContainer>
                {remoteOrLocal === true ||
                (remoteOrLocal === false && hasFileOutput === true) ? (
                    <React.Fragment>
                        <InfoDivider>&#8427;</InfoDivider>&nbsp;&nbsp;
                        <ConnectionTypeInfo>Connected to </ConnectionTypeInfo>
                        &nbsp;&nbsp;
                        {connectedServer !== null
                            ? connectedServer
                            : localFileOutput}{' '}
                        &nbsp;
                        <InfoDivider>/</InfoDivider>&nbsp;
                        <ConnectionTypeInfo>Processing</ConnectionTypeInfo>
                        &nbsp;&nbsp;
                    </React.Fragment>
                ) : (
                    <div
                        style={styles.openFileContainer}
                        onClick={() => props.getFileFromLocal()}>
                        <OpenIcon
                            title="Open File"
                            style={{
                                marginRight: '0.75rem',
                                marginLeft: '1.5rem',
                                display: 'inherit',
                            }}
                        />
                        <span style={styles.openFileText}>OPEN FILE</span>
                        <div style={styles.verticalDivider} />
                    </div>
                )}
                <span>{processingFile} &nbsp;</span>
            </TitleLabelContainer>
            <div style={styles.connectionStatusIconsContainer}>
                {remoteOrLocal === true ||
                (remoteOrLocal === false && hasFileOutput === true) ? (
                    <React.Fragment>
                        <FileQueueIcon
                            title="Number of Files"
                            numberOfFiles={numberOfFiles}
                            style={{ margin: '0.75rem' }}
                        />
                        {remoteOrLocal === true ? (
                            <React.Fragment>
                                <FileUploadStatus
                                    isDownload={isDownload}
                                    isUpload={isUpload}
                                    styles={{ margin: '0.75rem' }}
                                />
                                <ConnectionStatus
                                    isConnected={isConnected}
                                    style={{ margin: '0.75rem' }}
                                />
                            </React.Fragment>
                        ) : null}
                    </React.Fragment>
                ) : null}
                <div style={styles.verticalDivider}></div>
                <SettingsIcon
                    style={{ margin: '0.75rem' }}
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
                />
                <MenuToggleIcon
                    style={{ margin: '0.5rem 1.5rem 0.5rem -0.5rem' }}
                    cornerstone={props.cornerstone}
                />
            </div>
        </TopBarStyle>
    ) : (
        <TopBarStyle>
            <TitleLabelContainer>
                {/*TODO*/}
                {!remoteOrLocal &&
                localFileOutput === '' &&
                !firstDisplaySettings ? (
                    <div
                        style={styles.openFileContainer}
                        onClick={() => props.getFileFromLocal()}>
                        <OpenIcon
                            title="Open File"
                            style={{
                                marginRight: '0.75rem',
                                marginLeft: '1.5rem',
                                display: 'inherit',
                            }}
                        />
                        <span style={styles.openFileText}>OPEN FILE</span>
                        <div style={styles.verticalDivider} />
                    </div>
                ) : null}
            </TitleLabelContainer>
            <div style={styles.connectionStatusIconsContainer}>
                <SettingsIcon
                    style={{ margin: '0.75rem' }}
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
                />
            </div>
        </TopBarStyle>
    );
};

TopBar.propTypes = {
    /**
     * Function passed into the SettingsIcon component to check connection to command server
     */
    connectToCommandServer: PropTypes.func,
    /**
     * Main cornerstone object, used to resize viewports if needed.
     */
    cornerstone: PropTypes.object,
    /**
     * Getter function for getting local file if remote connection is off.
     */
    getFileFromLocal: PropTypes.func,
};

export default TopBar;
