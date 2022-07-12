import React from 'react';
import PropTypes from 'prop-types';
import { StyledCloudIcon } from './cloud.icon.styles';

const CloudIcon = (props) => {
    return (
        <StyledCloudIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

CloudIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default CloudIcon;
