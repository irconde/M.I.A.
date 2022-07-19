import React from 'react';
import PropTypes from 'prop-types';
import { StyledTwoViewIcon } from './two-view.icon.styles';
import Tooltip from '@mui/material/Tooltip';

const TwoViewIcon = (props) => {
    return (
        <Tooltip title={'File contains information on two views'}>
            <StyledTwoViewIcon
                width={props.width}
                height={props.height}
                color={props.color}
            />
        </Tooltip>
    );
};

TwoViewIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default TwoViewIcon;
