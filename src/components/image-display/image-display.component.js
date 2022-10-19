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
import { useSelector } from 'react-redux';
import { getAssetsDirPaths } from '../../redux/slices/settings/settings.slice';

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
    const { selectedImagesDirPath } = useSelector(getAssetsDirPaths);
    const viewportRef = useRef(null);
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
        displayImage().catch(console.log);
    }, [selectedImagesDirPath]);

    const getNextFile = async () => {
        try {
            return ipcRenderer.invoke(Channels.getNextFile);
        } catch (e) {
            console.log(e);
        }
    };

    const displayImage = async () => {
        try {
            const pixelData = await getNextFile();
            const imageIdTop = 'coco:0';
            Utils.loadImage(imageIdTop, pixelData).then((image) => {
                const viewport = cornerstone.getDefaultViewportForImage(
                    viewportRef.current,
                    image
                );
                viewport.translation.y = constants.viewportStyle.ORIGIN;
                viewport.scale = 1.2;
                const displayedArea = cornerstone.getDisplayedArea(
                    image,
                    viewportRef.current
                );
                // eslint-disable-next-line react/no-direct-mutation-state
                // if (displayedArea !== undefined)
                // self.state.imageData[0].dimensions = displayedArea.brhc;
                setViewport(viewport);
                cornerstone.displayImage(viewportRef.current, image, viewport);
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
