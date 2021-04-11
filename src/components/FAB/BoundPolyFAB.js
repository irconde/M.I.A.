import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ReactComponent as PolygonIcon } from '../../icons/ic_polygon.svg';
import { ReactComponent as RectangleIcon } from '../../icons/ic_rectangle.svg';
import Utils from '../../Utils';
import * as constants from '../../Constants';

/**
 * FABContainer - Styled div for the FAB Button. Takes in props to control the look
 *                depending on certain properties.
 *
 * @property {leftPX} - Prop to control the horizontal alignment dynamically
 * @property {fabOpacity} - Prop to control opacity based on the current cornerstoneMode
 */
const FABContainer = styled.div`
    position: absolute;
    left: ${(props) => props.leftPX};
    bottom: 5%;
    padding: 0.7rem 1.25rem;
    background-color: #313131;
    color: #fff;
    border: 1px solid #414141;
    border-radius: 60px;
    display: flex;
    box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);
    opacity: ${(props) => (props.fabOpacity ? '100%' : '38%')};
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
        height: 1.5rem;
        border-left: 1px solid #575757;
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
 * GUI widget that allows user to create a new detection and its polygon mask.
 *
 */
const BoundPolyFAB = ({
    isVisible,
    cornerstoneMode,
    onBoundingSelect,
    onPolygonSelect,
}) => {
    const handleClick = (e, cb) => {
        if (
            isVisible &&
            cornerstoneMode === constants.cornerstoneMode.SELECTION
        ) {
            cb(e);
        }
    };
    // Calculating screen size and setting horizontal value accordingly.
    let leftPX = '50%';
    const userScreenWidth = Utils.getScreenSize();
    let [width] = userScreenWidth;
    if (Utils.inRange(width, 0, 800)) {
        leftPX = '5.00%';
    } else if (Utils.inRange(width, 801, 1200)) {
        leftPX = '20.0%';
    } else if (Utils.inRange(width, 1201, 1500)) {
        leftPX = '28.5%';
    } else if (Utils.inRange(width, 1501, 2000)) {
        leftPX = '31.75%';
    } else if (Utils.inRange(width, 2001, 3000)) {
        leftPX = '36.25%';
    }

    let fabOpacity;
    if (
        cornerstoneMode === constants.cornerstoneMode.ANNOTATION ||
        isVisible === false
    ) {
        fabOpacity = false;
    } else {
        fabOpacity = true;
    }

    return (
        <FABContainer leftPX={leftPX} fabOpacity={fabOpacity}>
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
    cornerstoneMode: PropTypes.string.isRequired,
    onBoundingSelect: PropTypes.func.isRequired,
    onPolygonSelect: PropTypes.func.isRequired,
};

export default BoundPolyFAB;
