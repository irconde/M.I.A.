import React from 'react';
import PropTypes from 'prop-types';

const ConnectionVerifiedIcon = (props) => {
    return (
        <div style={props.style}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                enableBackground="new 0 0 24 24"
                height={props.svgStyle.height}
                viewBox={`0 0 ${props.svgStyle.width} ${props.svgStyle.height}`}
                width={props.svgStyle.width}
                fill={props.svgStyle.color}>
                <g>
                    <rect
                        fill="none"
                        height={props.svgStyle.height}
                        width={props.svgStyle.width}
                    />
                </g>
                <g>
                    <path d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.5L12,2.96L8.6,1.5L6.71,4.69L3.1,5.5L3.44,9.2L1,12l2.44,2.79l-0.34,3.7 l3.61,0.82L8.6,22.5l3.4-1.47l3.4,1.46l1.89-3.19l3.61-0.82l-0.34-3.69L23,12z M10.09,16.72l-3.8-3.81l1.48-1.48l2.32,2.33 l5.85-5.87l1.48,1.48L10.09,16.72z" />
                </g>
            </svg>
        </div>
    );
};

ConnectionVerifiedIcon.propTypes = {
    style: PropTypes.object,
    svgStyle: PropTypes.object,
};

export default ConnectionVerifiedIcon;
