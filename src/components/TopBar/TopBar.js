import React from 'react';
import PropTypes from 'prop-types';
import FileQueueIcon from '../../icons/FileQueueIcon';
import ConnectionStatus from './ConnectionStatus';
import FileUploadStatus from './FileUploadStatus';

const TopBar = ({ numberOfFiles, isUpload, isDownload, isConnected , connectedServer, processingFile }) => {
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
        titleLabelContainer:{
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
           	
		},
        connectionStatusIconsContainer:{
			  position: 'absolute',
            display: 'flex',
            height: '3.375rem',
            backgroundColor: '#2b2b2b',
            left: '0',
            top: '0',
            width: '35%',
            zIndex: '999',
			'margin-left':'65%',
            alignItems: 'center',
            justifyContent: 'flex-end',
            color: 'white',
           	
		},
        icon: {
            margin: '1.25rem',
			
        },
        lastIcon: {
            margin: '0.5rem 2.5rem 0.5rem 0rem',
			
        },
		connectionFile: {
			color: '#C3C3C3',
			
        }
		
		
    };

    return (
		<div >
        <div style={styles.titleLabelContainer}>
			<p style={styles.connectionFile}>Connected to </p>&nbsp;&nbsp;
			<h4 >{connectedServer}</h4> &nbsp;&nbsp;
			<p>/</p>&nbsp;&nbsp;
			<p style={styles.connectionFile}>Processing</p>&nbsp;&nbsp;
			<h4 >{processingFile}</h4>
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
					style={styles.lastIcon}
				/>
        </div>
		</div>
    );
};

TopBar.propTypes = {
    numberOfFiles: PropTypes.number,
    isUpload: PropTypes.bool,
    isDownload: PropTypes.bool,
    isConnected: PropTypes.bool,
	connectedServer: PropTypes.string,
	processingFile: PropTypes.string
};

export default TopBar;
