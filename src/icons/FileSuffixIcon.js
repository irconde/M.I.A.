import React from 'react';
import PropTypes from 'prop-types';

/**
 * File suffix icon in SettingsModal next to file suffix text-field.
 *
 * @component
 *
 * @param {PropTypes} props - Expected props: style (Container CSS style), svgStyle (SVG CSS style)
 */
const FileSuffixIcon = (props) => {
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
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M17 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zM5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
        </div>
    );
};

FileSuffixIcon.propTypes = {
    style: PropTypes.object,
    svgStyle: PropTypes.object,
};

export default FileSuffixIcon;
