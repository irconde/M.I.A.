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
    getHasFileOutput,
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import OpenIcon from '../../icons/OpenIcon';

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
            backgroundColor: '#3a3a3a',
            left: '0',
            top: '0',
            width: '100%',
            zIndex: '1',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: 'white',
            boxShadow: '0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5)',
        },
        lazyMenuToggleContainer: {
            position: 'absolute',
            zIndex: '2',
        },
        titleLabelContainer: {
            position: 'absolute',
            display: 'flex',
            height: '3.375rem',
            backgroundColor: '#3a3a3a',
            left: '0',
            top: '0',
            width: '100%',
            zIndex: '1',
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
            zIndex: '1',
            marginLeft: '65%',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: 'white',
        },
        icon: {
            margin: '0.75rem',
        },
        lastIcon: {
            margin: '0.5rem 1.5rem 0.5rem -0.5rem',
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
                <span>{processingFile} &nbsp;</span>
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
                        {remoteOrLocal === true ? (
                            <React.Fragment>
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
            <div style={styles.titleLabelContainer}></div>
            <div style={styles.connectionStatusIconsContainer}>
                <SettingsIcon
                    style={styles.icon}
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
                />
            </div>
        </div>
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
