import React from 'react';
import PropTypes from 'prop-types';
import { StyledLazyMenuToggleIcon } from './lazy-menu-toggle.icon.styles';
import Tooltip from '@mui/material/Tooltip';
import { useDispatch } from 'react-redux';
import { toggleCollapsedLazyMenu } from '../../../redux/slices-old/ui/uiSlice';

/**
 * Lazy menu toggle icon in TopBar component used to toggle lazy menu component visibility.
 *
 * @component
 *
 */
const LazyMenuToggleIcon = (props) => {
    const dispatch = useDispatch();
    const toggleClickHandler = () => {
        dispatch(toggleCollapsedLazyMenu(props.cornerstone));
    };
    return (
        <Tooltip title={'Lazy Menu Toggle'}>
            <div onClick={toggleClickHandler}>
                <StyledLazyMenuToggleIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </div>
        </Tooltip>
    );
};

LazyMenuToggleIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    /**
     * Main cornerstone object, used to resize viewports if needed.
     */
    cornerstone: PropTypes.object,
};

export default LazyMenuToggleIcon;
