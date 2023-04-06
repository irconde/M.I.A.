import * as cornerstoneTools from 'eac-cornerstone-tools';
import * as cornerstone from 'cornerstone-core';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader';
import dicomParser from 'dicom-parser';
import Utils from '../../utils/general/Utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as cornerstoneMath from 'cornerstone-math';
import * as constants from '../../utils/enums/Constants';
import { Channels } from '../../utils/enums/Constants';
import { ImageViewport } from './image-display.styles';
import { useDispatch, useSelector } from 'react-redux';
import { getAssetsDirPaths } from '../../redux/slices/settings.slice';
import {
    addAnnotation,
    addAnnotationArray,
    clearAnnotationData,
    clearAnnotationSelection,
    getAnnotations,
    getImageId,
    getMaxImageValues,
    getSaveAnnotationStatus,
    getSelectedAnnotation,
    getSelectedCategory,
    selectAnnotation,
    updateAnnotationPosition,
    updateColors,
    updateMaxImageValues,
    updateSaveAnnotationStatus,
} from '../../redux/slices/annotation.slice';
import {
    clearAnnotationWidgets,
    getAnnotationContextVisible,
    getAnnotationMode,
    getCornerstoneMode,
    getCurrFileName,
    getEditionMode,
    getEditLabelVisible,
    toggleSideMenu,
    updateAnnotationContextPosition,
    updateAnnotationContextVisibility,
    updateAnnotationMode,
    updateCornerstoneMode,
    updateEditionMode,
    updateEditLabelVisibility,
    updateZoomLevel,
} from '../../redux/slices/ui.slice';
import BoundingBoxDrawingTool from '../../cornerstone-tools/BoundingBoxDrawingTool';
import SegmentationDrawingTool from '../../cornerstone-tools/SegmentationDrawingTool';
import AnnotationMovementTool from '../../cornerstone-tools/AnnotationMovementTool';

const ipcRenderer = window.require('electron').ipcRenderer;

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init({
    mouseEnabled: true,
    touchEnabled: true,
});
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneWADOImageLoader.webWorkerManager.initialize({
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
        decodeTask: {
            initializeCodecsOnStartup: false,
            usePDFJS: false,
            strict: false,
        },
    },
});
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstone.registerImageLoader('myCustomLoader', Utils.loadImage);

export { cornerstone, cornerstoneTools };

