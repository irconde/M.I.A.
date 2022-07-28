import React from 'react';
import PropTypes from 'prop-types';
import { StyledPolygonIcon } from './polygon.icon.styles';

const PolygonIcon = (props) => {
    return (
        <StyledPolygonIcon
            width={props.width}
            height={props.height}
            color={props.color}
            border={props.border}
        />
    );
};

PolygonIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
};

export default PolygonIcon;
