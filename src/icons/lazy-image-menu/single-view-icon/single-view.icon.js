import React from 'react';
import PropTypes from 'prop-types';
import { StyledSingleViewIcon } from './single-view.icon.styles';
import Tooltip from '@mui/material/Tooltip';

const SingleViewIcon = (props) => {
    return (
        <Tooltip title={'File contains information on single views'}>
            <StyledSingleViewIcon
                width={props.width}
                height={props.height}
                color={props.color}
            />
        </Tooltip>
    );
};

SingleViewIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default SingleViewIcon;
