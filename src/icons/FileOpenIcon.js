import React from 'react';
import PropTypes from 'prop-types';

const FileOpenIcon = (props) => {
    return (
        <div style={props.style}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height={props.svgStyle.height}
                viewBox={`0 0 ${props.svgStyle.width} ${props.svgStyle.height}`}
                width={props.svgStyle.width}
                fill={props.svgStyle.color}>
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
            </svg>
        </div>
    );
};

FileOpenIcon.propTypes = {
    style: PropTypes.object,
    svgStyle: PropTypes.object,
};

export default FileOpenIcon;
