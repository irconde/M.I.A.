import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';

/**
 * Open file icon in TopBar component only in local mode of desktop app.
 *
 * @component
 *
 */

const OpenIcon = (props) => {
    return (
        <Tooltip title="Open File" placement="bottom-end">
            <div style={props.style}>
                <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg">
                    <g
                        id="Open+Save-buttons"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd">
                        <g
                            id="local_step_02"
                            transform="translate(-23.000000, -15.000000)">
                            <g
                                id="Toolbar"
                                transform="translate(0.000000, -19.000000)">
                                <g
                                    id="btn_open_file"
                                    transform="translate(23.000000, 33.000000)">
                                    <g
                                        id="ic_open"
                                        transform="translate(0.000000, 1.000000)">
                                        <polygon
                                            id="Path"
                                            points="0 0 24 0 24 24 0 24"></polygon>
                                        <path
                                            d="M19,4 L5,4 C3.89,4 3,4.9 3,6 L3,18 C3,19.1 3.89,20 5,20 L9,20 L9,18 L5,18 L5,8 L19,8 L19,18 L15,18 L15,20 L19,20 C20.1,20 21,19.1 21,18 L21,6 C21,4.9 20.11,4 19,4 Z M12,10 L8,14 L11,14 L11,20 L13,20 L13,14 L16,14 L12,10 Z"
                                            id="Shape"
                                            fill="#FFFFFF"
                                            fillRule="nonzero"></path>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        </Tooltip>
    );
};

OpenIcon.propTypes = {
    /**
     * Title shown when hovering icon, which is typically "Open File"
     */
    title: PropTypes.string,
    /**
     * CSS object used for stylizing SVG container
     */
    style: PropTypes.object,
};

export default OpenIcon;
