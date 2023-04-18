import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenuUnfoldedIcon } from './menu-unfolded.icon.styles';

const MenuUnfoldedIcon = (props) => {
    return (
        <StyledMenuUnfoldedIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};
MenuUnfoldedIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
export default MenuUnfoldedIcon;
