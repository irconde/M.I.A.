import React from 'react';
import PropTypes from 'prop-types';

/**
 * Save icon in SaveButton component.
 *
 * @component
 *
 * @param {PropTypes} props Expected props: style (Container CSS style), title (title of compnent, i.e. what text is displayed when hovering)
 */
const SaveIcon = (props) => {
    return (
        <div style={props.style}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                enableBackground="new 0 0 24 24"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
                fill="#FFFFFF">
                <title>{props.title}</title>
                <g>
                    <rect fill="none" height="24" width="24" />
                </g>
                <g>
                    <path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z" />
                </g>
            </svg>
        </div>
    );
};

SaveIcon.propTypes = {
    title: PropTypes.string,
    style: PropTypes.object,
};

export default SaveIcon;
