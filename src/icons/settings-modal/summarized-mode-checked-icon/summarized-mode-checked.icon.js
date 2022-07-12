import React from 'react';
import PropTypes from 'prop-types';
import { StyledSummarizedModeCheckedIcon } from './summarized-mode-checked.icon.styles';

const SummarizedModeCheckedIcon = (props) => {
    return (
        <StyledSummarizedModeCheckedIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

SummarizedModeCheckedIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default SummarizedModeCheckedIcon;
