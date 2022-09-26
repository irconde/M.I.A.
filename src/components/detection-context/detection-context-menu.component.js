import React from 'react';
import PropTypes from 'prop-types';
import DeleteIcon from '../../icons/detection-context-menu/delete-icon/delete.icon';
import TextIcon from '../../icons/detection-context-menu/text-icon/text.icon';
import PolygonIcon from '../../icons/shared/polygon-icon/polygon.icon';
import RectangleIcon from '../../icons/shared/rectangle-icon/rectangle.icon';
import MovementIcon from '../../icons/detection-context-menu/movement-icon/movement.icon';
import * as constants from '../../utils/enums/Constants';
import { editionMode } from '../../utils/enums/Constants';
import { useSelector } from 'react-redux';
import {
    getDetectionContextPosition,
    getEditionMode,
    getIsDetectionContextVisible,
    getRecentScroll,
} from '../../redux/slices-old/ui/uiSlice';
import {
    getSelectedDetectionColor,
    getSelectedDetectionType,
} from '../../redux/slices-old/detections/detectionsSlice';
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
                                <TextIcon
                                    color={'#464646'}
                                    width={'24px'}
                                    height={'24px'}
                                />
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
                                    <RectangleIcon
                                        color={'#464646'}
                                        border={'#464646'}
                                        width={'31px'}
                                        height={'31px'}
                                    />
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
                                    <PolygonIcon
                                        color={'#464646'}
                                        border={'#464646'}
                                        width={'31px'}
                                        height={'31px'}
                                    />
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
                                <MovementIcon
                                    color={'#464646'}
                                    width={'32px'}
                                    height={'32px'}
                                />
                            </IconContainer>
                        </Tooltip>
                    </MainWidget>
                    <Tooltip title="Delete annotation">
                        <DeleteWidget
                            onClick={() => handleClick(editionMode.DELETE)}>
                            <DeleteIcon
                                color={'#464646'}
                                width={'24px'}
                                height={'24px'}
                            />
                        </DeleteWidget>
                    </Tooltip>
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
