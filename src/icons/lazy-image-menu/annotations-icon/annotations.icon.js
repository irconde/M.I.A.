import React from 'react';
import PropTypes from 'prop-types';
import { StyledAnnotationsIcon } from './annotations.icon.styles';
import Tooltip from '@mui/material/Tooltip';

const AnnotationsIcon = (props) => {
    return (
        <Tooltip title={'File contains annotation data'}>
            <StyledAnnotationsIcon
                width={props.width}
                height={props.height}
                color={props.color}
            />
        </Tooltip>
    );
};

AnnotationsIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default AnnotationsIcon;
