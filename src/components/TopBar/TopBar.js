import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FileQueueIcon from '../../icons/FileQueueIcon';
import SettingsIcon from '../../icons/SettingsIcon';
import { getTopBarInfo } from '../../redux/slices/server/serverSlice';
import ConnectionStatus from './ConnectionStatus';
import FileUploadStatus from './FileUploadStatus';
import MenuToggleIcon from '../../icons/MenuToggleIcon';
import { getRemoteOrLocal } from '../../redux/slices/settings/settingsSlice';
import { ReactComponent as OpenIcon } from '../../icons/ic_open_file.svg';

const TopBar = (props) => {
    const reduxInfo = useSelector(getTopBarInfo);
    const remoteOrLocal = useSelector(getRemoteOrLocal);

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
        },
        lastIcon: {
            margin: '0.5rem 2.5rem 0.5rem 0rem',
        },
        typeInfo: {
            color: '#C3C3C3',
        },
        divider: {
            color: '#6A6A6A',
            fontWeight: 'bold',
        },
        verticalDivider: {
            border: '1px solid gray',
            height: '50%',
        },
        openFileContainer: {
            position: 'fixed',
            left: '1.5%',
            top: '1.5%',
            cursor: 'pointer',
            display: 'flex',
            height: 'inherit',
        },
    };

    return processingFile ? (
        <div style={{ width: '100%' }}>
            <div style={styles.titleLabelContainer}>
                {remoteOrLocal === true ? (
                    <React.Fragment>
                        <span style={styles.divider}>&#8427;</span>&nbsp;&nbsp;
                        <span style={styles.typeInfo}>Connected to </span>
                        &nbsp;&nbsp;
                        {connectedServer} &nbsp;
                        <span style={styles.divider}>/</span>&nbsp;
                        <span style={styles.typeInfo}>Processing</span>
                        &nbsp;&nbsp;
                    </React.Fragment>
                ) : (
                    <div style={styles.openFileContainer}>
                        <OpenIcon />
                        <span style={styles.typeInfo}>OPEN FILE</span>
                        <div style={styles.verticalDivider} />
                    </div>
                )}
                {processingFile} &nbsp;
                {remoteOrLocal === true ? (
                    <span style={styles.typeInfo}>file</span>
                ) : null}
            </div>
            <div style={styles.connectionStatusIconsContainer}>
                {remoteOrLocal === true ? (
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
                ) : (
                    <div style={styles.verticalDivider}></div>
                )}

                <MenuToggleIcon
                    style={styles.icon}
                    cornerstone={props.cornerstone}
                />
                <SettingsIcon
                    style={styles.lastIcon}
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
                />
            </div>
        </div>
    ) : (
        <div>
            <div style={styles.titleLabelContainer}>
                <span style={styles.divider}>&#8427;</span>&nbsp;&nbsp;
                <span style={styles.typeInfo}>Connected to </span>&nbsp;&nbsp;
                {connectedServer} &nbsp;
            </div>
            <div style={styles.connectionStatusIconsContainer}>
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
                <MenuToggleIcon
                    style={styles.icon}
                    cornerstone={props.cornerstone}
                />
                <SettingsIcon
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
                />
            </div>
        </div>
    );
};

TopBar.propTypes = {
    connectToCommandServer: PropTypes.func,
    cornerstone: PropTypes.object,
};

export default TopBar;
