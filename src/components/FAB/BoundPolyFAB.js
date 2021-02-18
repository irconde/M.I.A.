import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ReactComponent as PolygonIcon } from '../../icons/ic_polygon_dark.svg';
import { ReactComponent as RectangleIcon } from '../../icons/ic_rectangle_dark.svg';
import Utils from '../../Utils';

const FABContainer = styled.div`
    position: absolute;
    left: 50%;
    
    bottom: 5%;
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
const BoundPolyFAB = ({ isVisible, isEditing, onBoundingSelect, onPolygonSelect }) => {
    const handleClick = (e, cb) => {
        if (isVisible && !isEditing) {
            cb(e);
        }
    };
    
    //TODO: James; We need to update the left property in your styled div component
    //             based on the screen size here. I have it outlined, just needs to be implemented.
    let leftPX = '50%';
    let userScreenWidth = Utils.getScreenSize();
    let [width] = userScreenWidth;
    if (width < 800) {
        leftPX = '36%';
    } else if (width < 1200) {
        leftPX = '41.5%';
    } else if (width < 1500) {
        leftPX = '46%';
    } else if (width < 2000) {
        leftPX = '49%';
    } else if (width < 3000) {
        leftPX = '51.5%';
    }

    return (
        <FABContainer
            style={
                FABContainer.componentStyle === undefined ? {} :
                {
                    left: leftPX,
                }
            }
            disabled={isEditing}>
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

BoundPolyFAB.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    onBoundingSelect: PropTypes.func.isRequired,
    onPolygonSelect: PropTypes.func.isRequired
};

export default BoundPolyFAB;
