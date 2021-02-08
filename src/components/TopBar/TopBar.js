import React from 'react';
import PropTypes from 'prop-types';
import FileQueueIcon from '../../icons/FileQueueIcon';
import ConnectionStatus from './ConnectionStatus';
import FileUploadStatus from './FileUploadStatus';

const TopBar = ({ numberOfFiles, isUpload, isDownload, isConnected }) => {
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
        icon: {
            margin: '1.25rem',
        },
        lastIcon: {
            margin: '0.5rem 1.5rem 0.5rem 0',
        },
    };

    return (
        <div style={styles.bar}>
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
                style={styles.lastIcon}
            />
        </div>
    );
};

TopBar.propTypes = {
    numberOfFiles: PropTypes.number,
    isUpload: PropTypes.bool,
    isDownload: PropTypes.bool,
    isConnected: PropTypes.bool,
};

export default TopBar;
