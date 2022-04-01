import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ArrowWrapper = styled.div`
    svg {
        transform: ${(props) =>
            props.direction === 'down' ? 'rotate(180deg)' : ''};
    }
`;

/**
 * Arrow icon (up by default) for toggling label list when editing detection label
 *
 * @component
 *
 * @param {string} direction - `down` rotates the arrow to point downwards
 * @param {string} color - `color` fill color for arrow
 * @param {function} handleClick - callback for handling click events
 */
const ArrowIcon = ({ direction, color, handleClick }) => {
    return (
        <ArrowWrapper direction={direction} onClick={handleClick}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                viewBox="0 0 24 24"
                width="24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path
                    d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
                    fill={color}
                />
            </svg>
        </ArrowWrapper>
    );
};

ArrowIcon.propTypes = {
    handleClick: PropTypes.func.isRequired,
    direction: PropTypes.string,
    color: PropTypes.string.isRequired,
};
export default ArrowIcon;
