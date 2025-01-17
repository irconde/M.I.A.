import React from 'react';
import * as constants from '../../utils/enums/Constants';
import { useDispatch, useSelector } from 'react-redux';
import { getCornerstoneMode } from '../../redux/slices-old/ui/uiSlice';
import Tooltip from '@mui/material/Tooltip';
import {
    FABContainer,
    FABdivider,
    FabIconWrapper,
    FABoption,
} from './bound-poly-fab.styles';
import RectangleIcon from '../../icons/shared/rectangle-icon/rectangle.icon';
import PolygonIcon from '../../icons/shared/polygon-icon/polygon.icon';
import {
    clearAnnotationWidgets,
    getIsFABVisible,
    updateAnnotationMode,
    updateCornerstoneMode,
    updateEditionMode,
} from '../../redux/slices/ui.slice';
import { clearAnnotationSelection } from '../../redux/slices/annotation.slice';
import Utils from '../../utils/general/Utils';

/**
 * Styled div for the FAB Button. Takes in props to control the look depending on certain properties.
 *
 * @property {leftPX} - Prop to control the horizontal alignment dynamically
 * @property {fabOpacity} - Prop to control opacity based on the current cornerstoneMode
 * @property {show} - Prop to control whether the component should be displayed
 */

/**
 * Component for user to create a new detection and its polygon mask.
 *
 * @component
 *
 *
 */
const BoundPolyFABComponent = () => {
    const isVisible = useSelector(getIsFABVisible);
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const dispatch = useDispatch();

    const handleClick = (type) => {
        const viewport = document.getElementById('imageContainer');
        if (viewport !== null) {
            Utils.resetCornerstoneTools(viewport);
        }
        dispatch(clearAnnotationSelection());
        dispatch(clearAnnotationWidgets());
        dispatch(updateEditionMode(constants.editionMode.NO_TOOL));
        if (type === constants.annotationMode.BOUNDING) {
            dispatch(
                updateCornerstoneMode(constants.cornerstoneMode.ANNOTATION)
            );
            Utils.setToolOptions(constants.toolNames.boundingBox, {
                cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
                annotationMode: constants.annotationMode.BOUNDING,
            });
            Utils.setToolActive(constants.toolNames.boundingBox);
            Utils.dispatchAndUpdateImage(
                dispatch,
                updateAnnotationMode,
                constants.annotationMode.BOUNDING
            );
        } else if (type === constants.annotationMode.POLYGON) {
            dispatch(
                updateCornerstoneMode(constants.cornerstoneMode.ANNOTATION)
            );
            Utils.setToolOptions(constants.toolNames.segmentation, {
                cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
                annotationMode: constants.annotationMode.POLYGON,
            });
            Utils.setToolActive(constants.toolNames.segmentation);
            Utils.dispatchAndUpdateImage(
                dispatch,
                updateAnnotationMode,
                constants.annotationMode.POLYGON
            );
        } else {
            //
        }
    };
    let leftPX = 0;
    let fabOpacity;
    let show;
    if (
        cornerstoneMode === constants.cornerstoneMode.ANNOTATION ||
        cornerstoneMode === constants.cornerstoneMode.EDITION
    ) {
        fabOpacity = false;
        show = true;
    } else if (isVisible === false) {
        show = false;
    } else {
        fabOpacity = true;
        show = true;
    }

    return (
        <FABContainer leftPX={leftPX} fabOpacity={fabOpacity} show={show}>
            <Tooltip title="Create box annotation" placement="bottom">
                <FABoption
                    onClick={() => {
                        handleClick(constants.annotationMode.BOUNDING);
                    }}>
                    <FabIconWrapper>
                        <RectangleIcon
                            width={'31px'}
                            height={'31px'}
                            color={'#464646'}
                            border={'grey'}
                        />
                    </FabIconWrapper>
                    <span>Bounding box</span>
                </FABoption>
            </Tooltip>
            <FABdivider />
            <Tooltip title="Create mask annotation" placement="bottom">
                <FABoption
                    onClick={() => {
                        handleClick(constants.annotationMode.POLYGON);
                    }}>
                    <FabIconWrapper>
                        <PolygonIcon
                            width={'31px'}
                            height={'31px'}
                            color={'#464646'}
                            border={'grey'}
                        />
                    </FabIconWrapper>
                    <span>Polygon mask</span>
                </FABoption>
            </Tooltip>
        </FABContainer>
    );
};
export default BoundPolyFABComponent;
