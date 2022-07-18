import React from 'react';
import PropTypes from 'prop-types';
//import { ReactComponent as DeleteIcon } from '../../icons/ic_delete.svg';
import DeleteIcon from '../../icons/detection-context-menu/delete-icon/delete.icon';
import { ReactComponent as TextIcon } from '../../icons/ic_text_label.svg';
import { ReactComponent as PolygonIcon } from '../../icons/ic_polygon_dark.svg';
import { ReactComponent as RectangleIcon } from '../../icons/ic_rectangle_dark.svg';
import { ReactComponent as MovementIcon } from '../../icons/move.svg';
import * as constants from '../../utils/Constants';
import { editionMode } from '../../utils/Constants';
import { useSelector } from 'react-redux';
import {
    getDetectionContextPosition,
    getEditionMode,
    getIsDetectionContextVisible,
    getRecentScroll,
} from '../../redux/slices/ui/uiSlice';
import {
    getSelectedDetectionColor,
    getSelectedDetectionType,
} from '../../redux/slices/detections/detectionsSlice';
import Tooltip from '@mui/material/Tooltip';
import {
    DeleteWidget,
    FlexContainer,
    IconContainer,
    MainWidget,
    Positioner,
    StyledSelectedDetection,
} from './detection-context-menu.styles';

/**
 * Component for editing position, coordinates of bounding box, coordinates of polygon mask, and labels of specific detections.
 *
 * @component
 */
const DetectionContextMenuComponent = ({ setSelectedOption }) => {
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
                            title="Edit annotation class"
                            placement="bottom">
                            <IconContainer
                                id="firstIcon"
                                onClick={() => handleClick(editionMode.LABEL)}
                                selected={selectedOption === editionMode.LABEL}>
                                <TextIcon />
                            </IconContainer>
                        </Tooltip>
                        <Tooltip
                            title="Edit annotation color"
                            placement="bottom">
                            <IconContainer
                                onClick={() => handleClick(editionMode.COLOR)}
                                selected={selectedOption === editionMode.COLOR}>
                                <StyledSelectedDetection
                                    selectedDetectionColor={
                                        selectedDetectionColor
                                    }
                                />
                            </IconContainer>
                        </Tooltip>
                        {detectionType !== constants.detectionType.BINARY && (
                            <Tooltip
                                title="Edit box annotation"
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
                                title="Edit mask annotation"
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
                            title="Translate annotation"
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
                        <Tooltip title="Delete annotation">
                            <DeleteIcon
                                pathColor={'#464646'}
                                fillColor={'#000000'}
                                width={"24px"}
                                height={"24px"}
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

DetectionContextMenuComponent.propTypes = {
    /**
     * Cornerstone selectEditionMode function passed when setting cornerstone tool to new option.
     */
    setSelectedOption: PropTypes.func.isRequired,
};

export default DetectionContextMenuComponent;
