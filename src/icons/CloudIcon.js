import React from 'react';
import PropTypes from 'prop-types';

/**
 * Cloud icon in SettingsModal next to the host IP address text field
 *
 * @component
 * @param {PropTypes} props - Expected props: style<object>, svgStyle<object>
 * @param {Object} style - Destructured from props -- CSS object used for stylizing SVG container
 * @param {Object} svgStyle - Destructured from props -- CSS object used for stylizing SVG element
 *
 */
const CloudIcon = (props) => {
    return (
        <div style={props.style}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height={props.svgStyle.height}
                viewBox={`0 0 ${parseInt(props.svgStyle.width)} ${parseInt(
                    props.svgStyle.height
                )}`}
                width={props.svgStyle.width}
                fill={props.svgStyle.color}>
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6m0-2C9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96C18.67 6.59 15.64 4 12 4z" />
            </svg>
        </div>
    );
};

CloudIcon.propTypes = {
    /**
     * CSS object used for stylizing SVG container
     */
    style: PropTypes.object,
    /**
     * CSS object used for stylizing SVG element
     */
    svgStyle: PropTypes.object,
};

export default CloudIcon;
