import React from 'react';
import PropTypes from 'prop-types';
import { StyledMenuFoldedIcon } from './menu-folded.icon.styles';

const MenuFoldedIcon = (props) => {
    return (
        <StyledMenuFoldedIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};
MenuFoldedIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
export default MenuFoldedIcon;
