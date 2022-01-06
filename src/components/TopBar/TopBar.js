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
    getRemoteOrLocal,
    getHasFileOutput,
    getLocalFileOutput,
} from '../../redux/slices/settings/settingsSlice';
import OpenIcon from '../../icons/OpenIcon';

const TopBar = (props) => {
    const reduxInfo = useSelector(getTopBarInfo);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const hasFileOutput = useSelector(getHasFileOutput);
    const localFileOutput = useSelector(getLocalFileOutput);

    const {
        processingFile,
        connectedServer,
        numberOfFiles,
        isDownload,
        isUpload,
        isConnected,
    } = reduxInfo;

    const styles = {
        bar: {
            position: 'absolute',
            display: 'flex',
            height: '3.375rem',
            backgroundColor: '#2b2b2b',
            left: '0',
            top: '0',
            width: '100%',
            zIndex: '999',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: 'white',
            boxShadow: '0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5)',
        },
        titleLabelContainer: {
            position: 'absolute',
            display: 'flex',
            height: '3.375rem',
            backgroundColor: '#2b2b2b',
            left: '0',
            top: '0',
            width: '100%',
            zIndex: '999',
            alignItems: 'center',
            color: 'white',
            justifyContent: 'center',
            fontWeight: 500,
            fontSize: '10pt',
            boxShadow: '0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5)',
        },
        connectionStatusIconsContainer: {
            position: 'absolute',
            display: 'flex',
            height: '3.375rem',
            left: '0',
            top: '0',
            width: '35%',
            zIndex: '999',
            marginLeft: '65%',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: 'white',
        },
        icon: {
            margin: '0.75rem',
            marginLeft: '1.25rem',
        },
        lastIcon: {
            margin: '0.5rem 1.5rem 0.5rem 0rem',
        },
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
            width: 'inherit',
            alignItems: 'center',
            position: 'absolute',
        },
        openFileText: {
            marginRight: '1.5rem',
            fontWeight: '400',
            fontSize: 'medium',
        },
    };

    return processingFile ? (
        <div style={{ width: '100%' }}>
            <div style={styles.titleLabelContainer}>
                {remoteOrLocal === true ||
                (remoteOrLocal === false && hasFileOutput === true) ? (
                    <React.Fragment>
                        <span style={styles.divider}>&#8427;</span>&nbsp;&nbsp;
                        <span style={styles.typeInfo}>Connected to </span>
                        &nbsp;&nbsp;
                        {connectedServer !== null
                            ? connectedServer
                            : localFileOutput}{' '}
                        &nbsp;
                        <span style={styles.divider}>/</span>&nbsp;
                        <span style={styles.typeInfo}>Processing</span>
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
                {processingFile} &nbsp;
            </div>
            <div style={styles.connectionStatusIconsContainer}>
                {remoteOrLocal === true ||
                (remoteOrLocal === false && hasFileOutput === true) ? (
                    <React.Fragment>
                        <FileQueueIcon
                            title="Number of Files"
                            numberOfFiles={numberOfFiles}
                            style={styles.icon}
                        />
                        <FileUploadStatus
                            isDownload={isDownload}
                            isUpload={isUpload}
                            styles={styles.icon}
                        />
                        <ConnectionStatus
                            isConnected={isConnected}
                            style={styles.icon}
                        />
                    </React.Fragment>
                ) : null}
                <div style={styles.verticalDivider}></div>
                <SettingsIcon
                    style={styles.icon}
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
                />
                <MenuToggleIcon
                    style={styles.lastIcon}
                    cornerstone={props.cornerstone}
                />
            </div>
        </div>
    ) : (
        <div>
            <div style={styles.titleLabelContainer}>
                {remoteOrLocal === true ||
                (remoteOrLocal === false && hasFileOutput === true) ? (
                    <React.Fragment>
                        <span style={styles.divider}>&#8427;</span>&nbsp;&nbsp;
                        <span style={styles.typeInfo}>Connected to </span>
                        &nbsp;&nbsp;
                        {connectedServer !== null
                            ? connectedServer
                            : localFileOutput}{' '}
                        &nbsp; &nbsp;&nbsp;
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
                {processingFile} &nbsp;
            </div>
            <div style={styles.connectionStatusIconsContainer}>
                {remoteOrLocal === true ||
                (remoteOrLocal === false && hasFileOutput === true) ? (
                    <React.Fragment>
                        <FileQueueIcon
                            title="Number of Files"
                            numberOfFiles={numberOfFiles}
                            style={styles.icon}
                        />
                        <FileUploadStatus
                            isDownload={isDownload}
                            isUpload={isUpload}
                            styles={styles.icon}
                        />
                        <ConnectionStatus
                            isConnected={isConnected}
                            style={styles.icon}
                        />
                    </React.Fragment>
                ) : null}
                <div style={styles.verticalDivider}></div>
                <SettingsIcon
                    style={styles.icon}
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
                />
                <MenuToggleIcon
                    style={styles.lastIcon}
                    cornerstone={props.cornerstone}
                />
            </div>
        </div>
    );
};

TopBar.propTypes = {
    connectToCommandServer: PropTypes.func,
    cornerstone: PropTypes.object,
    getFileFromLocal: PropTypes.func,
};

export default TopBar;
