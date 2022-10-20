import React from 'react';
import PropTypes from 'prop-types';
import { StyledInfoIcon } from './info.icon.styles';
import Tooltip from '@mui/material/Tooltip';
import { TopBarIconWrapper } from '../../../components/top-bar/top-bar.styles';

const InfoIcon = (props) => {
    return (
        <Tooltip title={'About'}>
            <TopBarIconWrapper>
                <StyledInfoIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </TopBarIconWrapper>
        </Tooltip>
    );
};

InfoIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default InfoIcon;
