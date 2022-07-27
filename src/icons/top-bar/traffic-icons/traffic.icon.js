import React from 'react';
import PropTypes from 'prop-types';
import {
    StyledDownloadIcon,
    StyledDownloadUploadIcon,
    StyledNoTransmissionIcon,
    StyledUploadIcon,
} from './traffic.icon.styles';

const TrafficIcon = (props) => {
    switch (props.type) {
        case 'downloadAndUpload':
            return (
                <StyledDownloadUploadIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            );
        case 'noTransmission':
            return (
                <StyledNoTransmissionIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            );
        case 'downloading':
            return (
                <StyledDownloadIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            );
        case 'uploading':
            return (
                <StyledUploadIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            );
        default:
            return null;
    }
};

TrafficIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,

    type: PropTypes.oneOf([
        'uploading',
        'downloading',
        'downloadAndUpload',
        'noTransmission',
    ]).isRequired,
};

export default TrafficIcon;
