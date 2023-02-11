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
    addAnnotationArray,
    addBboxAnnotation,
    clearAnnotationSelection,
    getAnnotations,
    getSelectedAnnotation,
    getSelectedCategory,
    selectAnnotation,
    updateAnnotationPosition,
} from '../../redux/slices/annotation.slice';
import {
    clearAnnotationWidgets,
    getAnnotationMode,
    getEditionMode,
    updateAnnotationContextPosition,
    updateAnnotationContextVisibility,
    updateCornerstoneMode,
    updateEditionMode,
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
    const [pixelData, setPixelData] = useState(null);
    const [viewport, setViewport] = useState(null);
    const [error, setError] = useState('');
    const annotationRef = useRef(annotations);
    const zoomLevel = useRef();
    const editionMode = useSelector(getEditionMode);
    const editionModeRef = useRef(editionMode);
    const annotationMode = useSelector(getAnnotationMode);
    const annotationModeRef = useRef(annotationMode);
    const selectedAnnotation = useSelector(getSelectedAnnotation);
    const selectedAnnotationRef = useRef(selectedAnnotation);
    const selectedCategory = useSelector(getSelectedCategory);
    const selectedCategoryRef = useRef(selectedCategory);
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
        annotationRef.current = annotations;
    }, [annotations]);

    useEffect(() => {
        selectedAnnotationRef.current = selectedAnnotation;
    }, [selectedAnnotation]);

    useEffect(() => {
        selectedCategoryRef.current = selectedCategory;
    }, [selectedCategory]);

    useEffect(() => {
        if (annotationModeRef.current !== annotationMode) {
            if (annotationMode !== constants.annotationMode.NO_TOOL) {
                viewportRef.current.addEventListener('mouseup', onDragEnd);
                stopListeningClickEvents();
            }
        }
        annotationModeRef.current = annotationMode;
        return () => {
            viewportRef.current.removeEventListener('mouseup', onDragEnd);
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
            viewportRef.current.removeEventListener('mouseup', onDragEnd);
            viewportRef.current.removeEventListener(
                'cornerstonetoolsmousedrag',
                polygonRenderingCallback
            );
            startListeningClickEvents();
        };
    }, [editionMode]);

    useEffect(() => {
        const imageElement = viewportRef.current;
        selectedImagesDirPath &&
            displayImage(pixelData)
                .then(() => {
                    imageElement.addEventListener(
                        'cornerstoneimagerendered',
                        onImageRenderedHandler
                    );
                })
                .catch(console.log);
        return () => {
            imageElement.removeEventListener(
                'cornerstoneimagerendered',
                onImageRenderedHandler
            );
        };
    }, [selectedImagesDirPath, pixelData]);

    useEffect(() => {
        getCurrentFile()
            .then((data) => {
                const { pixelData, annotationInformation, colors } = data;
                dispatch(addAnnotationArray({ annotationInformation, colors }));
                setPixelData(pixelData);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const polygonRenderingCallback = useCallback(
        (event) => {
            cornerstone.updateImage(viewportRef.current, true);
        },
        [editionMode]
    );

    const onDragEnd = useCallback(
        (event) => {
            console.log(event);
            let toolState = null;
            if (
                annotationModeRef.current !== constants.annotationMode.NO_TOOL
            ) {
                if (
                    annotationModeRef.current ===
                    constants.annotationMode.BOUNDING
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

                        // Converting from
                        // [x_0, y_0, x_f, y_f]
                        // to
                        // [x_0, y_0, width, height]
                        bbox[2] = bbox[2] - bbox[0];
                        bbox[3] = bbox[3] - bbox[1];
                        dispatch(
                            updateEditionMode(constants.annotationMode.NO_TOOL)
                        );
                        dispatch(
                            updateCornerstoneMode(
                                constants.cornerstoneMode.SELECTION
                            )
                        );
                        Utils.dispatchAndUpdateImage(
                            dispatch,
                            addBboxAnnotation,
                            bbox
                        );
                        Utils.resetCornerstoneTools(viewportRef.current);
                    }
                }
            } else if (
                editionModeRef.current !== constants.editionMode.NO_TOOL
            ) {
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
                        segmentation.forEach((segment) => {
                            newSegmentation.push(
                                Utils.calculatePolygonMask(bbox, segment)
                            );
                        });
                        // Converting from
                        // [x_0, y_0, x_f, y_f]
                        // to
                        // [x_0, y_0, width, height]
                        bbox[2] = bbox[2] - bbox[0];
                        bbox[3] = bbox[3] - bbox[1];
                        dispatch(
                            updateEditionMode(constants.editionMode.NO_TOOL)
                        );
                        dispatch(
                            updateCornerstoneMode(
                                constants.cornerstoneMode.EDITION
                            )
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
                        const coords = Utils.calculateBoundingBox(
                            handles.points
                        );
                        const newSegmentation = [
                            Utils.polygonDataToXYArray(
                                data[0].handles.points,
                                coords
                            ),
                        ];
                        dispatch(
                            updateEditionMode(constants.editionMode.NO_TOOL)
                        );
                        dispatch(
                            updateCornerstoneMode(
                                constants.cornerstoneMode.EDITION
                            )
                        );
                        dispatch(updateAnnotationContextVisibility(true));
                        Utils.dispatchAndUpdateImage(
                            dispatch,
                            updateAnnotationPosition,
                            { id, bbox: coords, segmentation: newSegmentation }
                        );
                        Utils.resetCornerstoneTools(viewportRef.current);
                    }
                } else if (
                    editionModeRef.current === constants.editionMode.MOVE
                ) {
                    toolState = cornerstoneTools.getToolState(
                        viewportRef.current,
                        constants.toolNames.movement
                    );
                    if (toolState !== undefined && toolState.data.length > 0) {
                        const { handles, id, polygonCoords } =
                            toolState.data[0];
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
        },
        [editionMode]
    );

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
        renderAnnotations(context, annotationRef.current);
        startListeningClickEvents();
    };

    const onMouseClicked = (event) => {
        if (annotationRef.current.length > 0) {
            const mousePos = cornerstone.canvasToPixel(event.target, {
                x: event.detail.currentPoints.canvas.x,
                y: event.detail.currentPoints.canvas.y,
            });
            let clickedPos = constants.selection.NO_SELECTION;
            for (let j = annotationRef.current.length - 1; j > -1; j--) {
                if (!annotationRef.current[j].visible) continue;
                if (
                    Utils.pointInRect(mousePos, annotationRef.current[j].bbox)
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
                    updateCornerstoneMode(constants.cornerstoneMode.SELECTION)
                );
                Utils.resetCornerstoneTools(viewportRef.current);
            }
            cornerstone.updateImage(viewportRef.current, true);
        }
    };

    const renderAnnotationContextMenu = (
        event,
        annotation,
        updatedZoomLevel = null
    ) => {
        if (annotation !== null && annotation !== undefined) {
            const viewportInfo = Utils.eventToViewportInfo(
                Utils.mockCornerstoneEvent(event, viewportRef.current)
            );
            let inputZoomLevel;
            if (updatedZoomLevel !== null) {
                inputZoomLevel = updatedZoomLevel;
            } else {
                inputZoomLevel = zoomLevel.current;
            }
            let annotationContextGap = 0;
            annotationContextGap =
                viewportInfo.offset / inputZoomLevel - annotation.bbox[2];

            const { x, y } = Utils.calculateAnnotationContextPosition(
                cornerstone,
                annotation,
                viewportRef.current
            );
            console.log(`x: ${x} | y: ${y}`);
            dispatch(updateAnnotationContextPosition({ top: x, left: y }));
        }
    };

    const stopListeningClickEvents = () => {
        viewportRef.current.addEventListener(
            'cornerstonetoolsmouseclick',
            onMouseClicked
        );
    };

    const startListeningClickEvents = () => {
        viewportRef.current.addEventListener(
            'cornerstonetoolsmouseclick',
            onMouseClicked
        );
    };

    const renderAnnotations = (context, annotations) => {
        context.font = constants.annotationStyle.LABEL_FONT;
        context.lineWidth = constants.annotationStyle.BORDER_WIDTH;

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
            if (selectedAnnotationRef.current !== null) {
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

            const labelSize = Utils.getTextLabelSize(
                context,
                annotations[j].categoryName,
                constants.annotationStyle.LABEL_PADDING
            );
            context.strokeRect(
                annotations[j].bbox[0],
                annotations[j].bbox[1],
                annotations[j].bbox[2],
                annotations[j].bbox[3]
            );

            context.globalAlpha = 0.5;
            if (annotations[j].segmentation.length > 0) {
                annotations[j].segmentation.forEach((segment) => {
                    Utils.renderPolygonMasks(context, segment);
                });
            }

            context.globalAlpha = 1.0;

            // Label rendering
            context.fillRect(
                annotations[j].bbox[0],
                annotations[j].bbox[1] - labelSize['height'],
                labelSize['width'],
                labelSize['height']
            );
            context.strokeRect(
                annotations[j].bbox[0],
                annotations[j].bbox[1] - labelSize['height'],
                labelSize['width'],
                labelSize['height']
            );
            context.fillStyle = constants.annotationStyle.LABEL_TEXT_COLOR;
            context.fillText(
                annotations[j].categoryName,
                annotations[j].bbox[0] +
                    constants.annotationStyle.LABEL_PADDING,
                annotations[j].bbox[1] - constants.annotationStyle.LABEL_PADDING
            );
        }
    };

    const displayImage = async (pixelData) => {
        try {
            const imageIdTop = 'coco:0';
            Utils.loadImage(imageIdTop, pixelData)
                .then((image) => {
                    const viewport = cornerstone.getDefaultViewportForImage(
                        viewportRef.current,
                        image
                    );
                    viewport.translation.y = constants.viewportStyle.ORIGIN;
                    viewport.scale = 1.2;
                    setViewport(viewport);
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
            // TODO: clear the viewport when there's no more files
            setError(e.message);
        }
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
                <>
                    <div
                        id="viewerContainer"
                        onContextMenu={(e) => e.preventDefault()}
                        className="disable-selection noIbar"
                        unselectable="off"
                        ref={(el) => {
                            el &&
                                el.addEventListener('selectstart', (e) => {
                                    e.preventDefault();
                                });
                        }}></div>
                </>
            )}
        </ImageViewport>
    );
};

export default ImageDisplayComponent;