const ImageDisplayComponent = () => {
    const dispatch = useDispatch();
    const { selectedImagesDirPath } = useSelector(getAssetsDirPaths);
    const viewportRef = useRef(null);
    const annotations = useSelector(getAnnotations);
    const annotationRef = useRef(annotations);
    const [pixelData, setPixelData] = useState(null);
    const [pixelType, setPixelType] = useState(null);
    const imageId = useSelector(getImageId);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const mousePositionRef = useRef(mousePosition);
    const [error, setError] = useState('');
    const zoomLevel = useRef();
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const cornerstoneModeRef = useRef(cornerstoneMode);
    const editionMode = useSelector(getEditionMode);
    const editionModeRef = useRef(editionMode);
    const annotationMode = useSelector(getAnnotationMode);
    const annotationModeRef = useRef(annotationMode);
    const selectedAnnotation = useSelector(getSelectedAnnotation);
    const selectedAnnotationRef = useRef(selectedAnnotation);
    const selectedCategory = useSelector(getSelectedCategory);
    const selectedCategoryRef = useRef(selectedCategory);
    const currentFileName = useSelector(getCurrFileName);
    const isAnnotationContextVisible = useSelector(getAnnotationContextVisible);
    const isAnnotationContextVisibleRef = useRef(isAnnotationContextVisible);
    const saveAnnotationStatus = useSelector(getSaveAnnotationStatus);
    const maxImageValues = useSelector(getMaxImageValues);
    const maxImageValuesRef = useRef(maxImageValues);
    const editLabelDisplayInfo = useRef({
        timeout: null,
        pendingDisplay: false,
        clientX: 0,
        clientY: 0,
    });
    const isEditLabelVisible = useSelector(getEditLabelVisible);
    const setupCornerstoneJS = () => {
        cornerstone.enable(viewportRef.current);
        const PanTool = cornerstoneTools.PanTool;
        cornerstoneTools.addTool(PanTool);
        cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
        const Zoom = cornerstoneTools.ZoomMouseWheelTool;
        cornerstoneTools.addTool(Zoom);
        cornerstoneTools.setToolActive('ZoomMouseWheel', {});
        const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
        cornerstoneTools.addTool(ZoomTouchPinchTool);
        cornerstoneTools.setToolActive('ZoomTouchPinch', {});
        cornerstoneTools.addTool(BoundingBoxDrawingTool);
        cornerstoneTools.addTool(SegmentationDrawingTool);
        cornerstoneTools.addTool(AnnotationMovementTool);
    };

    useEffect(setupCornerstoneJS, []);

    useEffect(() => {
        maxImageValuesRef.current = maxImageValues;
    }, [maxImageValues]);

    useEffect(() => {
        isAnnotationContextVisibleRef.current = isAnnotationContextVisible;
    }, [isAnnotationContextVisible]);

    useEffect(() => {
        annotationRef.current = annotations;
    }, [annotations]);

    useEffect(() => {
        selectedAnnotationRef.current = selectedAnnotation;
    }, [selectedAnnotation]);

    useEffect(() => {
        selectedCategoryRef.current = selectedCategory;
    }, [selectedCategory]);

    useEffect(() => {
        mousePositionRef.current = mousePosition;
    }, [mousePosition]);

    useEffect(() => {
        cornerstoneModeRef.current = cornerstoneMode;
    }, [cornerstoneMode]);

    useEffect(() => {
        if (annotationModeRef.current !== annotationMode) {
            if (annotationMode !== constants.annotationMode.NO_TOOL) {
                stopListeningClickEvents();
                document.body.style.cursor = 'none';
                if (annotationMode === constants.annotationMode.POLYGON) {
                    viewportRef.current.addEventListener(
                        constants.events.POLYGON_MASK_CREATED,
                        onPolygonEnd
                    );
                } else if (
                    annotationMode === constants.annotationMode.BOUNDING
                ) {
                    viewportRef.current.addEventListener('mouseup', onDragEnd);
                }
            }
        }
        annotationModeRef.current = annotationMode;
        return () => {
            viewportRef.current?.removeEventListener('mouseup', onDragEnd);
            viewportRef.current?.removeEventListener(
                constants.events.POLYGON_MASK_CREATED,
                onPolygonEnd
            );
            document.body.style.cursor = 'default';
            startListeningClickEvents();
        };
    }, [annotationMode]);

    useEffect(() => {
        if (editionModeRef.current !== editionMode) {
            if (editionMode !== constants.editionMode.NO_TOOL) {
                viewportRef.current.addEventListener('mouseup', onDragEnd);
                if (editionMode === constants.editionMode.POLYGON) {
                    viewportRef.current.addEventListener(
                        'cornerstonetoolsmousedrag',
                        polygonRenderingCallback
                    );
                }
                stopListeningClickEvents();
            }
        }
        editionModeRef.current = editionMode;
        return () => {
            viewportRef.current?.removeEventListener('mouseup', onDragEnd);
            viewportRef.current?.removeEventListener(
                'cornerstonetoolsmousedrag',
                polygonRenderingCallback
            );
            startListeningClickEvents();
        };
    }, [editionMode]);

    useEffect(() => {
        const imageElement = viewportRef.current;
        if (selectedImagesDirPath) {
            if (pixelData === null || pixelType === null) return;
            Utils.resetCornerstoneTools(imageElement);
            if (pixelType.toLowerCase() !== '.dcm') {
                displayCocoImage(pixelData)
                    .then(() => {
                        viewportRef.current.addEventListener(
                            'cornerstoneimagerendered',
                            onImageRenderedHandler
                        );
                        document.body.addEventListener(
                            'mousemove',
                            onMouseMoved
                        );
                    })
                    .catch(console.log);
            } else {
                displayDicomImage(pixelData)
                    .then(() => {
                        imageElement.addEventListener(
                            'cornerstoneimagerendered',
                            onImageRenderedHandler
                        );
                        document.body.addEventListener(
                            'mousemove',
                            onMouseMoved
                        );
                    })
                    .catch(console.log);
            }
        }
        return () => {
            imageElement.removeEventListener(
                'cornerstoneimagerendered',
                onImageRenderedHandler
            );
            document.body.removeEventListener('mousemove', onMouseMoved);
        };
    }, [selectedImagesDirPath, pixelData, pixelType]);

    useEffect(() => {
        fetchCurrentFile();
    }, [currentFileName]);

    useEffect(() => {
        if (saveAnnotationStatus === constants.SAVE_STATUSES.SAVED) {
            dispatch(updateSaveAnnotationStatus(constants.SAVE_STATUSES.IDLE));
            dispatch(
                updateCornerstoneMode(constants.cornerstoneMode.SELECTION)
            );
            dispatch(updateEditionMode(constants.editionMode.NO_TOOL));
            dispatch(updateAnnotationMode(constants.annotationMode.NO_TOOL));
            dispatch(clearAnnotationWidgets());
            dispatch(clearAnnotationData());
            fetchCurrentFile();
        }
    }, [saveAnnotationStatus]);

    const fetchCurrentFile = () => {
        getCurrentFile()
            .then((data) => {
                const { pixelData, pixelType, annotationInformation, colors } =
                    data;
                if (annotationInformation !== undefined) {
                    dispatch(
                        addAnnotationArray({ annotationInformation, colors })
                    );
                } else {
                    dispatch(updateColors(colors));
                }
                setPixelData(pixelData);
                setPixelType(pixelType);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const onMouseMoved = useCallback(
        (event) => {
            setMousePosition({ x: event.x, y: event.y });
            if (
                annotationModeRef.current ===
                    constants.annotationMode.BOUNDING ||
                annotationModeRef.current === constants.annotationMode.POLYGON
            ) {
                cornerstone.updateImage(viewportRef.current, true);
            }
        },
        [annotationModeRef]
    );

    const polygonRenderingCallback = useCallback(() => {
        cornerstone.updateImage(viewportRef.current, true);
    }, [editionMode]);

    const onPolygonEnd = useCallback(() => {
        let toolState = cornerstoneTools.getToolState(
            viewportRef.current,
            constants.toolNames.segmentation
        );
        if (toolState !== undefined && toolState.data.length > 0) {
            const { data } = toolState;
            const { handles } = data[0];
            const bbox = Utils.calculateBoundingBox(handles.points);
            const segmentation = [
                Utils.polygonDataToXYArray(data[0].handles.points, bbox),
            ];
            const area = Math.abs(
                (bbox[0] - (bbox[0] + bbox[2])) *
                    (bbox[1] - (bbox[1] + bbox[3]))
            );
            if (annotationRef.current.length === 0) {
                dispatch(toggleSideMenu());
            }
            Utils.dispatchAndUpdateImage(dispatch, addAnnotation, {
                bbox,
                area,
                segmentation,
            });
        }
        dispatch(updateAnnotationMode(constants.annotationMode.NO_TOOL));
        dispatch(updateCornerstoneMode(constants.cornerstoneMode.SELECTION));
        Utils.resetCornerstoneTools(viewportRef.current);
    }, [annotationMode]);

    const onDragEnd = useCallback(() => {
        let toolState = null;
        if (annotationModeRef.current !== constants.annotationMode.NO_TOOL) {
            if (
                annotationModeRef.current === constants.annotationMode.BOUNDING
            ) {
                toolState = cornerstoneTools.getToolState(
                    viewportRef.current,
                    constants.toolNames.boundingBox
                );
                if (toolState !== undefined && toolState.data.length > 0) {
                    const { data } = toolState;
                    const { handles } = data[0];
                    let bbox = Utils.getBboxFromHandles(
                        handles.start,
                        handles.end
                    );
                    const area = Math.abs(
                        (bbox[0] - bbox[2]) * (bbox[1] - bbox[3])
                    );
                    // Converting from
                    // [x_0, y_0, x_f, y_f]
                    // to
                    // [x_0, y_0, width, height]
                    bbox[2] = bbox[2] - bbox[0];
                    bbox[3] = bbox[3] - bbox[1];
                    dispatch(
                        updateAnnotationMode(constants.annotationMode.NO_TOOL)
                    );
                    dispatch(
                        updateCornerstoneMode(
                            constants.cornerstoneMode.SELECTION
                        )
                    );
                    if (area > 0) {
                        if (annotationRef.current.length === 0) {
                            dispatch(toggleSideMenu());
                        }
                        Utils.dispatchAndUpdateImage(dispatch, addAnnotation, {
                            bbox,
                            area,
                            segmentation: [],
                        });
                    }
                    Utils.resetCornerstoneTools(viewportRef.current);
                }
            }
        } else if (editionModeRef.current !== constants.editionMode.NO_TOOL) {
            if (editionModeRef.current === constants.editionMode.BOUNDING) {
                toolState = cornerstoneTools.getToolState(
                    viewportRef.current,
                    constants.toolNames.boundingBox
                );
                if (toolState !== undefined && toolState.data.length > 0) {
                    const { data } = toolState;
                    const { handles, id, segmentation } = data[0];
                    let bbox = Utils.getBboxFromHandles(
                        handles.start,
                        handles.end
                    );
                    const newSegmentation = [];
                    if (segmentation?.length > 0) {
                        segmentation.forEach((segment) => {
                            newSegmentation.push(
                                Utils.calculatePolygonMask(bbox, segment)
                            );
                        });
                    }
                    // Converting from
                    // [x_0, y_0, x_f, y_f]
                    // to
                    // [x_0, y_0, width, height]
                    bbox[2] = bbox[2] - bbox[0];
                    bbox[3] = bbox[3] - bbox[1];
                    dispatch(updateEditionMode(constants.editionMode.NO_TOOL));
                    dispatch(
                        updateCornerstoneMode(constants.cornerstoneMode.EDITION)
                    );
                    dispatch(updateAnnotationContextVisibility(true));
                    Utils.dispatchAndUpdateImage(
                        dispatch,
                        updateAnnotationPosition,
                        { id, bbox: bbox, segmentation: newSegmentation }
                    );
                    Utils.resetCornerstoneTools(viewportRef.current);
                }
            } else if (
                editionModeRef.current === constants.editionMode.POLYGON
            ) {
                toolState = cornerstoneTools.getToolState(
                    viewportRef.current,
                    constants.toolNames.segmentation
                );
                if (toolState !== undefined && toolState.data.length > 0) {
                    const { data } = toolState;
                    const { handles, id } = data[0];
                    const bbox = Utils.calculateBoundingBox(handles.points);
                    const newSegmentation = [
                        Utils.polygonDataToXYArray(
                            data[0].handles.points,
                            bbox
                        ),
                    ];
                    dispatch(updateEditionMode(constants.editionMode.NO_TOOL));
                    dispatch(
                        updateCornerstoneMode(constants.cornerstoneMode.EDITION)
                    );
                    dispatch(updateAnnotationContextVisibility(true));
                    Utils.dispatchAndUpdateImage(
                        dispatch,
                        updateAnnotationPosition,
                        { id, bbox, segmentation: newSegmentation }
                    );
                    Utils.resetCornerstoneTools(viewportRef.current);
                }
            } else if (editionModeRef.current === constants.editionMode.MOVE) {
                toolState = cornerstoneTools.getToolState(
                    viewportRef.current,
                    constants.toolNames.movement
                );
                if (toolState !== undefined && toolState.data.length > 0) {
                    const { handles, id, polygonCoords } = toolState.data[0];
                    const bbox = [
                        handles.start.x,
                        handles.start.y,
                        handles.end.x - handles.start.x,
                        handles.end.y - handles.start.y,
                    ];
                    const newSegmentation = [];
                    polygonCoords.forEach((segment) => {
                        newSegmentation.push(
                            Utils.calculatePolygonMask(
                                [
                                    handles.start.x,
                                    handles.start.y,
                                    handles.end.x,
                                    handles.end.y,
                                ],
                                segment
                            )
                        );
                    });
                    dispatch(updateAnnotationContextVisibility(true));
                    Utils.dispatchAndUpdateImage(
                        dispatch,
                        updateAnnotationPosition,
                        { id, bbox, segmentation: newSegmentation }
                    );
                }
                dispatch(updateEditionMode(constants.editionMode.NO_TOOL));
                dispatch(
                    updateCornerstoneMode(constants.cornerstoneMode.EDITION)
                );
                Utils.resetCornerstoneTools(viewportRef.current);
            }
        }
    }, [editionMode]);

    const getCurrentFile = async () => {
        try {
            return ipcRenderer.invoke(Channels.getCurrentFile);
        } catch (e) {
            console.log(e);
        }
    };

    const onImageRenderedHandler = (event) => {
        if (!event) {
            return;
        }
        console.log('image render');
        const eventData = event.detail;
        zoomLevel.current = eventData.viewport.scale;
        dispatch(updateZoomLevel(zoomLevel.current));

        if (
            maxImageValuesRef.current.maxBrightness === 0 &&
            maxImageValuesRef.current.maxContrast === 0
        ) {
            const element = document.getElementById('imageContainer');
            if (element !== null) {
                const image = cornerstone.getImage(element);

                // Calculate the range between the minimum and maximum pixel values
                const pixelRange = image.maxPixelValue - image.minPixelValue;
                // Calculate the maximum contrast value based on the pixel range
                const maxContrast = pixelRange / 0.5;
                const maxBrightness = image.maxPixelValue;
                dispatch(updateMaxImageValues({ maxBrightness, maxContrast }));
            }
        }

        if (selectedAnnotationRef.current !== null) {
            if (editionModeRef.current !== constants.editionMode.NO_TOOL) {
                let toolState = null;
                if (editionModeRef.current === constants.editionMode.BOUNDING) {
                    toolState = cornerstoneTools.getToolState(
                        viewportRef.current,
                        constants.toolNames.boundingBox
                    );
                    if (
                        toolState !== null &&
                        toolState !== undefined &&
                        toolState.data.length > 0
                    ) {
                        const { data } = toolState;
                        const { handles } = data[0];
                        let bbox = [];
                        const { start, end } = handles;
                        // Fix flipped rectangle issues
                        if (start.x > end.x && start.y > end.y) {
                            bbox = [end.x, end.y, start.x, start.y];
                        } else if (start.x > end.x) {
                            bbox = [end.x, start.y, start.x, end.y];
                        } else if (start.y > end.y) {
                            bbox = [start.x, end.y, end.x, start.y];
                        } else {
                            bbox = [start.x, start.y, end.x, end.y];
                        }
                        bbox[2] = bbox[2] - bbox[0];
                        bbox[3] = bbox[3] - bbox[1];
                        const { top, left } =
                            Utils.calculateAnnotationContextPosition(
                                cornerstone,
                                bbox,
                                viewportRef.current,
                                zoomLevel.current
                            );
                        dispatch(
                            updateAnnotationContextPosition({ top, left })
                        );
                    }
                } else if (
                    editionModeRef.current === constants.editionMode.MOVE
                ) {
                    toolState = cornerstoneTools.getToolState(
                        viewportRef.current,
                        constants.toolNames.movement
                    );
                    if (toolState !== undefined && toolState.data.length > 0) {
                        const { handles } = toolState.data[0];
                        const bbox = [
                            handles.start.x,
                            handles.start.y,
                            handles.end.x - handles.start.x,
                            handles.end.y - handles.start.y,
                        ];
                        const { top, left } =
                            Utils.calculateAnnotationContextPosition(
                                cornerstone,
                                bbox,
                                viewportRef.current,
                                zoomLevel.current
                            );
                        dispatch(
                            updateAnnotationContextPosition({ top, left })
                        );
                    }
                } else if (
                    editionModeRef.current === constants.editionMode.POLYGON
                ) {
                    toolState = cornerstoneTools.getToolState(
                        viewportRef.current,
                        constants.toolNames.segmentation
                    );
                    if (toolState !== undefined && toolState.data.length > 0) {
                        const { data } = toolState;
                        const { handles } = data[0];
                        const bbox = Utils.calculateBoundingBox(handles.points);
                        const { top, left } =
                            Utils.calculateAnnotationContextPosition(
                                cornerstone,
                                bbox,
                                viewportRef.current,
                                zoomLevel.current
                            );
                        dispatch(
                            updateAnnotationContextPosition({ top, left })
                        );
                    }
                }
            } else {
                const { top, left } = Utils.calculateAnnotationContextPosition(
                    cornerstone,
                    selectedAnnotationRef.current.bbox,
                    viewportRef.current,
                    zoomLevel.current
                );
                dispatch(updateAnnotationContextPosition({ top, left }));
            }
        } else {
            if (isAnnotationContextVisibleRef.current) {
                dispatch(updateAnnotationContextVisibility(false));
            }
        }

        Utils.setToolOptions(constants.toolNames.boundingBox, {
            zoomLevel: zoomLevel.current,
        });
        Utils.setToolOptions(constants.toolNames.segmentation, {
            zoomLevel: zoomLevel.current,
        });
        Utils.setToolOptions(constants.toolNames.movement, {
            zoomLevel: zoomLevel.current,
        });
        const context = eventData.canvasContext;
        if (
            annotationModeRef.current === constants.annotationMode.BOUNDING ||
            annotationModeRef.current === constants.annotationMode.POLYGON
        ) {
            Utils.renderBboxCrosshair(
                context,
                event.target,
                mousePositionRef.current,
                viewportRef.current
            );
        }
        renderAnnotations(context, annotationRef.current);
        if (
            cornerstoneModeRef.current !== constants.cornerstoneMode.ANNOTATION
        ) {
            startListeningClickEvents();
        } else {
            stopListeningClickEvents();
        }
    };

    const onMouseClicked = useCallback(
        (event) => {
            if (annotationRef.current.length > 0) {
                const mousePos = cornerstone.canvasToPixel(event.target, {
                    x: event.detail.currentPoints.canvas.x,
                    y: event.detail.currentPoints.canvas.y,
                });
                let clickedPos = constants.selection.NO_SELECTION;
                for (let j = 0; j < annotationRef.current.length; j++) {
                    if (!annotationRef.current[j].visible) continue;
                    if (
                        Utils.pointInRect(
                            mousePos,
                            annotationRef.current[j].bbox
                        )
                    ) {
                        clickedPos = j;
                        break;
                    }
                }
                if (clickedPos !== constants.selection.NO_SELECTION) {
                    dispatch(
                        selectAnnotation(annotationRef.current[clickedPos].id)
                    );
                    dispatch(
                        updateCornerstoneMode(constants.cornerstoneMode.EDITION)
                    );
                    renderAnnotationContextMenu(
                        event,
                        annotationRef.current[clickedPos]
                    );
                } else {
                    dispatch(clearAnnotationSelection());
                    dispatch(clearAnnotationWidgets());
                    dispatch(
                        updateCornerstoneMode(
                            constants.cornerstoneMode.SELECTION
                        )
                    );
                    Utils.resetCornerstoneTools(viewportRef.current);
                }
                cornerstone.updateImage(viewportRef.current, true);
            }
        },
        [annotationRef]
    );

    const renderAnnotationContextMenu = (event, annotation) => {
        if (annotation !== null && annotation !== undefined) {
            const { top, left } = Utils.calculateAnnotationContextPosition(
                cornerstone,
                annotation,
                viewportRef.current,
                zoomLevel.current
            );
            dispatch(
                updateAnnotationContextPosition({
                    top,
                    left,
                })
            );
        }
    };

    const stopListeningClickEvents = () => {
        viewportRef.current.removeEventListener(
            'cornerstonetoolsmouseclick',
            onMouseClicked
        );
    };

    const startListeningClickEvents = () => {
        viewportRef.current?.addEventListener(
            'cornerstonetoolsmouseclick',
            onMouseClicked
        );
    };

    const renderAnnotations = (context, annotations) => {
        const { current: zoom } = zoomLevel;
        const { LABEL_PADDING, BORDER_WIDTH, LABEL_HEIGHT } =
            constants.annotationStyle;
        context.font = constants.annotationStyle.FONT_DETAILS.get(zoom);
        context.lineWidth = BORDER_WIDTH / zoom;

        for (let j = 0; j < annotations.length; j++) {
            if (
                !annotations[j].visible ||
                (annotations[j].selected &&
                    editionModeRef.current !== constants.editionMode.NO_TOOL)
            )
                continue;
            let renderColor = annotations[j].color;
            if (annotations[j].selected || annotations[j].categorySelected) {
                renderColor = constants.annotationStyle.SELECTED_COLOR;
            }
            if (
                selectedAnnotationRef.current !== null &&
                selectedCategoryRef.current === ''
            ) {
                if (selectedAnnotationRef.current.id !== annotations[j].id) {
                    const rgb = Utils.hexToRgb(annotations[j].color);
                    renderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
                }
            }
            if (
                selectedCategoryRef.current !== '' &&
                selectedCategoryRef.current !== annotations[j].categoryName
            ) {
                const rgb = Utils.hexToRgb(annotations[j].color);
                renderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
            }
            context.strokeStyle = renderColor;
            context.fillStyle = renderColor;

            const [x, y, w, h] = annotations[j].bbox;

            context.strokeRect(x, y, w, h);

            context.globalAlpha = 0.5;
            if (annotations[j].segmentation.length > 0) {
                if (annotations[j].iscrowd === 0) {
                    annotations[j].segmentation.forEach((segment) => {
                        Utils.renderPolygonMasks(context, segment);
                    });
                }
            } else if (annotations[j].iscrowd === 1) {
                Utils.renderRLEMask(context, annotations[j].segmentation);
            }

            context.globalAlpha = 1.0;

            // Label rendering
            const { width, height } = Utils.getTextLabelSize(
                context,
                annotations[j].categoryName,
                LABEL_PADDING.LEFT,
                zoom,
                LABEL_HEIGHT
            );

            context.fillRect(
                x - context.lineWidth / 2,
                y - height,
                width,
                height
            );
            context.fillStyle = constants.annotationStyle.LABEL_TEXT_COLOR;
            context.fillText(
                annotations[j].categoryName,
                x + (LABEL_PADDING.LEFT - 1) / zoom,
                y - LABEL_PADDING.BOTTOM / zoom
            );
        }
    };

    const displayCocoImage = async (pixelData) => {
        try {
            const imageIdTop = `coco:${imageId}`;
            Utils.loadImage(imageIdTop, pixelData)
                .then((image) => {
                    const viewport = cornerstone.getDefaultViewportForImage(
                        viewportRef.current,
                        image
                    );
                    viewport.translation.y = constants.viewportStyle.ORIGIN;
                    viewport.scale = 1.2;

                    cornerstone.displayImage(
                        viewportRef.current,
                        image,
                        viewport
                    );
                })
                .catch((err) => {
                    setError(err.message);
                });
            // clear error if there is one
            error && setError('');
        } catch (e) {
            setError(e.message);
        }
    };

    const displayDicomImage = async (pixelData) => {
        return new Promise((resolve, reject) => {
            const cornerstonePixelData =
                cornerstoneWADOImageLoader.wadouri.fileManager.add(
                    new Blob([pixelData])
                );
            cornerstone
                .loadImage(cornerstonePixelData)
                .then((image) => {
                    const viewport = cornerstone.getDefaultViewportForImage(
                        viewportRef.current,
                        image
                    );
                    viewport.translation.y = constants.viewportStyle.ORIGIN;
                    viewport.scale = 1.2;

                    cornerstone.displayImage(
                        viewportRef.current,
                        image,
                        viewport
                    );
                    resolve();
                })
                .catch((error) => {
                    setError(error.message);
                    reject(error);
                });
        });
    };

    return (
        <ImageViewport ref={viewportRef}>
            {error ? (
                // TODO: replace error component with styled component
                <p
                    style={{
                        paddingTop: '5rem',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}>
                    {error}
                </p>
            ) : (
                <div
                    id="viewerContainer"
                    onContextMenu={(e) => e.preventDefault()}
                    className="disable-selection noIbar"
                    onWheel={() => {
                        if (isEditLabelVisible) {
                            dispatch(updateEditLabelVisibility(false));
                            editLabelDisplayInfo.current.pendingDisplay = true;
                        }

                        if (editLabelDisplayInfo.current.pendingDisplay) {
                            clearTimeout(editLabelDisplayInfo.current.timeout);
                            editLabelDisplayInfo.current.timeout = setTimeout(
                                () => {
                                    // runs when done scrolling
                                    dispatch(updateEditLabelVisibility(true));
                                    editLabelDisplayInfo.current.pendingDisplay = false;
                                },
                                300
                            );
                        }
                    }}
                    onMouseDown={({ clientX, clientY }) => {
                        if (!isEditLabelVisible) return;
                        // step 1: if the edit label is visible, save the mouse position
                        dispatch(updateEditLabelVisibility(false));
                        editLabelDisplayInfo.current.clientX = clientX;
                        editLabelDisplayInfo.current.clientY = clientY;
                        editLabelDisplayInfo.current.pendingDisplay = true;
                    }}
                    onMouseUp={(e) => {
                        const { clientX, clientY, pendingDisplay } =
                            editLabelDisplayInfo.current;
                        // step 2: if the mouse position is different then we have a drag event
                        if (
                            (e.clientX !== clientX || e.clientY !== clientY) &&
                            pendingDisplay
                        ) {
                            dispatch(updateEditLabelVisibility(true));
                        }
                        editLabelDisplayInfo.current.pendingDisplay = false;
                    }}
                    style={{
                        userSelect: 'none',
                        height: '100vh',
                        width: '100%',
                        position: 'absolute',
                    }}
                    ref={(el) => {
                        el &&
                            el.addEventListener('selectstart', (e) => {
                                e.preventDefault();
                            });
                    }}></div>
            )}
        </ImageViewport>
    );
};

export default ImageDisplayComponent;
