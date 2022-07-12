import React from 'react';
import PropTypes from 'prop-types';
import { StyledFileIcon } from './file.icon.styles';

const FileIcon = (props) => {
    return (
        <StyledFileIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

FileIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default FileIcon;
