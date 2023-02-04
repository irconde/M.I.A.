import React from 'react';
import DeleteIcon from '../../icons/detection-context-menu/delete-icon/delete.icon';
import TextIcon from '../../icons/detection-context-menu/text-icon/text.icon';
import PolygonIcon from '../../icons/shared/polygon-icon/polygon.icon';
import MovementIcon from '../../icons/detection-context-menu/movement-icon/movement.icon';
import * as constants from '../../utils/enums/Constants';
import { editionMode } from '../../utils/enums/Constants';
import { useDispatch, useSelector } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';
import {
    DeleteWidget,
    FlexContainer,
    IconContainer,
    MainWidget,
    Positioner,
    StyledSelectedDetection,
} from './annotation-context-menu.styles';
import {
    getAnnotationContextPosition,
    getAnnotationContextVisible,
    getEditionMode,
    updateAnnotationContextPosition,
    updateAnnotationContextVisibility,
    updateColorPickerVisibility,
    updateEditionMode,
    updateEditLabelVisibility,
} from '../../redux/slices/ui.slice';
import {
    deleteSelectedAnnotation,
    getSelectedAnnotation,
    getSelectedAnnotationColor,
} from '../../redux/slices/annotation.slice';
import Utils from '../../utils/general/Utils';
import RectangleIcon from '../../icons/shared/rectangle-icon/rectangle.icon';

/**
 * Component for editing position, coordinates of bounding box, coordinates of polygon mask, and labels of specific detections.
 *
 * @component
 */
const AnnotationContextMenuComponent = () => {
    const isVisible = useSelector(getAnnotationContextVisible);
    const selectedAnnotationColor = useSelector(getSelectedAnnotationColor);
    const selectedOption = useSelector(getEditionMode);
    const position = useSelector(getAnnotationContextPosition);
    const selectedAnnotation = useSelector(getSelectedAnnotation);
    const dispatch = useDispatch();
    let toolData = {};
    /*const recentScroll = useSelector(getRecentScroll);*/
    const handleClick = (type) => {
        switch (type) {
            case constants.editionMode.MOVE:
                console.log('moving');
                break;
            case constants.editionMode.COLOR:
                dispatch(updateAnnotationContextVisibility(false));
                dispatch(updateColorPickerVisibility(true));
                break;
            case constants.editionMode.LABEL:
                dispatch(updateAnnotationContextVisibility(false));
                dispatch(updateEditLabelVisibility(true));
                break;
            case constants.editionMode.POLYGON:
                console.log('polying');
                break;
            case constants.editionMode.BOUNDING:
                console.log('bounding');
                dispatch(updateAnnotationContextVisibility(false));
                Utils.updateToolState('BoundingBoxDrawing', {
                    handles: {
                        start: {
                            x: selectedAnnotation.bbox[0],
                            y: selectedAnnotation.bbox[1],
                        },
                        end: {
                            x:
                                selectedAnnotation.bbox[0] +
                                selectedAnnotation.bbox[2],
                            y:
                                selectedAnnotation.bbox[1] +
                                selectedAnnotation.bbox[3],
                        },
                        start_prima: {
                            x: selectedAnnotation.bbox[0],
                            y:
                                selectedAnnotation.bbox[1] +
                                selectedAnnotation.bbox[3],
                        },
                        end_prima: {
                            x:
                                selectedAnnotation.bbox[0] +
                                selectedAnnotation.bbox[2],
                            y: selectedAnnotation.bbox[1],
                        },
                    },
                    uuid: selectedAnnotation.id,
                    categoryName: selectedAnnotation.categoryName,
                    renderColor: constants.detectionStyle.SELECTED_COLOR,
                    updatingDetection: true,
                });
                Utils.setToolOptions('BoundingBoxDrawing', {
                    cornerstoneMode: constants.cornerstoneMode.EDITION,
                    editionMode: constants.editionMode.BOUNDING,
                });
                Utils.setToolActive('BoundingBoxDrawing');
                Utils.dispatchAndUpdateImage(
                    dispatch,
                    updateEditionMode,
                    constants.editionMode.BOUNDING
                );
                break;
            case constants.editionMode.DELETE:
                dispatch(updateAnnotationContextPosition({ top: 0, left: 0 }));
                Utils.dispatchAndUpdateImage(
                    dispatch,
                    deleteSelectedAnnotation
                );
                break;
            default:
                console.log('NIHIL');
        }
    };

    /*if (isVisible === true && !recentScroll)*/
    if (isVisible === true) {
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
                                        selectedAnnotationColor
                                    }
                                />
                            </IconContainer>
                        </Tooltip>
                        {selectedAnnotation?.bbox?.length > 0 ? (
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
                        ) : null}
                        {selectedAnnotation?.segmentation?.length > 0 ? (
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
                        ) : null}
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

export default AnnotationContextMenuComponent;
