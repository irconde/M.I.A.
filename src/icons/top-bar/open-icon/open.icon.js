import React from 'react';
import PropTypes from 'prop-types';
import { OpenIconWrapper, StyledOpenIcon } from './open.icon.styles';
import Tooltip from '@mui/material/Tooltip';

const OpenIcon = (props) => {
    return (
        <OpenIconWrapper>
            <Tooltip title={'Open File'}>
                <StyledOpenIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </Tooltip>
        </OpenIconWrapper>
    );
};

OpenIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default OpenIcon;
