import * as cornerstoneTools from 'eac-cornerstone-tools';
import * as cornerstone from 'cornerstone-core';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader';
import dicomParser from 'dicom-parser';
import Utils from '../../utils/general/Utils';
import React, { useEffect, useRef, useState } from 'react';
import * as cornerstoneMath from 'cornerstone-math';
import * as constants from '../../utils/enums/Constants';
import { Channels } from '../../utils/enums/Constants';
import { ImageViewport } from './image-display.styles';
import { useDispatch, useSelector } from 'react-redux';
import { getAssetsDirPaths } from '../../redux/slices/settings.slice';
import {
    addAnnotationArray,
    getAnnotations,
} from '../../redux/slices/annotation.slice';

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

const ImageDisplayComponent = () => {
    const dispatch = useDispatch();
    const { selectedImagesDirPath } = useSelector(getAssetsDirPaths);
    const viewportRef = useRef(null);
    const annotations = useSelector(getAnnotations);
    const [pixelData, setPixelData] = useState(null);
    const [viewport, setViewport] = useState(null);
    const [error, setError] = useState('');
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
    };

    useEffect(setupCornerstoneJS, []);

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
        getNextFile()
            .then((data) => {
                console.log(data);
                const { pixelData, annotationInformation } = data;
                dispatch(addAnnotationArray(annotationInformation));
                setPixelData(pixelData);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const getNextFile = async () => {
        try {
            return ipcRenderer.invoke(Channels.getNextFile);
        } catch (e) {
            console.log(e);
        }
    };

    const onImageRenderedHandler = (event) => {
        if (!event) {
            return;
        }
        const eventData = event.detail;
        const context = eventData.canvasContext;
        renderAnnotations(context);
    };

    const renderAnnotations = (context) => {
        context.font = constants.detectionStyle.LABEL_FONT;
        context.lineWidth = constants.detectionStyle.BORDER_WIDTH;

        for (let j = 0; j < annotations.length; j++) {
            context.strokeStyle = annotations[j].color;
            context.fillStyle = annotations[j].color;

            const labelSize = Utils.getTextLabelSize(
                context,
                annotations[j].categoryName,
                constants.detectionStyle.LABEL_PADDING
            );
            context.strokeRect(
                annotations[j].bbox[0],
                annotations[j].bbox[1],
                annotations[j].bbox[2],
                annotations[j].bbox[3]
            );

            context.globalAlpha = 0.5;
            /*if (data[j].polygonMask.length > 0) {
                // Polygon mask rendering
                this.renderPolygonMasks(data[j].polygonMask, context);
            } else {
                // Binary mask rendering
                if (
                    this.props.currentFileFormat !==
                    constants.SETTINGS.ANNOTATIONS.COCO
                )
                    Utils.renderBinaryMasks(data[j].binaryMask, context);
            }*/

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
            context.fillStyle = constants.detectionStyle.LABEL_TEXT_COLOR;
            context.fillText(
                annotations[j].categoryName,
                annotations[j].bbox[0] + constants.detectionStyle.LABEL_PADDING,
                annotations[j].bbox[1] - constants.detectionStyle.LABEL_PADDING
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
                    {/*TODO: remove this button*/}
                    <button
                        style={{
                            position: 'absolute',
                            bottom: '25px',
                            right: '25px',
                            padding: '1rem',
                        }}
                        onClick={displayImage}>
                        NEXT IMAGE
                    </button>
                </>
            )}
        </ImageViewport>
    );
};

export default ImageDisplayComponent;
