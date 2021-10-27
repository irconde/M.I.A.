import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ReactComponent as PolygonIcon } from '../../icons/ic_polygon.svg';
import { ReactComponent as RectangleIcon } from '../../icons/ic_rectangle.svg';
import * as constants from '../../utils/Constants';
import { useSelector } from 'react-redux';
import {
    getIsFabVisible,
    getCornerstoneMode,
    getCollapsedSideMenu,
} from '../../redux/slices/ui/uiSlice';
import { getDeviceType } from '../../redux/slices/settings/settingsSlice';

/**
 * FABContainer - Styled div for the FAB Button. Takes in props to control the look
 *                depending on certain properties.
 *
 * @property {leftPX} - Prop to control the horizontal alignment dynamically
 * @property {fabOpacity} - Prop to control opacity based on the current cornerstoneMode
 * @property {show} - Prop to control whether the component should be displayed
 */
const FABContainer = styled.div`
    position: absolute;
    left: ${(props) => props.leftPX};
    bottom: ${(props) =>
        props.deviceType === constants.DEVICE_TYPE.DESKTOP ? '5%' : '2%'};
    padding: 0.7rem 1.25rem;
    background-color: #313131;
    color: #fff;
    border: 1px solid #414141;
    border-radius: 60px;
    display: ${(props) => (props.show ? 'flex' : 'none')};
    box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);
    opacity: ${(props) => (props.fabOpacity ? '100%' : '28%')};
    animation: fadein ${(props) => (props.fabOpacity ? '2s' : '0.75s')}; /* fade component in so cornerstone can load */
    pointer-events: ${(props) => (props.fabOpacity ? 'auto' : 'none')};
    right: 0;
    width: max-content;
    margin-left: auto;
    margin-right: auto;
    -webkit-transition: all 0.3s ease-in;
    -moz-transition: all 0.3s ease-in;
    -o-transition: all 0.3s ease-in;
    -ms-transition: all 0.3s ease-in;
    transition: all 0.3s ease-in;

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: ${(props) => (props.fabOpacity ? '1' : '0.28')};
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
const BoundPolyFAB = ({ onBoundingSelect, onPolygonSelect }) => {
    const isVisible = useSelector(getIsFabVisible);
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const sideMenuCollapsed = useSelector(getCollapsedSideMenu);
    const deviceType = useSelector(getDeviceType);
    const handleClick = (e, cb) => {
        if (
            isVisible &&
            cornerstoneMode === constants.cornerstoneMode.SELECTION
        ) {
            cb(e);
        }
    };
    // Calculating screen size and setting horizontal value accordingly.
    let leftPX = sideMenuCollapsed ? '0' : '-' + constants.sideMenuWidth + 'px';

    let fabOpacity;
    let show;
    if (
        cornerstoneMode === constants.cornerstoneMode.ANNOTATION ||
        cornerstoneMode === constants.cornerstoneMode.EDITION
    ) {
        fabOpacity = false;
        show = true;
        if (cornerstoneMode === constants.cornerstoneMode.ANNOTATION) {
            let canvasElements =
                document.getElementsByClassName('cornerstone-canvas');
            let multipleViewports = canvasElements.length > 1;
            if (canvasElements[0] !== undefined)
                canvasElements[0].id = 'selectedTop';
            if (multipleViewports) canvasElements[1].id = 'selectedSide';
        }
    } else if (isVisible === false) {
        show = false;
    } else {
        fabOpacity = true;
        show = true;
        let canvasElements =
            document.getElementsByClassName('cornerstone-canvas');
        let multipleViewports = canvasElements.length > 1;
        canvasElements[0].id = '';
        if (multipleViewports) canvasElements[1].id = '';
    }

    return (
        <FABContainer
            leftPX={leftPX}
            fabOpacity={fabOpacity}
            show={show}
            deviceType={deviceType}>
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
    onBoundingSelect: PropTypes.func.isRequired,
    onPolygonSelect: PropTypes.func.isRequired,
};

export default BoundPolyFAB;
