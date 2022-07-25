import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { StyledFileQueueIcon } from './file-queue.icon.styles';
import Tooltip from '@mui/material/Tooltip';

const FileQueueIcon = (props) => {
    useLayoutEffect(() => {
        const svgTextElement = document.getElementById('file-queue-text');
        svgTextElement.textContent = props?.numberOfFiles;
    });
    return (
        <Tooltip title={'Number of Files'}>
            <StyledFileQueueIcon
                width={props.width}
                height={props.height}
                color={props.color}
            />
        </Tooltip>
    );
};

FileQueueIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    numberOfFiles: PropTypes.number.isRequired,
};

export default FileQueueIcon;
