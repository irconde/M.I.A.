import React from 'react';
import { ReactComponent as UploadIcon } from '../../icons/ic_traffic_upload.svg';
import { ReactComponent as DownloadIcon } from '../../icons/ic_traffic_download.svg';
import { ReactComponent as DownloadUploadIcon } from '../../icons/ic_traffic_download_upload.svg';
import { ReactComponent as NoTransmissionIcon } from '../../icons/ic_traffic_no_transmission.svg';
import PropTypes from 'prop-types';

/**
 * Component for displaying file upload status.
 *
 * @component
 *
 */
const FileUploadStatus = ({ isUpload, isDownload, styles }) => {
    const isDownloadUpload = isUpload && isDownload;
    const isNoTransmission = !isUpload && !isDownload;

    if (isDownloadUpload) {
        return (
            <DownloadUploadIcon
                title="Downloading and uploading"
                style={styles}
            />
        );
    } else if (isNoTransmission) {
        return <NoTransmissionIcon title="No transmission" style={styles} />;
    } else if (!isDownload) {
        return <UploadIcon title="Uploading" style={styles} />;
    } else if (!isUpload) {
        return <DownloadIcon title="Downloading" style={styles} />;
    } else return null;
};

FileUploadStatus.propTypes = {
    /**
     * Boolean value determining if GUI is uploading data
     */
    isUpload: PropTypes.bool.isRequired,
    /**
     * Boolean value determining if GUI is downloading data
     */
    isDownload: PropTypes.bool.isRequired,
    /**
     * CSS stylization for icons
     */
    styles: PropTypes.object,
};

export default FileUploadStatus;
