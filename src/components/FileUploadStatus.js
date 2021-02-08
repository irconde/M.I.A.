import React from 'react';
import { ReactComponent as UploadIcon } from '../icons/ic_traffic_upload.svg';
import { ReactComponent as DownloadIcon } from '../icons/ic_traffic_download.svg';
import { ReactComponent as DownloadUploadIcon } from '../icons/ic_traffic_download_upload.svg';
import PropTypes from 'prop-types';

const FileUploadStatus = ({ isUpload, isDownload }) => {
    const styles = {
        margin: '1.25rem',
    };

    if (isUpload && isDownload) {
        return (
            <DownloadUploadIcon
                styles={styles}
                title="Downloading and Uploading"
            />
        );
    } else {
        return (
            <>
                {isUpload && <UploadIcon styles={styles} title="Uploading" />}
                {isDownload && (
                    <DownloadIcon styles={styles} title="Downloading" />
                )}
            </>
        );
    }
};

FileUploadStatus.propTypes = {
    isUpload: PropTypes.bool.isRequired,
    isDownload: PropTypes.bool.isRequired,
};

export default FileUploadStatus;
