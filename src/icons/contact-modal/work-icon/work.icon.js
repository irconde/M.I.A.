import React from 'react';
import PropTypes from 'prop-types';
import { StyledWorkIcon } from './work.icon.styles';

const WorkIcon = (props) => {
    return (
        <StyledWorkIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

WorkIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default WorkIcon;
