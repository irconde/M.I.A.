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
const AnnotationsIcon = (props) => {
    return (
        <div style={props.style}>
            <Tooltip title="File contains annotation data">
                <svg
                    width={props.svgStyle.width}
                    height={props.svgStyle.height}
                    viewBox="0 0 20 20"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg">
                    <title>Annotations Icon</title>
                    <g
                        id="Left-side-menu"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd">
                        <g
                            id="image-gallery-01"
                            transform="translate(-184.000000, -229.000000)">
                            <g
                                id="image-1"
                                transform="translate(30.000000, 71.000000)">
                                <g
                                    id="image-footer"
                                    transform="translate(2.000000, 158.000000)">
                                    <g
                                        id="photo_size_select_small_black_24dp"
                                        transform="translate(152.000000, 0.000000)">
                                        <polygon
                                            id="Path"
                                            points="0 0 20 0 20 20 0 20"></polygon>
                                        <path
                                            d="M19.1666667,12.5 L17.5,12.5 L17.5,14.1666667 L19.1666667,14.1666667 L19.1666667,12.5 Z M19.1666667,9.16666667 L17.5,9.16666667 L17.5,10.8333333 L19.1666667,10.8333333 L19.1666667,9.16666667 Z M19.1666667,15.8333333 L17.5,15.8333333 L17.5,17.5 C18.3333333,17.5 19.1666667,16.6666667 19.1666667,15.8333333 Z M12.5,2.5 L10.8333333,2.5 L10.8333333,4.16666667 L12.5,4.16666667 L12.5,2.5 Z M19.1666667,5.83333333 L17.5,5.83333333 L17.5,7.5 L19.1666667,7.5 L19.1666667,5.83333333 Z M17.5,2.5 L17.5,4.16666667 L19.1666667,4.16666667 C19.1666667,3.33333333 18.3333333,2.5 17.5,2.5 Z M2.5,17.5 L9.16666667,17.5 L9.16666667,12.5 L0.833333333,12.5 L0.833333333,15.8333333 C0.833333333,16.75 1.58333333,17.5 2.5,17.5 Z M2.5,5.83333333 L0.833333333,5.83333333 L0.833333333,7.5 L2.5,7.5 L2.5,5.83333333 Z M12.5,15.8333333 L10.8333333,15.8333333 L10.8333333,17.5 L12.5,17.5 L12.5,15.8333333 Z M15.8333333,2.5 L14.1666667,2.5 L14.1666667,4.16666667 L15.8333333,4.16666667 L15.8333333,2.5 Z M15.8333333,15.8333333 L14.1666667,15.8333333 L14.1666667,17.5 L15.8333333,17.5 L15.8333333,15.8333333 Z M2.5,2.5 C1.66666667,2.5 0.833333333,3.33333333 0.833333333,4.16666667 L2.5,4.16666667 L2.5,2.5 Z M2.5,9.16666667 L0.833333333,9.16666667 L0.833333333,10.8333333 L2.5,10.8333333 L2.5,9.16666667 Z M9.16666667,2.5 L7.5,2.5 L7.5,4.16666667 L9.16666667,4.16666667 L9.16666667,2.5 Z M5.83333333,2.5 L4.16666667,2.5 L4.16666667,4.16666667 L5.83333333,4.16666667 L5.83333333,2.5 Z"
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

AnnotationsIcon.propTypes = {
    /**
     * CSS object used for stylizing SVG container
     */
    style: PropTypes.object,
    /**
     * CSS object used for stylizing SVG element
     */
    svgStyle: PropTypes.object,
};

export default AnnotationsIcon;
