import React from 'react';
import PropTypes from 'prop-types';

/**
 * File queue icon in TopBar component next to file annotation drop-down menu.
 *
 * @component
 *
 * @param {string} title Title, shown when hovering queue icon, which is typically "Number of files"
 * @param {Integer} numberOfFiles Number of files in queue
 * @param {Object} style CSS object for styling SVG container
 */
const FileQueueIcon = ({ title, numberOfFiles, style }) => {
    return (
        <div style={style}>
            <svg
                width="32px"
                height="32px"
                viewBox="0 0 32 32"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg">
                <title>{title}</title>
                <g
                    id="ic_file_queue"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd">
                    <g
                        id="recent_actors-24px"
                        transform="translate(1.000000, 0.000000)">
                        <polygon
                            id="Path"
                            points="0 0 32 0 32 32 0 32"></polygon>
                        <path
                            d="M27.2380952,6.66666667 L27.2380952,25.3333333 L30.6666667,25.3333333 L30.6666667,6.66666667 L27.2380952,6.66666667 Z M21.9047619,25.3333333 L25.3333333,25.3333333 L25.3333333,6.66666667 L21.9047619,6.66666667 L21.9047619,25.3333333 Z M18.6666667,6.66666667 L2.66666667,6.66666667 C1.93333333,6.66666667 1.33333333,7.26666667 1.33333333,8 L1.33333333,24 C1.33333333,24.7333333 1.93333333,25.3333333 2.66666667,25.3333333 L18.6666667,25.3333333 C19.4,25.3333333 20,24.7333333 20,24 L20,8 C20,7.26666667 19.4,6.66666667 18.6666667,6.66666667 Z"
                            id="Shape"
                            fill="#FFFFFF"
                            fillRule="nonzero"></path>
                    </g>
                </g>
                <text
                    x="35%"
                    y="53%"
                    fontSize="10pt"
                    fill="black"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    style={{ fontWeight: 600 }}>
                    {numberOfFiles}
                </text>
            </svg>
        </div>
    );
};

FileQueueIcon.propTypes = {
    title: PropTypes.string,
    numberOfFiles: PropTypes.number,
    style: PropTypes.object,
};

export default FileQueueIcon;
