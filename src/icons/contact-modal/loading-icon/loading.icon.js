import React from 'react';
import PropTypes from 'prop-types';
import { StyledLoadingIcon } from './loading.icon.styles';

const LoadingIcon = (props) => {
    return (
        <StyledLoadingIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};
LoadingIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
export default LoadingIcon;
