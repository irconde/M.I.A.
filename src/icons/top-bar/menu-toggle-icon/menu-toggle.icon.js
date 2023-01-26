import React from 'react';
import PropTypes from 'prop-types';
import {
    IconButtonWrapper,
    StyledMenuToggleIcon,
} from './menu-toggle.icon.styles';
import { useDispatch } from 'react-redux';
import { toggleSideMenu } from '../../../redux/slices/ui.slice';

const MenuToggleIcon = (props) => {
    const dispatch = useDispatch();
    // const visible = useSelector(getReceivedTime);
    // const hasFileOutput = useSelector(getHasFileOutput);
    // if (visible !== null || hasFileOutput) {
    // } else return null;
    const toggleClickHandler = () => {
        dispatch(toggleSideMenu());
    };
    return (
        <IconButtonWrapper onClick={toggleClickHandler}>
            <StyledMenuToggleIcon
                width={props.width}
                height={props.height}
                color={props.color}
            />
        </IconButtonWrapper>
    );
};

MenuToggleIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    cornerstone: PropTypes.object,
};

export default MenuToggleIcon;
