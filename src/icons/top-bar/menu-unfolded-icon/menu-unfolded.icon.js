import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenuUnfoldedIcon } from './menu-unfolded.icon.styles';
import { StyledMenuUnfoldedDisabledIcon } from './menu-unfolded-disabled.icon.styles';

const MenuUnfoldedIcon = (props) => {
    return props.color === 'white' ? (
        <StyledMenuUnfoldedIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    ) : (
        <StyledMenuUnfoldedDisabledIcon
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
