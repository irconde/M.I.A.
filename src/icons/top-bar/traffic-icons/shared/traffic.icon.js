import React from 'react';
import PropTypes from 'prop-types';
import {
    StyledDownloadIcon,
    StyledDownloadUploadIcon,
    StyledNoTransmissionIcon,
    StyledUploadIcon,
} from './traffic.icon.styles';
import Tooltip from '@mui/material/Tooltip';

const TrafficIcon = (props) => {
    const isDownloadUpload = props.isUpload && props.isDownload;
    const isNoTransmission = !props.isUpload && !props.isDownload;
    if (isDownloadUpload) {
        return (
            <Tooltip title={'Downloading and Uploading'}>
                <StyledDownloadUploadIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </Tooltip>
        );
    } else if (isNoTransmission) {
        return (
            <Tooltip title={'No Transmission'}>
                <StyledNoTransmissionIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </Tooltip>
        );
    } else if (!props.isDownload) {
        return (
            <Tooltip title={'Uploading'}>
                <StyledUploadIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </Tooltip>
        );
    } else if (!props.isUpload) {
        return (
            <Tooltip title={'Downloading'}>
                <StyledDownloadIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </Tooltip>
        );
    } else return null;
};

TrafficIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    /**
     * Boolean value determining if GUI is uploading data
     */
    isUpload: PropTypes.bool.isRequired,
    /**
     * Boolean value determining if GUI is downloading data
     */
    isDownload: PropTypes.bool.isRequired,
};

export default TrafficIcon;
