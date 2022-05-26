import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ReactComponent as DeleteIcon } from '../../icons/ic_delete.svg';
import { ReactComponent as TextIcon } from '../../icons/ic_text_label.svg';
import { ReactComponent as PolygonIcon } from '../../icons/ic_polygon_dark.svg';
import { ReactComponent as RectangleIcon } from '../../icons/ic_rectangle_dark.svg';
import { ReactComponent as MovementIcon } from '../../icons/move.svg';
import { editionMode, detectionContextStyle } from '../../utils/Constants';
import * as constants from '../../utils/Constants';
import { useSelector } from 'react-redux';
import {
    getEditionMode,
    getIsDetectionContextVisible,
    getDetectionContextPosition,
    getRecentScroll,
} from '../../redux/slices/ui/uiSlice';
import {
    getSelectedDetectionColor,
    getSelectedDetectionType,
} from '../../redux/slices/detections/detectionsSlice';
import Tooltip from '@mui/material/Tooltip';

const Positioner = styled.div`
    position: absolute;
    top: ${(props) => `${props.position.top}px`};
    left: ${(props) => `${props.position.left}px`};
    z-index: 500;
`;

const FlexContainer = styled.div`
    display: flex;
    align-items: center;
`;

const MainWidget = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${detectionContextStyle.HEIGHT}px;
    border-radius: 40px;
    background-color: ${detectionContextStyle.WHITE};
    overflow: hidden;
    box-shadow: 5px 5px 15px 2px rgba(0, 0, 0, 0.41);
    /* make sure when either icon is selected, the color fills to the rounded corners */
    #firstIcon {
        border-top-left-radius: 40px;
        border-bottom-left-radius: 40px;
    }
    #lastIcon {
        border-top-right-radius: 40px;
        border-bottom-right-radius: 40px;
    }
`;

const IconContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: ${detectionContextStyle.HEIGHT}px;
    background: ${(props) =>
        props.selected ? detectionContextStyle.SELECTED_COLOR : null};
    &:active {
        background: ${detectionContextStyle.SELECTED_COLOR};
    }

    &:hover {
        background: ${(props) =>
            props.selected
                ? detectionContextStyle.SELECTED_COLOR
                : detectionContextStyle.HOVER_COLOR};
    }
`;
const DeleteWidget = styled.div`
    height: ${detectionContextStyle.HEIGHT}px;
    width: 30px;
    border-radius: 15px;
    display: flex;
    margin-left: 0.45rem;
    align-items: center;
    justify-content: center;
    background-color: ${detectionContextStyle.WHITE};

    &:hover {
        background: ${detectionContextStyle.HOVER_COLOR};
    }
`;
/**
 * Component for editing position, coordinates of bounding box, coordinates of polygon mask, and labels of specific detections.
 *
 * @component
 */
const DetectionContextMenu = ({ setSelectedOption }) => {
    const selectedDetectionColor = useSelector(getSelectedDetectionColor);
    const selectedOption = useSelector(getEditionMode);
    const isVisible = useSelector(getIsDetectionContextVisible);
    const position = useSelector(getDetectionContextPosition);
    const recentScroll = useSelector(getRecentScroll);
    const handleClick = (type) => {
        if ([...Object.values(constants.editionMode)].includes(type)) {
            setSelectedOption(type);
        } else {
            throw new Error(
                `${type} is not a valid option for DetectionContextMenu click`
            );
        }
    };

    const detectionType = useSelector(getSelectedDetectionType);
    if (isVisible === true && !recentScroll) {
        return (
            <Positioner position={position}>
                <FlexContainer>
                    <MainWidget>
                        <Tooltip
                            title="Edit Detection Label"
                            placement="bottom">
                            <IconContainer
                                id="firstIcon"
                                onClick={() => handleClick(editionMode.LABEL)}
                                selected={selectedOption === editionMode.LABEL}>
                                <TextIcon />
                            </IconContainer>
                        </Tooltip>
                        <Tooltip
                            title="Edit Detection Color"
                            placement="bottom">
                            <IconContainer
                                onClick={() => handleClick(editionMode.COLOR)}
                                selected={selectedOption === editionMode.COLOR}>
                                <div
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        border: 'solid 2px #464646',
                                        backgroundColor: selectedDetectionColor,
                                    }}
                                />
                            </IconContainer>
                        </Tooltip>
                        {detectionType !== constants.detectionType.BINARY && (
                            <Tooltip
                                title="Edit Bounding Box"
                                placement="bottom">
                                <IconContainer
                                    onClick={() =>
                                        handleClick(editionMode.BOUNDING)
                                    }
                                    selected={
                                        selectedOption === editionMode.BOUNDING
                                    }>
                                    <RectangleIcon />
                                </IconContainer>
                            </Tooltip>
                        )}
                        {detectionType === constants.detectionType.POLYGON && (
                            <Tooltip
                                title="Edit Polygon Mask"
                                placement="bottom">
                                <IconContainer
                                    onClick={() =>
                                        handleClick(editionMode.POLYGON)
                                    }
                                    selected={
                                        selectedOption === editionMode.POLYGON
                                    }>
                                    <PolygonIcon />
                                </IconContainer>
                            </Tooltip>
                        )}
                        <Tooltip
                            title="Move Detection"
                            placement="bottom">
                            <IconContainer
                                onClick={() => handleClick(editionMode.MOVE)}
                                id="lastIcon"
                                selected={selectedOption === editionMode.MOVE}>
                                <MovementIcon />
                            </IconContainer>
                        </Tooltip>
                    </MainWidget>
                    <DeleteWidget>
                        <Tooltip title="Delete Detection" placement="bottom">
                            <DeleteIcon
                                onClick={() => handleClick(editionMode.DELETE)}
                            />
                        </Tooltip>
                    </DeleteWidget>
                </FlexContainer>
            </Positioner>
        );
    } else {
        return null;
    }
};

DetectionContextMenu.propTypes = {
    /**
     * Cornerstone selectEditionMode function passed when setting cornerstone tool to new option.
     */
    setSelectedOption: PropTypes.func.isRequired,
};

export default DetectionContextMenu;
