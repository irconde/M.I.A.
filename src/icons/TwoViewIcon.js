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
const TwoViewIcon = (props) => {
    return (
        <div style={props.style}>
            <Tooltip title="File contains information on two views">
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
                            transform="translate(-159.000000, -639.000000)">
                            <g
                                id="image-1-copy-2"
                                transform="translate(30.000000, 481.000000)">
                                <g
                                    id="image-footer"
                                    transform="translate(2.000000, 158.000000)">
                                    <g
                                        id="photo_library_black_24dp"
                                        transform="translate(127.000000, 0.000000)">
                                        <polygon
                                            id="Path"
                                            points="0 0 20 0 20 20 0 20"></polygon>
                                        <path
                                            d="M16.6666667,3.33333333 L16.6666667,13.3333333 L6.66666667,13.3333333 L6.66666667,3.33333333 L16.6666667,3.33333333 M16.6666667,1.66666667 L6.66666667,1.66666667 C5.75,1.66666667 5,2.41666667 5,3.33333333 L5,13.3333333 C5,14.25 5.75,15 6.66666667,15 L16.6666667,15 C17.5833333,15 18.3333333,14.25 18.3333333,13.3333333 L18.3333333,3.33333333 C18.3333333,2.41666667 17.5833333,1.66666667 16.6666667,1.66666667 Z M9.58333333,9.725 L10.9916667,11.6083333 L13.0583333,9.025 L15.8333333,12.5 L7.5,12.5 L9.58333333,9.725 Z M1.66666667,5 L1.66666667,16.6666667 C1.66666667,17.5833333 2.41666667,18.3333333 3.33333333,18.3333333 L15,18.3333333 L15,16.6666667 L3.33333333,16.6666667 L3.33333333,5 L1.66666667,5 Z"
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

TwoViewIcon.propTypes = {
    /**
     * CSS object used for stylizing SVG container
     */
    style: PropTypes.object,
    /**
     * CSS object used for stylizing SVG element
     */
    svgStyle: PropTypes.object,
};

export default TwoViewIcon;
