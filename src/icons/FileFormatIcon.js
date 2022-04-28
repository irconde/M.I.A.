import React from 'react';
import PropTypes from 'prop-types';

/**
 * File format icon in SettingsModal next to file format drop-down menu.
 *
 * @component
 *
 */
const FileFormatIcon = (props) => {
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
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
            </svg>
        </div>
    );
};

FileFormatIcon.propTypes = {
    /**
     * CSS object used for stylizing SVG container
     */
    style: PropTypes.object,
    /**
     * CSS object used for stylizing SVG element
     */
    svgStyle: PropTypes.object,
};

export default FileFormatIcon;
