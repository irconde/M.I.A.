import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ReactComponent as PolygonIcon } from '../icons/ic_polygon_dark.svg';
import { ReactComponent as RectangleIcon } from '../icons/ic_rectangle_dark.svg';

const FABContainer = styled.div`
    position: absolute;
    left: 50%;
    bottom: 2%;
    padding: 1rem;
    background-color: #414141;
    color: #fff;
    border: 1px solid #414141;
    border-radius: 60px;
    display: flex;
    opacity: ${(props) => (props.disabled ? '38%' : '100%')};
    animation: fadein 2s; /* fade component in so cornerstone can load */

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    &:hover {
        cursor: pointer;
    }
    .divider {
        height: 1.75rem;
        border-left: 1px solid #e8e8e8;
        margin-left: 1rem;
        margin-right: 1rem;
    }
    .fabOption {
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
            margin-right: 0.5rem;
        }
    }
`;

/**
 * GUI widget that allows user to select a new detection/annotation type.
 *
 */
const FAB = ({ isVisible, isEditing, onBoundingSelect, onPolygonSelect }) => {
    const handleClick = (e, cb) => {
        if (isVisible && !isEditing) {
            cb(e);
        }
    };
    return (
        <FABContainer disabled={isEditing}>
            <div
                className="fabOption"
                onClick={(e) => handleClick(e, onBoundingSelect)}>
                <RectangleIcon className="icon" />
                <span>Bounding box</span>
            </div>
            <div className="divider"></div>
            <div
                className="fabOption"
                onClick={(e) => {
                    handleClick(e, onPolygonSelect);
                }}>
                <PolygonIcon className="icon" />
                <span>Polygon mask</span>
            </div>
        </FABContainer>
    );
};

FAB.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    onBoundingSelect: PropTypes.func.isRequired,
    onPolygonSelect: PropTypes.func.isRequired,
};

export default FAB;
