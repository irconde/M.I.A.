import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';

/**
 * File open icon in SettingsModal only shown if in desktop app version displaying file open in local directory.
 *
 * @component
 * @param {PropTypes} props - Expected props: style<object>, svgStyle<object>
 * @param {Object} style - Destructured from props -- CSS object used for stylizing SVG container
 * @param {Object} svgStyle - Destructured from props -- CSS object used for stylizing SVG element
 *
 */
const SingleViewIcon = (props) => {
    return (
        <div style={props.style}>
            <Tooltip title="File contains information on a single view">
                <svg
                    width={props.svgStyle.width}
                    height={props.svgStyle.height}
                    viewBox="0 0 20 20"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg">
                    <g
                        id="Left-side-menu"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd">
                        <g
                            id="image-gallery-01"
                            transform="translate(-159.000000, -229.000000)">
                            <g
                                id="image-1"
                                transform="translate(30.000000, 71.000000)">
                                <g
                                    id="image-footer"
                                    transform="translate(2.000000, 158.000000)">
                                    <g
                                        id="photo_black_24dp"
                                        transform="translate(127.000000, 0.000000)">
                                        <polygon
                                            id="Path"
                                            points="0 0 20 0 20 20 0 20"></polygon>
                                        <path
                                            d="M15.8333333,4.16666667 L15.8333333,15.8333333 L4.16666667,15.8333333 L4.16666667,4.16666667 L15.8333333,4.16666667 M15.8333333,2.5 L4.16666667,2.5 C3.25,2.5 2.5,3.25 2.5,4.16666667 L2.5,15.8333333 C2.5,16.75 3.25,17.5 4.16666667,17.5 L15.8333333,17.5 C16.75,17.5 17.5,16.75 17.5,15.8333333 L17.5,4.16666667 C17.5,3.25 16.75,2.5 15.8333333,2.5 Z M11.7833333,9.88333333 L9.28333333,13.1083333 L7.5,10.95 L5,14.1666667 L15,14.1666667 L11.7833333,9.88333333 Z"
                                            id="Shape"
                                            fill="#E3E3E3"
                                            fillRule="nonzero"></path>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
            </Tooltip>
        </div>
    );
};

SingleViewIcon.propTypes = {
    /**
     * CSS object used for stylizing SVG container
     */
    style: PropTypes.object,
    /**
     * CSS object used for stylizing SVG element
     */
    svgStyle: PropTypes.object,
};

export default SingleViewIcon;
