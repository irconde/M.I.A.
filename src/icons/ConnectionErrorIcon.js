import React from 'react';
import PropTypes from 'prop-types';

/**
 * Connection error icon in SettingsModal if connection to image server is failed.
 *
 * @component
 *
 * @param {PropTypes} props - Expected props: style (Container CSS style), svgStyle (SVG CSS style)
 */
const ConnectionErrorIcon = (props) => {
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
        </div>
    );
};

ConnectionErrorIcon.propTypes = {
    style: PropTypes.object,
    svgStyle: PropTypes.object,
};

export default ConnectionErrorIcon;
