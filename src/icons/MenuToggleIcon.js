import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    getReceivedTime,
    toggleCollapsedSideMenu,
} from '../redux/slices/ui/uiSlice';
import { getHasFileOutput } from '../redux/slices/settings/settingsSlice';
import Tooltip from '@mui/material/Tooltip';

/**
 * Menu toggle icon in TopBar component used to toggle SideMenu component visibility.
 *
 * @component
 *
 * @param {PropTypes} props - Expected props: cornerstone<object>, style<object>
 * @param {CornerstoneObject} cornerstone - Destructured from props -- Main cornerstone object, used to resize viewports if needed.
 * @param {Object} style - Destructured from props -- CSS object used for stylizing SVG container
 *
 */
const MenuToggleIcon = (props) => {
    const dispatch = useDispatch();
    const visible = useSelector(getReceivedTime);
    const hasFileOutput = useSelector(getHasFileOutput);
    const toggleClickHandler = () => {
        dispatch(toggleCollapsedSideMenu(props.cornerstone));
    };
    const divStyle = {
        ...props.style,
        cursor: 'pointer',
    };
    if (visible !== null || hasFileOutput) {
        return (
            <div style={divStyle} onClick={toggleClickHandler}>
                <Tooltip title="Side Menu Toggle" placement="bottom">
                    <svg
                        style={{ marginTop: 'auto', marginBottom: 'auto' }}
                        width="32px"
                        height="32px"
                        viewBox="0 0 32 32"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg">
                        <g
                            id="Page-1"
                            stroke="none"
                            strokeWidth="1"
                            fill="none"
                            fillRule="evenodd">
                            <g
                                id="Page-1"
                                stroke="none"
                                strokeWidth="1"
                                fill="none"
                                fillRule="evenodd">
                                <g
                                    id="collapsible_menu_02"
                                    transform="translate(-1318.000000, -10.000000)">
                                    <g
                                        id="menu_open_white_24dp"
                                        transform="translate(1334.000000, 26.000000) rotate(-180.000000) translate(-1334.000000, -26.000000) translate(1318.000000, 10.000000)">
                                        <polygon
                                            id="Path"
                                            points="0 0 32 0 32 32 0 32"></polygon>
                                        <path
                                            d="M4.57142857,24 L21.9047619,24 L21.9047619,21.3333333 L4.57142857,21.3333333 L4.57142857,24 Z M4.57142857,17.3333333 L17.9047619,17.3333333 L17.9047619,14.6666667 L4.57142857,14.6666667 L4.57142857,17.3333333 Z M4.57142857,8 L4.57142857,10.6666667 L21.9047619,10.6666667 L21.9047619,8 L4.57142857,8 Z"
                                            id="Shape"
                                            fill="#FFFFFF"
                                            fillRule="nonzero"></path>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </Tooltip>
            </div>
        );
    } else return null;
};

MenuToggleIcon.propTypes = {
    /**
     * Main cornerstone object, used to resize viewports if needed.
     */
    cornerstone: PropTypes.object,
    /**
     * CSS object used for stylizing SVG container
     */
    style: PropTypes.object,
};

export default MenuToggleIcon;
