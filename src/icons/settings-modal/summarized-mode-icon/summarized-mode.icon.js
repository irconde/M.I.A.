import React from 'react';
import PropTypes from 'prop-types';
import { StyledSummarizedModeIcon } from './summarized-mode.icon.styles';

const SummarizedModeIcon = (props) => {
    return (
        <StyledSummarizedModeIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

SummarizedModeIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default SummarizedModeIcon;
