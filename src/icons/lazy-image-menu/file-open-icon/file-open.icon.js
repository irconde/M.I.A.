import React from 'react';
import PropTypes from 'prop-types';
import { StyledFileOpenIcon } from './file-open.icon.styles';
import Tooltip from '@mui/material/Tooltip';

const FileOpenIcon = (props) => {
    return (
        <Tooltip title={'Opened Files'}>
            <StyledFileOpenIcon
                width={props.width}
                height={props.height}
                color={props.color}
            />
        </Tooltip>
    );
};

FileOpenIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default FileOpenIcon;
