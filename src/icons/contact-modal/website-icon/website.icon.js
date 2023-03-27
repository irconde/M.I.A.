import React from 'react';
import PropTypes from 'prop-types';
import { StyledWebsiteIcon } from './website.icon.styles';

const WebsiteIcon = (props) => {
    return (
        <StyledWebsiteIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

WebsiteIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default WebsiteIcon;
