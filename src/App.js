import './App.css';
import React, { Component } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'eac-cornerstone-tools';
import dicomParser from 'dicom-parser';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader';
import ORA from './utils/ORA.js';
import Utils from './utils/Utils.js';
import Dicos from './utils/Dicos.js';
import TapDetector from './utils/TapDetector';
import SideMenu from './components/SideMenu/SideMenu';
import NextButton from './components/SideMenu/NextButton';
import SaveButton from './components/SideMenu/SaveButton';
import TopBar from './components/TopBar/TopBar';
import JSZip from 'jszip';
import NoFileSign from './components/NoFileSign';
import * as constants from './utils/Constants';
import BoundingBoxDrawingTool from './cornerstone-tools/BoundingBoxDrawingTool';
import DetectionMovementTool from './cornerstone-tools/DetectionMovementTool';
import PolygonDrawingTool from './cornerstone-tools/PolygonDrawingTool';
import BoundPolyFAB from './components/FAB/BoundPolyFAB';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import socketIOClient from 'socket.io-client';
import {
    setConnected,
    setCurrentProcessingFile,
    setDownload,
    setNumFilesInQueue,
    setProcessingHost,
    setUpload,
} from './redux/slices/server/serverSlice';
import {
    addDetection,
    clearAllSelection,
    deleteDetection,
    editDetectionLabel,
    getSideDetections,
    getTopDetections,
    hasDetectionCoordinatesChanged,
    resetDetections,
    selectDetection,
    selectDetectionSet,
    updateDetection,
    updateDetectionSetVisibility,
    updateDetectionVisibility,
    updateMissMatchedClassName,
    validateDetections,
} from './redux/slices/detections/detectionsSlice';
import {
    colorPickerToggle,
    deleteDetectionUpdate,
    detectionSelectedUpdate,
    emptyAreaClickUpdate,
    exitEditionModeUpdate,
    hideContextMenuUpdate,
    labelSelectedUpdate,
    newFileReceivedUpdate,
    onDragEndWidgetUpdate,
    onLabelEditionEnd,
    onMouseLeaveNoFilesUpdate,
    resetSelectedDetectionBoxesElseUpdate,
    resetSelectedDetectionBoxesUpdate,
    selectConfigInfoUpdate,
    setCollapsedSideMenu,
    setCurrentFileFormat,
    setInputLabel,
    setLocalFileOpen,
    setReceiveTime,
    toggleCollapsedSideMenu,
    updateCornerstoneMode,
    updateDetectionContextPosition,
    updateEditionMode,
    updateEditLabelPosition,
    updateFABVisibility,
    updateIsDetectionContextVisible,
    updateRecentScroll,
    updateZoomLevels,
    updateZoomLevelSide,
    updateZoomLevelTop,
} from './redux/slices/ui/uiSlice';
import DetectionContextMenu from './components/DetectionContext/DetectionContextMenu';
import EditLabel from './components/EditLabel';
import { buildCocoDataZip } from './utils/Coco';
import { fileOpen, fileSave } from 'browser-fs-access';
import ColorPicker from './components/Color/ColorPicker';
import MetaData from './components/Snackbars/MetaData';
import isElectron from 'is-electron';
import LazyImageMenu from './components/LazyImage/LazyImageMenu';
import SettingsModal from './components/SettingsModal/SettingsModal';
import {
    loadElectronCookie,
    saveSettings,
} from './redux/slices/settings/settingsSlice';

let ipcRenderer;
if (isElectron()) {
    const electron = window.require('electron');
    ipcRenderer = electron.ipcRenderer;
}
const cloneDeep = require('lodash.clonedeep');
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
let fetchingFromLocalDirectory = false;
let connectingToCommandServer = false;
//TODO: re-add PropTypes and prop validation
/* eslint-disable react/prop-types */

class App extends Component {
    /**
     * All the related elements of the class are initialized: the callback methods are bound to the class,
     * the state is initialized, a click listener is bound to the image viewport in order to detect click events,
     * a cornerstoneImageRendered listener is bound to the image viewport to trigger some actions in response to the
     * image rendering, and CornerstoneJS Tools are initialized
     *
     * @contructor
     * @param {Object} props
     */
    constructor(props) {
        super(props);
        this.state = {
            configurationInfo: {},
            myOra: new ORA(),
            imageViewportTop: document.getElementById('dicomImageLeft'),
            imageViewportSide: document.getElementById('dicomImageRight'),
            viewport: cornerstone.getDefaultViewport(null, undefined),
            mousePosition: { x: 0, y: 0 },
            activeViewport: 'dicomImageLeft',
            tapDetector: new TapDetector(),
            commandServer: null,
            timer: null,
            thumbnails: null,
        };
        this.getFileFromLocal = this.getFileFromLocal.bind(this);
        this.localDirectoryChangeHandler =
            this.localDirectoryChangeHandler.bind(this);
        this.getFileFromLocalDirectory =
            this.getFileFromLocalDirectory.bind(this);
        this.getSpecificFileFromLocalDirectory =
            this.getSpecificFileFromLocalDirectory.bind(this);
        this.monitorConnectionEvent = this.monitorConnectionEvent.bind(this);
        this.connectToCommandServer = this.connectToCommandServer.bind(this);
        this.sendImageToCommandServer =
            this.sendImageToCommandServer.bind(this);
        this.sendImageToLocalDirectory =
            this.sendImageToLocalDirectory.bind(this);
        this.nextImageClick = this.nextImageClick.bind(this);
        this.onImageRendered = this.onImageRendered.bind(this);
        this.loadAndViewImage = this.loadAndViewImage.bind(this);
        this.loadDICOSdata = this.loadDICOSdata.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onMouseClicked = this.onMouseClicked.bind(this);
        this.onMouseMoved = this.onMouseMoved.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.resetSelectedDetectionBoxes =
            this.resetSelectedDetectionBoxes.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.appUpdateImage = this.appUpdateImage.bind(this);
        this.resizeListener = this.resizeListener.bind(this);
        this.recalculateZoomLevel = this.recalculateZoomLevel.bind(this);
        this.onBoundingBoxSelected = this.onBoundingBoxSelected.bind(this);
        this.onPolygonMaskSelected = this.onPolygonMaskSelected.bind(this);
        this.resetCornerstoneTool = this.resetCornerstoneTool.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onNewPolygonMaskCreated = this.onNewPolygonMaskCreated.bind(this);
        this.renderDetectionContextMenu =
            this.renderDetectionContextMenu.bind(this);
        this.getContextMenuPos = this.getContextMenuPos.bind(this);
        this.getEditLabelWidgetPos = this.getEditLabelWidgetPos.bind(this);
        this.selectEditionMode = this.selectEditionMode.bind(this);
        this.editDetectionLabel = this.editDetectionLabel.bind(this);
        this.deleteDetection = this.deleteDetection.bind(this);
        this.startListeningClickEvents =
            this.startListeningClickEvents.bind(this);
        this.stopListeningClickEvents =
            this.stopListeningClickEvents.bind(this);
    }

    /**
     * Houses the code to connect to a server and starts listening for connection events. Lastly it
     * is what trigger to ask for a file from the command server.
     *
     * @param {boolean} update - Optional variable for when the settings changes the command server
     */
    connectToCommandServer(update = false) {
        this.props.setProcessingHost(
            `http://${this.props.remoteIp}:${this.props.remotePort}`
        );
        if (!connectingToCommandServer) {
            connectingToCommandServer = true;
            this.setState(
                {
                    commandServer: socketIOClient(
                        `http://${this.props.remoteIp}:${this.props.remotePort}`,
                        { autoConnect: this.props.autoConnect }
                    ),
                },
                () => {
                    connectingToCommandServer = false;
                    this.state.commandServer.connect();
                    this.monitorConnectionEvent();
                    this.getFileFromCommandServer(update);
                }
            );
        }
    }

    /**
     * Gets called by an update (in changes to props or state). It is called before render(),
     * returning false means we can skip the update. Where returning true means we need to update the render().
     * Namely, this is an edge case for if a user is connected to a server, then decides to use the
     * local mode option, this handles the disconnect.
     *
     * @param {Object} nextProps
     * @param {Object} nextState
     * @returns {boolean} - True, to update. False, to skip the update
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.displaySummarizedDetections &&
            !this.props.collapsedSideMenu &&
            nextProps.currentProcessingFile !== null &&
            this.props.currentProcessingFile === null
        ) {
            if (
                isElectron() &&
                nextProps.remoteOrLocal &&
                nextProps.localFileOutput !== ''
            ) {
                this.props.setCollapsedSideMenu({
                    cornerstone: cornerstone,
                    desktopMode: true,
                    collapsedSideMenu: true,
                });
            } else {
                this.props.setCollapsedSideMenu({
                    cornerstone: cornerstone,
                    desktopMode: false,
                    collapsedSideMenu: true,
                });
            }
            return true;
        }
        if (this.state.thumbnails !== nextState.thumbnails) return true;
        if (
            this.state.commandServer === null &&
            nextProps.remoteOrLocal === true &&
            !nextProps.loadingElectronCookie
        ) {
            this.connectToCommandServer();
            if (
                this.props.loadingElectronCookie !==
                nextProps.loadingElectronCookie
            ) {
                return true;
            } else {
                return false;
            }
        }
        if (
            isElectron() &&
            nextProps.localFileOutput !== '' &&
            !nextProps.loadingElectronCookie &&
            this.props.currentProcessingFile === null &&
            nextProps.currentProcessingFile === null &&
            !fetchingFromLocalDirectory &&
            !nextProps.remoteOrLocal
        ) {
            fetchingFromLocalDirectory = true;
            this.getFileFromLocalDirectory();
            return false;
        }
        if (this.props.firstDisplaySettings !== nextProps.firstDisplaySettings)
            return true;
        if (this.props.fileSuffix !== nextProps.fileSuffix) return true;
        if (this.props.localFileOutput !== nextProps.localFileOutput)
            return true;
        if (this.props.remoteOrLocal !== nextProps.remoteOrLocal) return true;
        if (
            this.props.loadingElectronCookie !== nextProps.loadingElectronCookie
        ) {
            return true;
        }
        if (
            this.props.selectedDetection &&
            this.props.collapsedSideMenu !== nextProps.collapsedSideMenu &&
            !nextProps.displaySummarizedDetections
        ) {
            setTimeout(() => {
                this.renderDetectionContextMenu(
                    Utils.mockCornerstoneEvent(
                        {},
                        this.props.selectedDetection.view ===
                            constants.viewport.TOP
                            ? this.state.imageViewportTop
                            : this.state.imageViewportSide
                    ),
                    this.props.selectedDetection
                );
            }, 0);
            return true;
        }
        return false;
    }

    /**
     * Invoked after all elements on the page are rendered properly.
     */
    componentDidMount() {
        if (isElectron()) {
            this.props.loadElectronCookie();
        }
        // Connect socket servers
        if (
            this.props.firstDisplaySettings === false ||
            this.props.loadingElectronCookie
        ) {
            if (isElectron()) {
                this.localDirectoryChangeHandler();
            }
            if (!this.props.loadingElectronCookie) {
                if (this.props.remoteOrLocal === true) {
                    this.connectToCommandServer();
                } else if (isElectron() && this.props.localFileOutput !== '') {
                    this.getFileFromLocalDirectory();
                }
            }
        }
        this.state.imageViewportTop.addEventListener(
            'cornerstoneimagerendered',
            this.onImageRendered
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchdragend',
            (event) => {
                this.onDragEnd(event, this.state.imageViewportTop);
            }
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolsmousedrag',
            this.hideContextMenu
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchdrag',
            this.hideContextMenu
        );
        this.state.imageViewportTop.addEventListener('mouseup', (event) => {
            const newEvent = Utils.mockCornerstoneEvent(
                event,
                this.state.imageViewportTop
            );
            this.onDragEnd(newEvent, this.state.imageViewportTop);
        });

        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolsmousewheel',
            this.resetSelectedDetectionBoxes
        );

        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolsmousewheel',
            this.onMouseWheel
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchpinch',
            this.hideContextMenu
        );
        this.state.imageViewportTop.addEventListener(
            constants.events.POLYGON_MASK_CREATED,
            (event) => {
                this.onNewPolygonMaskCreated(
                    event,
                    this.state.imageViewportTop
                );
            }
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstoneimagerendered',
            this.onImageRendered
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolstouchdragend',
            (event) => {
                this.onDragEnd(event, this.state.imageViewportSide);
            }
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolsmousedrag',
            this.hideContextMenu
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolstouchdrag',
            this.hideContextMenu
        );
        this.state.imageViewportSide.addEventListener('mouseup', (event) => {
            const newEvent = Utils.mockCornerstoneEvent(
                event,
                this.state.imageViewportSide
            );
            this.onDragEnd(newEvent, this.state.imageViewportSide);
        });
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolsmousewheel',
            this.resetSelectedDetectionBoxes
        );

        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolsmousewheel',
            this.onMouseWheel
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolstouchpinch',
            this.hideContextMenu
        );
        this.state.imageViewportSide.addEventListener(
            constants.events.POLYGON_MASK_CREATED,
            (event) => {
                this.onNewPolygonMaskCreated(
                    event,
                    this.state.imageViewportSide
                );
            }
        );
        this.startListeningClickEvents();
        window.addEventListener('resize', this.resizeListener);

        this.props.updateFABVisibility(this.props.numberOfFilesInQueue > 0);
        this.setupCornerstoneJS(
            this.state.imageViewportTop,
            this.state.imageViewportSide
        );
        document.body.addEventListener('mousemove', this.onMouseMoved);
        document.body.addEventListener('mouseleave', this.onMouseLeave);
    }

    /**
     *  Stops listening input events right before the component is unmounted and destroyed
     */
    componentWillUnmount() {
        this.state.imageViewportTop.removeEventListener(
            'cornerstoneimagerendered',
            this.onImageRendered
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolsmousedrag',
            this.resetSelectedDetectionBoxes
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolsmousewheel',
            this.resetSelectedDetectionBoxes
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolsmousewheel',
            this.onMouseWheel
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolstouchpinch',
            this.hideContextMenu
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstoneimagerendered',
            this.onImageRendered
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolsmousedrag',
            this.resetSelectedDetectionBoxes
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolsmousewheel',
            this.resetSelectedDetectionBoxes
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolsmousewheel',
            this.onMouseWheel
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolstouchpinch',
            this.hideContextMenu
        );
        if (this.state.commandServer !== null)
            this.state.commandServer.disconnect();
        this.props.setConnected(false);
        this.stopListeningClickEvents();
        window.removeEventListener('resize', this.resizeListener);
        document.body.removeEventListener('mousemove', this.onMouseMoved);
        document.body.removeEventListener('mouseleave', this.onMouseLeave);
    }

    /**
     * Houses the events for connectivity with the command server.
     */
    async monitorConnectionEvent() {
        if (this.state.commandServer !== null) {
            this.state.commandServer.on('disconnect', () => {
                this.props.setConnected(false);
            });
            this.state.commandServer.on('connect', () => {
                this.props.setConnected(true);
            });
            try {
                this.state.commandServer.on('connect_error', (err) => {
                    if (
                        err.message === 'xhr poll error' ||
                        err.message === 'server error'
                    ) {
                        this.props.setConnected(false);
                        this.state.commandServer.disconnect();
                    }
                });
            } catch (error) {
                this.props.setConnected(false);
                this.state.commandServer.disconnect();
            }
        }
    }

    /**
     * Binds a click event listener to the two cornerstonejs viewports
     */
    startListeningClickEvents() {
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchstart',
            this.onTouchStart
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchend',
            this.onTouchEnd
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolstouchstart',
            this.onTouchStart
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolstouchend',
            this.onTouchEnd
        );
    }

    /**
     * Unbinds a click event listener to the two cornerstonejs viewports
     */
    stopListeningClickEvents() {
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolstouchstart',
            this.onTouchStart
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolstouchend',
            this.onTouchEnd
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolstouchstart',
            this.onTouchStart
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolstouchend',
            this.onTouchEnd
        );
    }

    /**
     * Updates the cornerstoneJS viewports' zoom level according to their width
     */
    recalculateZoomLevel() {
        let canvasElements =
            document.getElementsByClassName('cornerstone-canvas');
        let multipleViewports = canvasElements.length > 1;
        const newZoomLevelTop = Utils.calculateZoomLevel(
            canvasElements[0].style.width
        );
        const newZoomLevelSide = multipleViewports
            ? Utils.calculateZoomLevel(canvasElements[1].style.width)
            : 0;
        const updateImageViewportTop = this.state.imageViewportTop;
        const updateImageViewportSide = this.state.imageViewportSide;
        updateImageViewportTop.scale = newZoomLevelTop;
        updateImageViewportSide.scale = newZoomLevelSide;
        this.props.updateZoomLevels({
            zoomLevelTop: newZoomLevelTop,
            zoomLevelSide: newZoomLevelSide,
        });
        cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
            zoomLevelTop: newZoomLevelTop,
            zoomLevelSide: newZoomLevelSide,
        });
        cornerstoneTools.setToolOptions('DetectionMovementTool', {
            zoomLevelTop: newZoomLevelTop,
            zoomLevelSide: newZoomLevelSide,
        });
    }

    /**
     * Function event listener for the window resize event. If a detection is selected, we clear the detections
     * and hide the buttons.
     *
     * @param {Event} e
     */
    // eslint-disable-next-line no-unused-vars
    resizeListener(e) {
        if (
            isElectron() &&
            !this.props.remoteOrLocal &&
            this.props.localFileOutput !== ''
        ) {
            Utils.calculateViewportDimensions(
                cornerstone,
                this.props.singleViewport,
                this.props.collapsedSideMenu,
                this.props.collapsedLazyMenu,
                true
            );
        } else {
            Utils.calculateViewportDimensions(
                cornerstone,
                this.props.singleViewport,
                this.props.collapsedSideMenu
            );
        }

        if (this.props.selectDetection) {
            this.appUpdateImage();
            if (this.props.deviceType === constants.DEVICE_TYPE.DESKTOP) {
                this.props.clearAllSelection();
            } else {
                // For when a resize event occurs and the device type is tablet or mobile
                if (this.props.editionMode === constants.editionMode.LABEL) {
                    // Re-calculating edit label position for when on a tablet a user edits a label
                    // the on-screen keyboard will cause a re-size event and thus the edit label needs to be re-calculated
                    const editLabelWidgetPosInfo = this.getEditLabelWidgetPos(
                        this.props.selectedDetection
                    );
                    const widgetPosition = {
                        top: editLabelWidgetPosInfo.y,
                        left: editLabelWidgetPosInfo.x,
                    };
                    if (
                        this.props.deviceType === constants.DEVICE_TYPE.TABLET
                    ) {
                        widgetPosition.top -=
                            this.props.selectedDetection.view ===
                            constants.viewport.TOP
                                ? this.props.zoomLevelTop / 5
                                : this.props.zoomLevelSide / 5;
                        if (
                            this.props.selectedDetection.view ===
                            constants.viewport.SIDE
                        ) {
                            widgetPosition.left += 150;
                        }
                    }
                    this.props.updateEditLabelPosition({
                        detectionLabelEditWidth:
                            editLabelWidgetPosInfo.boundingWidth,
                        detectionLabelEditPosition: widgetPosition,
                    });
                }
            }
        }
    }

    /**
     * CornerstoneJS Tools are initialized
     *
     * @param {DOMElement} imageViewportTop - DOM element where the top-view x-ray image is rendered
     * @param {DOMElement} imageViewportSide - DOM element where the side-view x-ray image is rendered
     */
    setupCornerstoneJS(imageViewportTop, imageViewportSide) {
        cornerstone.enable(imageViewportTop);
        cornerstone.enable(imageViewportSide);
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
        cornerstoneTools.addTool(DetectionMovementTool);
        cornerstoneTools.addTool(PolygonDrawingTool);
        if (
            this.props.cornerstoneMode === constants.cornerstoneMode.ANNOTATION
        ) {
            if (this.props.editionMode === constants.editionMode.BOUNDING) {
                cornerstoneTools.setToolActive('BoundingBoxDrawing', {
                    mouseButtonMask: 1,
                });
            } else if (
                this.props.editionMode === constants.editionMode.POLYGON
            ) {
                cornerstoneTools.setToolActive('PolygonDrawingTool', {
                    mouseButtonMask: 1,
                });
            } else if (this.props.editionMode === constants.editionMode.MOVE) {
                cornerstoneTools.setToolActive('DetectionMovementTool', {
                    mouseButtonMask: 1,
                });
            }
        }
    }

    /**
     * Resets Cornerstone Tools to their default state. Invoked when user leaves annotation or edition mode
     */

    resetCornerstoneTool() {
        cornerstoneTools.clearToolState(
            this.state.imageViewportTop,
            'BoundingBoxDrawing'
        );
        cornerstoneTools.clearToolState(
            this.state.imageViewportTop,
            'DetectionMovementTool'
        );
        cornerstoneTools.clearToolState(
            this.state.imageViewportTop,
            'PolygonDrawingTool'
        );
        if (this.props.singleViewport !== true) {
            cornerstoneTools.clearToolState(
                this.state.imageViewportSide,
                'BoundingBoxDrawing'
            );
            cornerstoneTools.clearToolState(
                this.state.imageViewportSide,
                'DetectionMovementTool'
            );
            cornerstoneTools.clearToolState(
                this.state.imageViewportSide,
                'PolygonDrawingTool'
            );
        }
        cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
            cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
            temporaryLabel: undefined,
        });
        cornerstoneTools.setToolOptions('DetectionMovementTool', {
            cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
            temporaryLabel: undefined,
        });
        cornerstoneTools.setToolOptions('PolygonDrawingTool', {
            cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
            updatingDetection: false,
        });
        cornerstoneTools.setToolDisabled('BoundingBoxDrawing');
        cornerstoneTools.setToolDisabled('DetectionMovementTool');
        cornerstoneTools.setToolDisabled('PolygonDrawingTool');
        cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
        cornerstoneTools.setToolActive('ZoomMouseWheel', {});
        cornerstoneTools.setToolActive('ZoomTouchPinch', {});
    }

    /**
     * Gets files from command server and loads them once received.
     *
     * @param {boolean} update
     * @returns {Promise}
     */
    async getFileFromCommandServer(update = false) {
        if (
            (this.props.currentProcessingFile === null &&
                this.state.commandServer !== null) ||
            update === true
        ) {
            this.state.commandServer.emit('currentFile', (response) => {
                if (response.status === 'Ok') {
                    this.loadNextImage(
                        response.file,
                        response.fileName,
                        response.numberOfFiles
                    );
                } else {
                    this.onNoImageLeft();
                }
            });
        }
    }

    /**
     * Function called from the TopBar Icon OpenFile. Uses the browser-fs-access library to load a file as a blob. That
     * blob then needs to be converted to base64 to be loaded into the app.
     */
    getFileFromLocal() {
        fileOpen()
            .then((blob) => {
                Utils.blobToBase64(blob).then((b64) => {
                    this.props.setLocalFileOpen(true);
                    this.loadNextImage(b64, blob.name);
                });
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    this.props.setLocalFileOpen(false);
                    console.log(error);
                }
            });
    }

    /**
     * Calls the Electron channel to invoke the next file from the selected file system folder.
     */
    getFileFromLocalDirectory() {
        if (isElectron()) {
            ipcRenderer
                .invoke(
                    constants.Channels.getNextFile,
                    this.props.localFileOutput
                )
                .then((result) => {
                    fetchingFromLocalDirectory = false;
                    this.props.setLocalFileOpen(true);
                    this.loadNextImage(
                        result.file,
                        result.fileName,
                        result.numberOfFiles,
                        result.thumbnails
                    );
                })
                .catch((error) => {
                    fetchingFromLocalDirectory = false;
                    if (
                        error.toString() ===
                        "Error: Error invoking remote method 'get-next-file': End of queue"
                    ) {
                        console.log('end of queue');
                    } else {
                        this.props.setLocalFileOpen(false);
                        this.props.setReceiveTime(null);
                        this.onNoImageLeft();
                    }
                });
        }
    }

    /**
     * Handles changes from a local directory if working with a local workspace
     */
    localDirectoryChangeHandler() {
        // handle a request to update the thumbnails state when the user modifies
        // the dir content in the file system
        if (isElectron()) {
            ipcRenderer.on(constants.Channels.updateFiles, (event, data) => {
                setTimeout(() => {
                    this.setState({ thumbnails: data.thumbnails });
                    this.props.setNumFilesInQueue(data.numberOfFiles);
                }, 450);
            });

            ipcRenderer.on(
                constants.Channels.updateCurrentFile,
                (event, data) => {
                    // no files left
                    if (!data) {
                        this.props.setLocalFileOpen(false);
                        this.props.setReceiveTime(null);
                        this.onNoImageLeft();
                        return;
                    }
                    this.resetSelectedDetectionBoxes();
                    this.props.resetDetections();
                    // load the next image
                    this.props.setLocalFileOpen(true);
                    this.loadNextImage(
                        data.file,
                        data.fileName,
                        data.numberOfFiles,
                        data.thumbnails
                    );
                }
            );
        }
    }

    /**
     * Operates in a similar way to getFileFromLocalDirectory, but it specifies the exact file path instead of a general path.
     * IE D:\images\1_img.ora.
     *
     * @param {string} filePath - String value of specific file path
     */
    getSpecificFileFromLocalDirectory(filePath) {
        if (isElectron()) {
            ipcRenderer
                .invoke(constants.Channels.getSpecificFile, filePath)
                .then((result) => {
                    this.props.setLocalFileOpen(true);
                    this.loadNextImage(
                        result.file,
                        result.fileName,
                        result.numberOfFiles,
                        result.thumbnails
                    );
                })
                .catch((error) => {
                    this.props.setLocalFileOpen(false);
                    this.props.setReceiveTime(null);
                    this.onNoImageLeft();
                });
        }
    }

    /**
     * Emits a new message to send a file to the server
     *
     * @param {Blob} file - File sent to the server
     */
    async sendImageToCommandServer(file) {
        this.props.setUpload(true);
        this.state.commandServer.emit('fileFromClient', {
            file,
            fileFormat: this.props.fileFormat,
            fileSuffix: this.props.fileSuffix,
        });
    }

    /**
     * Sends the needed information to save the current file in the selected this.props.localFileOutput path via
     * Electron channels.
     *
     * @param {Buffer} file
     * @returns {Promise}
     */
    async sendImageToLocalDirectory(file) {
        return new Promise((resolve, reject) => {
            if (isElectron() && this.props.localFileOutput !== '') {
                ipcRenderer
                    .invoke(constants.Channels.saveCurrentFile, {
                        file,
                        fileDirectory: this.props.localFileOutput,
                        fileFormat: this.props.fileFormat,
                        fileName: this.props.currentProcessingFile,
                        fileSuffix: this.props.fileSuffix,
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    /**
     *  Method invoked when there isn't any file in the file queue. A 'No file' image is displayed instead of the
     *  cornerstoneJs canvas
     */
    onNoImageLeft() {
        let updateImageViewport = this.state.imageViewportTop;
        let updateImageViewportSide = this.state.imageViewportSide;
        updateImageViewport.style.visibility = 'hidden';
        updateImageViewportSide.style.visibility = 'hidden';
        const verticalDivider = document.getElementById('verticalDivider');
        verticalDivider.classList.add('dividerHidden');
        verticalDivider.classList.remove('dividerVisible');
        this.props.setNumFilesInQueue(0);
        this.props.updateFABVisibility(false);
        this.setState({
            imageViewportTop: updateImageViewport,
            imageViewportSide: updateImageViewportSide,
        });
    }

    /**
     * Takes new XML file (image) and does all parsing/pre-processing for detections/images to be loaded.
     * @param {Base64} image - Base-64 encoded string containing all data for annotations/images (Supported file formats: DICOS-TDR, MS COCO)
     * @param {string} fileName - Name of current file being processed. Used to prevent duplicate annotations.
     * @param {number} [numberOfFiles = 0] - Number of files left in queue
     * @param {Array<string>} [thumbnails = null] - Array with string values to the file path of thumbnails,
     * IE:
     * ['D:\images\.thumbnails\1_img.ora_thumbnail.png',
     * 'D:\images\.thumbnails\2_img.ora_thumbnail.png',
     * 'D:\images\.thumbnails\3_img.ora_thumbnail.png']
     */
    loadNextImage(image, fileName, numberOfFiles = 0, thumbnails = null) {
        // Loading a file initially from a local workspace can call loadNextImage twice
        // Which creates duplicate detections. This ensures that the same file is never loaded twice
        if (fileName === this.props.currentProcessingFile) return;
        this.props.setCurrentProcessingFile(fileName);
        const myZip = new JSZip();
        let listOfPromises = [];
        // This is our list of stacks we will append to the myOra object in our promise all
        let listOfStacks = [];

        let contentType;
        // Lets load the compressed ORA file as base64
        myZip.loadAsync(image, { base64: true }).then(() => {
            //First, after loading, we need to check our stack.xml
            myZip
                .file('stack.xml')
                .async('string')
                .then(async (stackFile) => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(
                        stackFile,
                        'text/xml'
                    );
                    const xmlStack = xmlDoc.getElementsByTagName('stack');
                    const xmlImage = xmlDoc.getElementsByTagName('image');
                    const xmlLayer = xmlDoc.getElementsByTagName('layer');

                    const tempFile = xmlLayer[0].getAttribute('src');
                    var fileExtension = tempFile.split('.').pop();

                    const currentFileFormat =
                        xmlImage[0].getAttribute('format');

                    if (
                        currentFileFormat ===
                        constants.SETTINGS.ANNOTATIONS.COCO
                    ) {
                        this.props.setCurrentFileFormat(
                            constants.SETTINGS.ANNOTATIONS.COCO
                        );

                        // We loop through each stack. Creating a new stack object to store our info
                        // for now, we are just grabbing the location of the dicos file in the ora file
                        for (let stackData of xmlStack) {
                            let currentStack = {
                                name: stackData.getAttribute('name'),
                                view: stackData.getAttribute('view'),
                                rawData: [],
                                formattedData: [],
                                blobData: [],
                                arrayBuf: null,
                            };
                            let layerData =
                                stackData.getElementsByTagName('layer');
                            for (let imageSrc of layerData) {
                                currentStack.rawData.push(
                                    imageSrc.getAttribute('src')
                                );
                            }
                            // We have finished creating the current stack's object
                            // add it onto our holder variable for now
                            listOfStacks.push(currentStack);
                        }
                        // Now we loop through the data we have collected
                        // We know the first layer of each stack is pixel data, which we need as an array buffer
                        // Which we got from i===0.
                        for (let j = 0; j < listOfStacks.length; j++) {
                            for (
                                let i = 0;
                                i < listOfStacks[j].rawData.length;
                                i++
                            ) {
                                await myZip
                                    .file(listOfStacks[j].rawData[i])
                                    .async('base64')
                                    .then((imageData) => {
                                        i === 0
                                            ? (contentType = 'image/png')
                                            : (contentType =
                                                  'application/json');
                                        listOfStacks[j].blobData.push({
                                            blob: Utils.b64toBlob(
                                                imageData,
                                                contentType
                                            ),
                                            uuid: uuidv4(),
                                        });
                                    });
                                if (i === 0) {
                                    await myZip
                                        .file(listOfStacks[j].rawData[i])
                                        .async('base64')
                                        .then((imageData) => {
                                            listOfStacks[j].arrayBuf =
                                                Utils.base64ToArrayBuffer(
                                                    imageData
                                                );
                                        });
                                } else {
                                    await myZip
                                        .file(listOfStacks[j].rawData[i])
                                        .async('string')
                                        .then((jsonData) => {
                                            const data = JSON.parse(jsonData);
                                            var combinedData = {};
                                            combinedData = {
                                                algorithm:
                                                    data['info']['algorithm'],
                                                ...data['annotations'][0],
                                            };
                                            listOfStacks[j].formattedData.push(
                                                combinedData
                                            );
                                        });
                                }
                            }
                        }
                        const promiseOfList = Promise.all(listOfPromises);
                        // Once we have all the layers...
                        promiseOfList.then(() => {
                            const updateImageViewportTop =
                                this.state.imageViewportTop;
                            updateImageViewportTop.style.visibility = 'visible';
                            this.setState({
                                imageViewportTop: updateImageViewportTop,
                                thumbnails,
                            });
                            this.state.myOra.stackData = listOfStacks;
                            this.props.newFileReceivedUpdate({
                                singleViewport: listOfStacks.length < 2,
                                receiveTime: Date.now(),
                            });
                            this.props.setNumFilesInQueue(numberOfFiles);
                            Utils.changeViewport(this.props.singleViewport);
                            this.props.resetDetections();
                            this.loadAndViewImage();
                        });
                    } else if (
                        currentFileFormat ===
                            constants.SETTINGS.ANNOTATIONS.TDR ||
                        fileExtension === 'dcs'
                    ) {
                        this.props.setCurrentFileFormat(
                            constants.SETTINGS.ANNOTATIONS.TDR
                        );
                        // We loop through each stack. Creating a new stack object to store our info
                        // for now, we are just grabbing the location of the dicos file in the ora file
                        for (let stackData of xmlStack) {
                            let currentStack = {
                                name: stackData.getAttribute('name'),
                                view: stackData.getAttribute('view'),
                                rawData: [],
                                blobData: [],
                                pixelData: null,
                            };
                            let layerData =
                                stackData.getElementsByTagName('layer');
                            for (let imageSrc of layerData) {
                                currentStack.rawData.push(
                                    imageSrc.getAttribute('src')
                                );
                            }
                            // We have finished creating the current stack's object
                            // add it onto our holder variable for now
                            listOfStacks.push(currentStack);
                        }
                        // Now we loop through the data we have collected
                        // We know the first layer of each stack is pixel data, which we need as an array buffer
                        // Which we got from i===0.
                        // No matter what however, every layer gets converted a blob and added to the data set
                        for (let j = 0; j < listOfStacks.length; j++) {
                            for (
                                let i = 0;
                                i < listOfStacks[j].rawData.length;
                                i++
                            ) {
                                await myZip
                                    .file(listOfStacks[j].rawData[i])
                                    .async('base64')
                                    .then((imageData) => {
                                        if (i === 0)
                                            listOfStacks[j].pixelData =
                                                Utils.base64ToArrayBuffer(
                                                    imageData
                                                );
                                        listOfStacks[j].blobData.push({
                                            blob: Utils.b64toBlob(imageData),
                                            uuid: uuidv4(),
                                        });
                                    });
                            }
                        }
                        const promiseOfList = Promise.all(listOfPromises);
                        // Once we have all the layers...
                        promiseOfList.then(() => {
                            const updateImageViewportTop =
                                this.state.imageViewportTop;
                            updateImageViewportTop.style.visibility = 'visible';
                            this.setState({
                                imageViewportTop: updateImageViewportTop,
                                thumbnails,
                            });
                            this.state.myOra.stackData = listOfStacks;
                            this.props.newFileReceivedUpdate({
                                singleViewport: listOfStacks.length < 2,
                                receiveTime: Date.now(),
                            });
                            this.props.setNumFilesInQueue(numberOfFiles);
                            Utils.changeViewport(this.props.singleViewport);
                            this.props.resetDetections();
                            this.loadAndViewImage();
                        });
                    } else {
                        return null;
                    }
                });
        });
    }

    /**
     * When the operator taps next, we send to the file server to remove the
     * current image, then when that is complete, we send the image to the command
     * server. Finally, calling getNextImage to display another image if there is one
     * @param {Event} e The event object being fired which caused your function to be executed
     *
     */
    nextImageClick(e) {
        this.props.validateDetections();
        if (
            this.props.annotationsFormat === constants.SETTINGS.ANNOTATIONS.COCO
        ) {
            // Convert to MS COCO
            const viewports = [this.state.imageViewportTop];
            if (this.props.singleViewport === false)
                viewports.push(this.state.imageViewportSide);
            buildCocoDataZip(
                this.state.myOra,
                this.props.detections,
                viewports,
                cornerstone,
                this.props.currentFileFormat
            ).then((cocoZip) => {
                if (this.props.remoteOrLocal === true) {
                    cocoZip
                        .generateAsync({ type: 'nodebuffer' })
                        .then((file) => {
                            this.sendImageToCommandServer(file)
                                .then(
                                    // eslint-disable-next-line no-unused-vars
                                    (res) => {
                                        this.props.setCurrentProcessingFile(
                                            null
                                        );
                                        this.props.resetDetections();
                                        this.resetSelectedDetectionBoxes(e);
                                        this.props.setUpload(false);
                                        this.getFileFromCommandServer();
                                    }
                                )
                                .catch((error) => console.log(error));
                        })
                        .catch((error) => console.log(error));
                } else {
                    if (isElectron() && this.props.localFileOutput !== '') {
                        cocoZip
                            .generateAsync({ type: 'nodebuffer' })
                            .then((file) => {
                                this.sendImageToLocalDirectory(file)
                                    .then(() => {
                                        this.setState({
                                            myOra: new ORA(),
                                        });
                                        this.props.setCurrentProcessingFile(
                                            null
                                        );
                                        this.resetSelectedDetectionBoxes(e);
                                        this.props.resetDetections();
                                        this.props.setReceiveTime(null);
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            })
                            .catch((error) => console.log(error));
                    } else if (isElectron()) {
                        cocoZip
                            .generateAsync({ type: 'nodebuffer' })
                            .then((file) => {
                                ipcRenderer
                                    .invoke(
                                        constants.Channels.saveIndFile,
                                        file
                                    )
                                    .then((result) => {
                                        this.setState({
                                            myOra: new ORA(),
                                        });
                                        this.props.setCurrentProcessingFile(
                                            null
                                        );
                                        this.resetSelectedDetectionBoxes(e);
                                        this.props.resetDetections();
                                        this.props.setLocalFileOpen(false);
                                        this.props.setReceiveTime(null);
                                        this.onNoImageLeft();
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            })
                            .catch((error) => console.log(error));
                    } else {
                        cocoZip.generateAsync({ type: 'blob' }).then((file) => {
                            fileSave(file, {
                                fileName: `1${this.props.fileSuffix}.${
                                    this.props.fileFormat ===
                                    constants.SETTINGS.OUTPUT_FORMATS.ORA
                                        ? 'ora'
                                        : 'zip'
                                }`,
                            })
                                .then(() => {
                                    this.setState({
                                        myOra: new ORA(),
                                    });

                                    this.props.setCurrentProcessingFile(null);
                                    this.resetSelectedDetectionBoxes(e);
                                    this.props.resetDetections();
                                    this.props.setReceiveTime(null);
                                    this.props.setLocalFileOpen(false);
                                    this.onNoImageLeft();
                                })
                                .catch((error) => console.log(error));
                        });
                    }
                }
            });
        } else if (
            this.props.annotationsFormat ===
            constants.SETTINGS.ANNOTATIONS.PASCAL
        ) {
            // Convert to PASCAL
        } else if (
            this.props.annotationsFormat === constants.SETTINGS.ANNOTATIONS.TDR
        ) {
            const stackXML = document.implementation.createDocument(
                '',
                '',
                null
            );
            const prolog = '<?xml version="1.0" encoding="utf-8"?>';
            const imageElem = stackXML.createElement('image');
            imageElem.setAttribute(
                'format',
                constants.SETTINGS.ANNOTATIONS.TDR
            );
            const mimeType = new Blob(['image/openraster'], {
                type: 'text/plain;charset=utf-8',
            });
            const newOra = new JSZip();
            newOra.file('mimetype', mimeType, { compression: null });
            let stackCounter = 1;
            let annotationID = 1;
            const listOfPromises = [];

            const viewports = [this.state.imageViewportTop];
            if (this.props.singleViewport === false)
                viewports.push(this.state.imageViewportSide);
            // Loop through each stack, being either top or side currently
            this.state.myOra.stackData.forEach((stack) => {
                const stackElem = stackXML.createElement('stack');
                stackElem.setAttribute(
                    'name',
                    `SOP Instance UID #${stackCounter}`
                );
                stackElem.setAttribute('view', stack.view);
                const pixelLayer = stackXML.createElement('layer');
                // We always know the first element in the stack.blob data is pixel element
                pixelLayer.setAttribute(
                    'src',
                    `data/${stack.view}_pixel_data.dcs`
                );
                if (
                    this.props.currentFileFormat ===
                    constants.SETTINGS.ANNOTATIONS.TDR
                ) {
                    newOra.file(
                        `data/${stack.view}_pixel_data.dcs`,
                        stack.blobData[0].blob
                    );
                } else if (
                    this.props.currentFileFormat ===
                    constants.SETTINGS.ANNOTATIONS.COCO
                ) {
                    const tdrPromise = Dicos.pngToDicosPixelData(
                        cornerstone,
                        stack.view === constants.viewport.TOP
                            ? viewports[0]
                            : viewports[1]
                    ).then((blob) => {
                        newOra.file(`data/${stack.view}_pixel_data.dcs`, blob);
                    });
                    listOfPromises.push(tdrPromise);
                }
                const topStackIndex = this.state.myOra.stackData.findIndex(
                    (stack) => {
                        return constants.viewport.TOP === stack.view;
                    }
                );
                const sideStackIndex = this.state.myOra.stackData.findIndex(
                    (stack) => {
                        return constants.viewport.SIDE === stack.view;
                    }
                );
                stackElem.appendChild(pixelLayer);
                if (stack.view === 'top') {
                    // Loop through each detection and only the top view of the detection
                    const topDetections = getTopDetections(
                        this.props.detections
                    );
                    for (let j = 0; j < topDetections.length; j++) {
                        let threatPromise = Dicos.detectionObjectToBlob(
                            topDetections[j],
                            this.state.myOra.stackData[topStackIndex]
                                .blobData[0].blob,
                            this.props.currentFileFormat
                        ).then((threatBlob) => {
                            newOra.file(
                                `data/top_threat_detection_${annotationID}.dcs`,
                                threatBlob
                            );
                            let newLayer = stackXML.createElement('layer');
                            newLayer.setAttribute(
                                'src',
                                `data/top_threat_detection_${annotationID}.dcs`
                            );
                            stackElem.appendChild(newLayer);
                            annotationID++;
                        });
                        listOfPromises.push(threatPromise);
                    }
                    // Loop through each detection and only the side view of the detection
                } else if (stack.view === 'side') {
                    const sideDetections = getSideDetections(
                        this.props.detections
                    );
                    for (let i = 0; i < sideDetections.length; i++) {
                        let threatPromise = Dicos.detectionObjectToBlob(
                            sideDetections[i],
                            this.state.myOra.stackData[sideStackIndex]
                                .blobData[0].blob,
                            this.props.currentFileFormat
                        ).then((threatBlob) => {
                            newOra.file(
                                `data/side_threat_detection_${annotationID}.dcs`,
                                threatBlob
                            );
                            let newLayer = stackXML.createElement('layer');
                            newLayer.setAttribute(
                                'src',
                                `data/side_threat_detection_${annotationID}.dcs`
                            );
                            stackElem.appendChild(newLayer);
                            annotationID++;
                        });
                        listOfPromises.push(threatPromise);
                    }
                }
                stackCounter++;
                imageElem.appendChild(stackElem);
            });
            const promiseOfList = Promise.all(listOfPromises);
            promiseOfList.then(() => {
                stackXML.appendChild(imageElem);

                newOra.file(
                    'stack.xml',
                    new Blob(
                        [
                            prolog +
                                new XMLSerializer().serializeToString(stackXML),
                        ],
                        { type: 'application/xml ' }
                    )
                );
                if (this.props.remoteOrLocal === true) {
                    newOra
                        .generateAsync({ type: 'nodebuffer' })
                        .then((file) => {
                            this.props.setCurrentProcessingFile(null);
                            this.setState(
                                {
                                    myOra: new ORA(),
                                },
                                () => this.props.resetDetections()
                            );
                            this.sendImageToCommandServer(file)
                                .then(
                                    // eslint-disable-next-line no-unused-vars
                                    (res) => {
                                        this.resetSelectedDetectionBoxes(e);
                                        this.props.setUpload(false);
                                        this.getFileFromCommandServer();
                                        this.props.setReceiveTime(null);
                                    }
                                )
                                .catch((error) => console.log(error));
                        })
                        .catch((error) => console.log(error));
                } else {
                    if (isElectron() && this.props.localFileOutput !== '') {
                        newOra
                            .generateAsync({ type: 'nodebuffer' })
                            .then((file) => {
                                this.sendImageToLocalDirectory(file)
                                    .then(() => {
                                        this.setState({
                                            myOra: new ORA(),
                                        });
                                        this.props.setCurrentProcessingFile(
                                            null
                                        );
                                        this.resetSelectedDetectionBoxes(e);
                                        this.props.resetDetections();
                                        this.props.setReceiveTime(null);
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            })
                            .catch((error) => console.log(error));
                    } else if (isElectron()) {
                        newOra
                            .generateAsync({ type: 'nodebuffer' })
                            .then((file) => {
                                ipcRenderer
                                    .invoke(
                                        constants.Channels.saveIndFile,
                                        file
                                    )
                                    .then((result) => {
                                        this.setState({
                                            myOra: new ORA(),
                                        });
                                        this.props.setCurrentProcessingFile(
                                            null
                                        );
                                        this.resetSelectedDetectionBoxes(e);
                                        this.props.resetDetections();
                                        this.props.setLocalFileOpen(false);
                                        this.props.setReceiveTime(null);
                                        this.onNoImageLeft();
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            })
                            .catch((error) => console.log(error));
                    } else {
                        newOra.generateAsync({ type: 'blob' }).then((file) => {
                            fileSave(file, {
                                fileName: `1${this.props.fileSuffix}.${
                                    this.props.fileFormat ===
                                    constants.SETTINGS.OUTPUT_FORMATS.ORA
                                        ? 'ora'
                                        : 'zip'
                                }`,
                            })
                                .then(() => {
                                    this.setState({
                                        myOra: new ORA(),
                                    });

                                    this.props.setCurrentProcessingFile(null);
                                    this.resetSelectedDetectionBoxes(e);
                                    this.props.resetDetections();
                                    this.props.setLocalFileOpen(false);
                                    this.props.setReceiveTime(null);
                                    this.onNoImageLeft();
                                })
                                .catch((error) => console.log(error));
                        });
                    }
                }
            });
        }
    }

    /**
     * Loads pixel data from a DICOS+TDR file using CornerstoneJS. It invokes the displayDICOSinfo method in order
     * to render the image and pull the detection-specific data.
     */
    loadAndViewImage() {
        let dataImagesLeft = [];
        let dataImagesRight = [];
        if (
            this.props.currentFileFormat === constants.SETTINGS.ANNOTATIONS.TDR
        ) {
            this.displayDICOSimage();

            // all other images do not have pixel data -- cornerstoneJS will fail and send an error
            // if pixel data is missing in the dicom/dicos file. To parse out only the data,
            // we use dicomParser instead. For each .dcs file found at an index spot > 1, load
            // the file data and call loadDICOSdata() to store the data in a DetectionSet
            if (this.state.myOra.stackData[0].blobData.length === 1) {
                dataImagesLeft[0] = this.state.myOra.stackData[0].blobData[0];
            } else {
                dataImagesLeft = this.state.myOra.stackData[0].blobData;
            }
            if (this.props.singleViewport === false) {
                if (this.state.myOra.stackData[1] !== undefined) {
                    dataImagesRight = this.state.myOra.stackData[1].blobData;
                }
            }
            this.loadDICOSdata(dataImagesLeft, dataImagesRight);
        } else if (
            this.props.currentFileFormat === constants.SETTINGS.ANNOTATIONS.COCO
        ) {
            this.displayCOCOimage();
            this.loadCOCOdata();
        }
    }

    /**
     * Renders the top and side view x-ray images when annotations are encoded as JSON files with the MS COCO format.
     */
    async displayCOCOimage() {
        // the first image has the pixel data so prepare it to be displayed using cornerstoneJS
        const self = this;

        let imageId = 'coco:0';
        Utils.loadImage(imageId, self.state.myOra.stackData[0].arrayBuf).then(
            function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportTop,
                    image
                );
                viewport.translation.y = constants.viewportStyle.ORIGIN;
                viewport.scale = self.props.zoomLevelTop;
                // eslint-disable-next-line react/no-direct-mutation-state
                if (viewport.displayedArea !== undefined)
                    self.state.myOra.stackData[0].dimensions =
                        viewport.displayedArea.brhc;
                self.setState({ viewport: viewport });
                cornerstone.displayImage(
                    self.state.imageViewportTop,
                    image,
                    viewport
                );
            }
        );
        imageId = 'coco:1';
        if (this.props.singleViewport === false) {
            const updatedImageViewportSide = this.state.imageViewportSide;
            updatedImageViewportSide.style.visibility = 'visible';
            this.setState({ imageViewportSide: updatedImageViewportSide });
            Utils.loadImage(
                imageId,
                self.state.myOra.stackData[1].arrayBuf
            ).then(function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportSide,
                    image
                );
                // eslint-disable-next-line react/no-direct-mutation-state
                if (viewport.displayedArea !== undefined)
                    self.state.myOra.stackData[1].dimensions =
                        viewport.displayedArea.brhc;
                viewport.translation.y = constants.viewportStyle.ORIGIN;
                viewport.scale = self.props.zoomLevelSide;
                self.setState({ viewport: viewport });
                cornerstone.displayImage(
                    self.state.imageViewportSide,
                    image,
                    viewport
                );
            });
        }
        if (
            isElectron() &&
            !this.props.remoteOrLocal &&
            this.props.localFileOutput !== ''
        ) {
            Utils.calculateViewportDimensions(
                cornerstone,
                this.props.singleViewport,
                this.props.collapsedSideMenu,
                this.props.collapsedLazyMenu,
                true
            );
        } else {
            Utils.calculateViewportDimensions(
                cornerstone,
                this.props.singleViewport,
                this.props.collapsedSideMenu
            );
        }
        this.recalculateZoomLevel();
    }

    /**
     * Renders the top and side view x-ray images when encoded in DICOS+TDR files
     */
    displayDICOSimage() {
        // the first image has the pixel data so prepare it to be displayed using cornerstoneJS
        const self = this;
        const pixelDataTop = cornerstoneWADOImageLoader.wadouri.fileManager.add(
            self.state.myOra.stackData[0].blobData[0].blob
        );

        cornerstone.loadImage(pixelDataTop).then(function (image) {
            const viewport = cornerstone.getDefaultViewportForImage(
                self.state.imageViewportTop,
                image
            );
            viewport.translation.y = constants.viewportStyle.ORIGIN;
            viewport.scale = self.props.zoomLevelTop;
            // eslint-disable-next-line react/no-direct-mutation-state
            if (viewport.displayedArea !== undefined)
                self.state.myOra.stackData[0].dimensions =
                    viewport.displayedArea.brhc;
            self.setState({ viewport: viewport });
            cornerstone.displayImage(
                self.state.imageViewportTop,
                image,
                viewport
            );
        });
        if (this.props.singleViewport === false) {
            const updatedImageViewportSide = this.state.imageViewportSide;
            updatedImageViewportSide.style.visibility = 'visible';
            this.setState({ imageViewportSide: updatedImageViewportSide });

            const pixelDataSide =
                cornerstoneWADOImageLoader.wadouri.fileManager.add(
                    self.state.myOra.stackData[1].blobData[0].blob
                );
            cornerstone.loadImage(pixelDataSide).then(function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportSide,
                    image
                );
                // eslint-disable-next-line react/no-direct-mutation-state
                if (viewport.displayedArea !== undefined)
                    self.state.myOra.stackData[1].dimensions =
                        viewport.displayedArea.brhc;
                viewport.translation.y = constants.viewportStyle.ORIGIN;
                viewport.scale = self.props.zoomLevelSide;
                self.setState({ viewport: viewport });
                cornerstone.displayImage(
                    self.state.imageViewportSide,
                    image,
                    viewport
                );
            });
        }
        if (
            isElectron() &&
            !this.props.remoteOrLocal &&
            this.props.localFileOutput !== ''
        ) {
            Utils.calculateViewportDimensions(
                cornerstone,
                this.props.singleViewport,
                this.props.collapsedSideMenu,
                this.props.collapsedLazyMenu,
                true
            );
        } else {
            Utils.calculateViewportDimensions(
                cornerstone,
                this.props.singleViewport,
                this.props.collapsedSideMenu
            );
        }
        this.recalculateZoomLevel();
    }

    /**
     * Pulls all the data regarding the threat detections from a file formatted according to the MS COCO standard.
     */
    loadCOCOdata() {
        const self = this;
        const imagesLeft = self.state.myOra.stackData[0].formattedData;

        for (let i = 0; i < imagesLeft.length; i++) {
            let polygonMask = [];
            imagesLeft[i].bbox[2] =
                imagesLeft[i].bbox[0] + imagesLeft[i].bbox[2];
            imagesLeft[i].bbox[3] =
                imagesLeft[i].bbox[1] + imagesLeft[i].bbox[3];
            let boundingBox = imagesLeft[i].bbox;
            let binaryMask = [
                [],
                [boundingBox[0], boundingBox[1]],
                [
                    boundingBox[2] - boundingBox[0],
                    boundingBox[3] - boundingBox[1],
                ],
            ];
            if (imagesLeft[i].segmentation.length > 0) {
                const polygonXY = Utils.coordArrayToPolygonData(
                    imagesLeft[i].segmentation[0]
                );
                polygonMask = Utils.polygonDataToXYArray(
                    polygonXY,
                    boundingBox
                );
                binaryMask = Utils.polygonToBinaryMask(polygonMask);
            }
            let detUuid = uuidv4();
            self.props.addDetection({
                algorithm: imagesLeft[i].algorithm,
                className: imagesLeft[i].className,
                confidence: imagesLeft[i].confidence,
                view: constants.viewport.TOP,
                boundingBox,
                binaryMask,
                polygonMask,
                uuid: detUuid,
                detectionFromFile: true,
            });
            imagesLeft[i].id = detUuid;
        }

        if (this.props.singleViewport === false) {
            const imagesRight = self.state.myOra.stackData[1].formattedData;

            for (var j = 0; j < imagesRight.length; j++) {
                let polygonMask = [];
                imagesRight[j].bbox[2] =
                    imagesRight[j].bbox[0] + imagesRight[j].bbox[2];
                imagesRight[j].bbox[3] =
                    imagesRight[j].bbox[1] + imagesRight[j].bbox[3];
                let boundingBox = imagesLeft[j].bbox;
                let binaryMask = [
                    [],
                    [boundingBox[0], boundingBox[1]],
                    [
                        boundingBox[2] - boundingBox[0],
                        boundingBox[3] - boundingBox[1],
                    ],
                ];
                if (imagesLeft[j].segmentation.length > 0) {
                    const polygonXY = Utils.coordArrayToPolygonData(
                        imagesLeft[j].segmentation[0]
                    );
                    polygonMask = Utils.polygonDataToXYArray(
                        polygonXY,
                        boundingBox
                    );
                    binaryMask = Utils.polygonToBinaryMask(polygonMask);
                }
                let detUuid = uuidv4();

                self.props.addDetection({
                    algorithm: imagesRight[j].algorithm,
                    className: imagesRight[j].className,
                    confidence: imagesRight[j].confidence,
                    view: constants.viewport.SIDE,
                    boundingBox,
                    binaryMask,
                    polygonMask,
                    uuid: detUuid,
                    detectionFromFile: true,
                });
                imagesRight[j].id = detUuid;
            }
        }
    }

    /**
     * Parses a DICOS+TDR file to pull all the data regarding threat detections
     *
     * @param {Array} imagesLeft - List of DICOS+TDR data from algorithm
     * @param {Array} imagesRight - List of DICOS+TDR data from algorithm
     */
    loadDICOSdata(imagesLeft, imagesRight) {
        const self = this;
        const reader = new FileReader();
        reader.addEventListener('loadend', function () {
            const view = new Uint8Array(reader.result);
            var image = dicomParser.parseDicom(view);
            self.props.selectConfigInfoUpdate({
                detectorType: image.string(
                    Dicos.dictionary['DetectorType'].tag
                ),
                detectorConfigType: image.string(
                    Dicos.dictionary['DetectorConfiguration'].tag
                ),
                seriesType: image.string(
                    Dicos.dictionary['SeriesDescription'].tag
                ),
                studyType: image.string(
                    Dicos.dictionary['StudyDescription'].tag
                ),
            });
        });
        reader.readAsArrayBuffer(imagesLeft[0].blob);
        for (let i = 0; i < imagesLeft.length; i++) {
            const readFile = new FileReader();
            readFile.addEventListener('loadend', function () {
                const view = new Uint8Array(readFile.result);
                var image = dicomParser.parseDicom(view);

                let threatsCount = image.uint16(
                    Dicos.dictionary['NumberOfAlarmObjects'].tag
                );
                let algorithmName = image.string(
                    Dicos.dictionary['ThreatDetectionAlgorithmandVersion'].tag
                );
                // Threat Sequence information
                const threatSequence = image.elements.x40101011;
                if (threatSequence == null) {
                    return;
                }
                if (
                    image.uint16(
                        Dicos.dictionary['NumberOfAlarmObjects'].tag
                    ) === 0 ||
                    image.uint16(
                        Dicos.dictionary['NumberOfAlarmObjects'].tag
                    ) === undefined
                ) {
                    return;
                }
                // for every threat found, create a new Detection object and store all Detection
                // objects in a DetectionSet object
                for (var j = 0; j < threatsCount; j++) {
                    const boundingBoxCoords = Dicos.retrieveBoundingBoxData(
                        threatSequence.items[j]
                    );
                    let objectClass = Dicos.retrieveObjectClass(
                        threatSequence.items[j]
                    );
                    const confidenceLevel = Utils.decimalToPercentage(
                        Dicos.retrieveConfidenceLevel(threatSequence.items[j])
                    );
                    const maskData = Dicos.retrieveMaskData(
                        threatSequence.items[j],
                        image
                    );
                    self.props.addDetection({
                        algorithm: algorithmName,
                        className: objectClass,
                        confidence: confidenceLevel,
                        view: constants.viewport.TOP,
                        boundingBox: boundingBoxCoords,
                        binaryMask: maskData,
                        polygonMask: [],
                        uuid: imagesLeft[i].uuid,
                        detectionFromFile: true,
                    });
                }
            });
            readFile.readAsArrayBuffer(imagesLeft[i].blob);
        }

        if (this.props.singleViewport === false) {
            for (var k = 0; k < imagesRight.length; k++) {
                const read = new FileReader();
                let currentRightImage = imagesRight[k];
                read.addEventListener('loadend', function () {
                    const view = new Uint8Array(read.result);
                    var image = dicomParser.parseDicom(view);

                    let threatsCount = image.uint16(
                        Dicos.dictionary['NumberOfAlarmObjects'].tag
                    );
                    let algorithmName = image.string(
                        Dicos.dictionary['ThreatDetectionAlgorithmandVersion']
                            .tag
                    );
                    // Threat Sequence information
                    const threatSequence = image.elements.x40101011;
                    if (threatSequence == null) {
                        return;
                    }
                    if (
                        image.uint16(
                            Dicos.dictionary['NumberOfAlarmObjects'].tag
                        ) === 0 ||
                        image.uint16(
                            Dicos.dictionary['NumberOfAlarmObjects'].tag
                        ) === undefined
                    ) {
                        return;
                    }
                    // for every threat found, create a new Detection object and store all Detection
                    // objects in a DetectionSet object
                    for (var m = 0; m < threatsCount; m++) {
                        const boundingBoxCoords = Dicos.retrieveBoundingBoxData(
                            threatSequence.items[m]
                        );
                        const objectClass = Dicos.retrieveObjectClass(
                            threatSequence.items[m]
                        );
                        const confidenceLevel = Utils.decimalToPercentage(
                            Dicos.retrieveConfidenceLevel(
                                threatSequence.items[m]
                            )
                        );
                        const maskData = Dicos.retrieveMaskData(
                            threatSequence.items[m],
                            image
                        );
                        self.props.addDetection({
                            algorithm: algorithmName,
                            className: objectClass,
                            confidence: confidenceLevel,
                            view: constants.viewport.SIDE,
                            boundingBox: boundingBoxCoords,
                            binaryMask: maskData,
                            polygonMask: [],
                            uuid: currentRightImage.uuid,
                            detectionFromFile: true,
                        });
                    }
                });
                read.readAsArrayBuffer(imagesRight[k].blob);
            }
        }
    }

    /**
     * Callback automatically invoked when CornerstoneJS renders a new image. It triggers the rendering of
     * the several annotations associated to the image
     *
     * @param {Event} e
     */
    onImageRendered(e) {
        const eventData = e.detail;
        const context = eventData.canvasContext;
        if (eventData.element.id === 'dicomImageLeft') {
            let detections = [];
            if (!this.props.displaySummarizedDetections) {
                this.props.detections.forEach((det) => {
                    if (det.view === constants.viewport.TOP)
                        detections.push(det);
                });
            } else {
                this.props.summarizedDetections.forEach((det) => {
                    if (det.view === constants.viewport.TOP)
                        detections.push(det);
                });
            }
            if (this.props.zoomLevelTop !== eventData.viewport.scale) {
                this.props.updateZoomLevelTop(eventData.viewport.scale);
                cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
                    zoomLevelTop: eventData.viewport.scale,
                });
                cornerstoneTools.setToolOptions('DetectionMovementTool', {
                    zoomLevelTop: eventData.viewport.scale,
                });
            }
            if (
                this.props.cornerstoneMode ===
                    constants.cornerstoneMode.ANNOTATION &&
                this.state.activeViewport === 'dicomImageLeft'
            ) {
                this.renderCrosshair(context, e.currentTarget);
            }
            this.renderDetections(detections, context);
        } else if (
            eventData.element.id === 'dicomImageRight' &&
            this.props.singleViewport === false
        ) {
            let detections = [];
            if (!this.props.displaySummarizedDetections) {
                this.props.detections.forEach((det) => {
                    if (det.view === constants.viewport.SIDE)
                        detections.push(det);
                });
            } else {
                this.props.summarizedDetections.forEach((det) => {
                    if (det.view === constants.viewport.SIDE)
                        detections.push(det);
                });
            }
            if (this.props.zoomLevelSide !== eventData.viewport.scale) {
                this.props.updateZoomLevelSide(eventData.viewport.scale);
                cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
                    zoomLevelSide: eventData.viewport.scale,
                });
                cornerstoneTools.setToolOptions('DetectionMovementTool', {
                    zoomLevelSide: eventData.viewport.scale,
                });
            }
            this.renderDetections(detections, context);
            if (
                this.props.cornerstoneMode ===
                    constants.cornerstoneMode.ANNOTATION &&
                this.state.activeViewport === 'dicomImageRight'
            ) {
                this.renderCrosshair(context, e.currentTarget);
            }
        }
        this.appUpdateImage();
        // set the canvas context to the image coordinate system
        //cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, eventData.canvasContext);
        // NOTE: The coordinate system of the canvas is in image pixel space.  Drawing
        // to location 0,0 will be the top left of the image and rows,columns is the bottom
        // right.
    }

    /**
     * Renders a cross-hair element on the target passed in.
     * That target is a DOM element that might be either the imageViewportTop or the imageViewportSide
     *
     * @param {eventData.canvasContext} context Canvas' context, used to render crosshair directly to canvas
     * @param {DOMElement} target Targeted DOMElement caught via mouse event data
     */
    renderCrosshair(context, target) {
        const crosshairLength = 8;
        const mousePos = cornerstone.pageToPixel(
            target,
            this.state.mousePosition.x,
            this.state.mousePosition.y
        );
        const imageSize =
            target.id === 'dicomImageRight'
                ? cornerstone.getImage(this.state.imageViewportSide)
                : cornerstone.getImage(this.state.imageViewportTop);
        context.lineWidth = 2;
        if (
            mousePos.x >= 0 &&
            mousePos.x <= imageSize.width &&
            mousePos.y >= 0 &&
            mousePos.y <= imageSize.height
        ) {
            context.beginPath();
            context.setLineDash([2, 2]);
            context.strokeStyle = 'grey';
            context.moveTo(mousePos.x, 0);
            context.lineTo(mousePos.x, imageSize.height);
            context.stroke();
            context.beginPath();
            context.moveTo(0, mousePos.y);
            context.lineTo(imageSize.width, mousePos.y);
            context.stroke();
        }
        context.setLineDash([]);
        context.strokeStyle = constants.colors.BLUE;
        context.beginPath();
        context.moveTo(mousePos.x - crosshairLength, mousePos.y);
        context.lineTo(mousePos.x + crosshairLength, mousePos.y);
        context.stroke();
        context.beginPath();
        context.moveTo(mousePos.x, mousePos.y - crosshairLength);
        context.lineTo(mousePos.x, mousePos.y + crosshairLength);
        context.stroke();
    }

    /**
     * Updates the image rendered by Cornerstone according to the number of viewports.
     */
    appUpdateImage() {
        cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
            editionMode: this.props.editionMode,
        });
        if (this.state.imageViewportTop !== undefined) {
            try {
                cornerstone.updateImage(this.state.imageViewportTop, true);
            } catch (e) {
                console.error(e.stack);
            }
        }
        if (
            this.props.singleViewport === false &&
            this.state.imageViewportSide !== undefined
        ) {
            try {
                cornerstone.updateImage(this.state.imageViewportSide, true);
            } catch (e) {
                console.error(e.stack);
            }
        }
    }

    /**
     * Method that renders annotations directly utilizing the canvas' context
     *
     * @param {Array<Detection>} data Array of detection data
     * @param {eventData.canvasContext} context Rendering context
     */
    renderDetections(data, context) {
        if (!data) {
            return;
        }
        const B_BOX_COORDS = 4;
        context.font = constants.detectionStyle.LABEL_FONT;
        context.lineWidth = constants.detectionStyle.BORDER_WIDTH;
        // eslint-disable-next-line no-unused-vars
        for (let j = 0; j < data.length; j++) {
            if (
                data[j].visible !== true ||
                (this.props.editionMode === constants.editionMode.BOUNDING &&
                    data[j].selected) ||
                (this.props.editionMode === constants.editionMode.POLYGON &&
                    data[j].selected) ||
                (this.props.editionMode === constants.editionMode.MOVE &&
                    data[j].selected)
            ) {
                continue;
            }

            const boundingBoxCoords = data[j].boundingBox;
            if (boundingBoxCoords.length < B_BOX_COORDS) {
                return;
            }
            let boundingBoxColor = data[j].color;
            if (this.props.selectedDetection) {
                if (this.props.selectedDetection.uuid !== data[j].uuid) {
                    const rgb = Utils.hexToRgb(data[j].color);
                    boundingBoxColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
                } else {
                    boundingBoxColor = constants.detectionStyle.SELECTED_COLOR;
                }
            }
            context.strokeStyle = boundingBoxColor;
            context.fillStyle = boundingBoxColor;
            const boundingBoxWidth = Math.abs(
                boundingBoxCoords[2] - boundingBoxCoords[0]
            );
            const boundingBoxHeight = Math.abs(
                boundingBoxCoords[3] - boundingBoxCoords[1]
            );
            const detectionLabel = Utils.formatDetectionLabel(
                data[j].className,
                data[j].confidence
            );
            const labelSize = Utils.getTextLabelSize(
                context,
                detectionLabel,
                constants.detectionStyle.LABEL_PADDING
            );
            context.strokeRect(
                boundingBoxCoords[0],
                boundingBoxCoords[1],
                boundingBoxWidth,
                boundingBoxHeight
            );

            context.globalAlpha = 0.5;
            if (data[j].polygonMask.length > 0) {
                // Polygon mask rendering
                this.renderPolygonMasks(data[j].polygonMask, context);
            } else {
                // Binary mask rendering
                if (
                    this.props.currentFileFormat !==
                    constants.SETTINGS.ANNOTATIONS.COCO
                )
                    Utils.renderBinaryMasks(data[j].binaryMask, context);
            }

            context.globalAlpha = 1.0;

            // Label rendering
            if (
                data[j].selected &&
                this.props.editionMode === constants.editionMode.LABEL
            )
                continue;
            context.fillRect(
                boundingBoxCoords[0],
                boundingBoxCoords[1] - labelSize['height'],
                labelSize['width'],
                labelSize['height']
            );
            context.strokeRect(
                boundingBoxCoords[0],
                boundingBoxCoords[1] - labelSize['height'],
                labelSize['width'],
                labelSize['height']
            );
            context.fillStyle = constants.detectionStyle.LABEL_TEXT_COLOR;
            context.fillText(
                detectionLabel,
                boundingBoxCoords[0] + constants.detectionStyle.LABEL_PADDING,
                boundingBoxCoords[1] - constants.detectionStyle.LABEL_PADDING
            );
        }
    }

    /**
     * Renders the polygon mask associated with a detection.
     *
     * @param {Array<number>} coords - Polygon mask coordinates
     * @param {Context} context - Rendering context
     */
    renderPolygonMasks(coords, context) {
        if (coords === undefined || coords === null || coords.length === 0) {
            return;
        }
        Utils.renderPolygonMasks(context, coords);
    }

    /**
     * Callback invoked when a touch event is initiated.
     *
     * @param {Event} e - Event data such as touch position and event time stamp.
     */
    onTouchStart(e) {
        let startPosition = e.detail.currentPoints.page;
        let startTime = e.detail.event.timeStamp;

        this.state.tapDetector.touchStart(startPosition, startTime);
    }

    /**
     * Callback function invoked when a touch ends.
     *
     * @param {Event} e - Event data such as touch position and event time stamp.
     */
    onTouchEnd(e) {
        let endPosition = e.detail.currentPoints.page;
        let endTime = e.detail.event.timeStamp;
        let isTap = this.state.tapDetector.checkTouchEnd(endPosition, endTime);

        if (isTap) {
            this.onMouseClicked(e);
        }
    }

    /**
     * Callback invoked on mouse clicked in image viewport. We handle the selection of detections.
     *
     * @param {Event} e - Event data such as the mouse cursor position, mouse button clicked, etc.
     */
    onMouseClicked(e) {
        if (!this.props.detections) {
            return;
        }
        if (this.props.displaySummarizedDetections) {
            return;
        }
        let combinedDetections;
        if (e.detail.element.id === 'dicomImageLeft') {
            // top
            combinedDetections = getTopDetections(this.props.detections);
        } else if (e.detail.element.id === 'dicomImageRight') {
            // side
            combinedDetections = getSideDetections(this.props.detections);
        }
        if (combinedDetections.length > 0) {
            const mousePos = cornerstone.canvasToPixel(e.target, {
                x: e.detail.currentPoints.canvas.x,
                y: e.detail.currentPoints.canvas.y,
            });
            let clickedPos = constants.selection.NO_SELECTION;
            for (let j = combinedDetections.length - 1; j > -1; j--) {
                if (combinedDetections[j].visible === false) continue;
                if (
                    Utils.pointInRect(
                        mousePos,
                        combinedDetections[j].boundingBox
                    ) &&
                    !combinedDetections[j].selected // check if detection is already selected?
                ) {
                    clickedPos = j;
                    break;
                }
            }

            if (
                this.props.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION
            ) {
                return;
            }
            // Click on an empty area
            if (
                clickedPos === constants.selection.NO_SELECTION &&
                this.props.editionMode !== constants.editionMode.COLOR
            ) {
                if (
                    this.props.editionMode === constants.editionMode.LABEL &&
                    this.props.inputLabel !== ''
                ) {
                    this.editDetectionLabel(this.props.inputLabel);
                    this.props.setInputLabel('');
                }
                this.props.clearAllSelection();
                this.props.emptyAreaClickUpdate();
                this.resetCornerstoneTool();
                this.appUpdateImage();
            } else if (
                clickedPos === constants.selection.NO_SELECTION &&
                this.props.editionMode === constants.editionMode.COLOR
            ) {
                this.props.updateEditionMode({
                    editionMode: constants.editionMode.NO_TOOL,
                });
            } else {
                // Clicked on detection
                if (
                    (combinedDetections[clickedPos].visible !== false &&
                        this.props.cornerstoneMode ===
                            constants.cornerstoneMode.SELECTION) ||
                    (combinedDetections[clickedPos].visible !== false &&
                        this.props.cornerstoneMode ===
                            constants.cornerstoneMode.EDITION &&
                        !combinedDetections[clickedPos].selected)
                ) {
                    this.props.selectDetection(
                        combinedDetections[clickedPos].uuid
                    );
                    this.props.detectionSelectedUpdate();
                    this.renderDetectionContextMenu(
                        e,
                        combinedDetections[clickedPos]
                    );
                    this.appUpdateImage();
                } else if (
                    combinedDetections[clickedPos].visible !== false &&
                    this.props.cornerstoneMode ===
                        constants.cornerstoneMode.EDITION &&
                    combinedDetections[clickedPos].selected
                ) {
                    // We are in edition mode and clicked the same detection that is in edition mode
                    // In other words, clicking the same detection again after having selected it
                    this.props.updateEditionMode({
                        editionMode: constants.editionMode.NO_TOOL,
                    });
                    this.resetCornerstoneTool();
                    this.appUpdateImage();
                }
            }
        } else {
            // There are no detections on the viewport clicked (still must clear the currently selected detection)
            this.props.clearAllSelection();
            this.props.emptyAreaClickUpdate();
            this.resetCornerstoneTool();
            this.appUpdateImage();
        }
    }

    /**
     * Callback invoked when user stops dragging mouse or finger on touch device.
     *
     * @param {Event} event - Mouse drag end event
     * @param {DOMElement} viewport - The Cornerstone Viewport containing the event
     */
    onDragEnd(event, viewport) {
        if (
            (this.props.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION &&
                this.props.annotationMode ===
                    constants.annotationMode.BOUNDING) ||
            this.props.cornerstoneMode === constants.cornerstoneMode.EDITION
        ) {
            let toolState;
            if (
                (this.props.cornerstoneMode ===
                    constants.cornerstoneMode.ANNOTATION &&
                    this.props.annotationMode ===
                        constants.annotationMode.BOUNDING) ||
                (this.props.cornerstoneMode ===
                    constants.cornerstoneMode.EDITION &&
                    this.props.editionMode === constants.editionMode.BOUNDING)
            ) {
                toolState = cornerstoneTools.getToolState(
                    viewport,
                    'BoundingBoxDrawing'
                );
            } else if (this.props.editionMode === constants.editionMode.MOVE) {
                toolState = cornerstoneTools.getToolState(
                    viewport,
                    'DetectionMovementTool'
                );
            } else if (
                this.props.editionMode === constants.editionMode.POLYGON
            ) {
                toolState = cornerstoneTools.getToolState(
                    viewport,
                    'PolygonDrawingTool'
                );
            }
            if (toolState === undefined || toolState.data.length === 0) {
                if (!this.props.selectedDetection) {
                    this.props.emptyAreaClickUpdate();
                    this.resetSelectedDetectionBoxes(event);
                } else {
                    this.props.updateIsDetectionContextVisible(true);
                    if (
                        this.props.editionMode === constants.editionMode.COLOR
                    ) {
                        this.props.colorPickerToggle();
                        this.props.updateMissMatchedClassName();
                    }
                    // Only show the detection if we are still in the same viewport (from event data) as the detection
                    if (
                        (this.props.selectedDetection.view ===
                            constants.viewport.TOP &&
                            event.target === this.state.imageViewportTop) ||
                        (this.props.selectedDetection.view ===
                            constants.viewport.SIDE &&
                            event.target === this.state.imageViewportSide)
                    ) {
                        this.renderDetectionContextMenu(
                            event,
                            this.props.selectedDetection
                        );
                    } else {
                        // Otherwise hide the menu
                        // It will re-appear when they drag to correct the image
                        this.props.updateIsDetectionContextVisible(false);
                    }
                }
                return;
            }
            const { data } = toolState;
            // Destructure data needed from event
            if (
                data === undefined ||
                data.length === 0 ||
                data[0] === undefined
            ) {
                return;
            }
            let newDetection, coords, boundingBoxArea, polygonMask, binaryMask;
            if (
                (this.props.cornerstoneMode ===
                    constants.cornerstoneMode.ANNOTATION &&
                    this.props.annotationMode ===
                        constants.annotationMode.BOUNDING) ||
                (this.props.cornerstoneMode ===
                    constants.cornerstoneMode.EDITION &&
                    this.props.editionMode ===
                        constants.editionMode.BOUNDING) ||
                this.props.editionMode === constants.editionMode.MOVE
            ) {
                const { handles } = data[0];
                const { start, end } = handles;
                // Fix flipped rectangle issues
                if (start.x > end.x && start.y > end.y) {
                    coords = [end.x, end.y, start.x, start.y];
                } else if (start.x > end.x) {
                    coords = [end.x, start.y, start.x, end.y];
                } else if (start.y > end.y) {
                    coords = [start.x, end.y, end.x, start.y];
                } else {
                    coords = [start.x, start.y, end.x, end.y];
                }
                boundingBoxArea = Math.abs(
                    (coords[0] - coords[2]) * (coords[1] - coords[3])
                );
                if (data[0].updatingDetection) {
                    polygonMask = Utils.calculatePolygonMask(
                        coords,
                        data[0].polygonCoords
                    );
                }
                if (data[0].binaryMask !== undefined) {
                    binaryMask = [
                        data[0].binaryMask[0],
                        [coords[0], coords[1]],
                        [coords[2] - coords[0], coords[3] - coords[1]],
                    ];
                }
                newDetection = {
                    uuid: data[0].uuid,
                    boundingBox: coords,
                    algorithm: data[0].algorithm,
                    className: data[0].class,
                    confidence: data[0].confidence,
                    view:
                        viewport === this.state.imageViewportTop
                            ? constants.viewport.TOP
                            : constants.viewport.SIDE,
                    validation: true,
                    binaryMask,
                    polygonMask: polygonMask,
                };
            } else if (
                this.props.editionMode === constants.editionMode.POLYGON
            ) {
                // Poly
                coords = Utils.calculateBoundingBox(data[0].handles.points);
                polygonMask = Utils.polygonDataToXYArray(
                    data[0].handles.points,
                    coords
                );
                newDetection = {
                    uuid: data[0].uuid,
                    boundingBox: coords,
                    algorithm: data[0].algorithm,
                    className: data[0].class,
                    confidence: data[0].confidence,
                    view:
                        viewport === this.state.imageViewportTop
                            ? constants.viewport.TOP
                            : constants.viewport.SIDE,
                    validation: true,
                    binaryMask,
                    polygonMask,
                };
            }
            const stackIndex = this.state.myOra.stackData.findIndex((stack) => {
                return newDetection.view === stack.view;
            });
            const self = this;

            if (
                this.props.currentFileFormat ===
                constants.SETTINGS.ANNOTATIONS.TDR
            ) {
                Dicos.detectionObjectToBlob(
                    newDetection,
                    self.state.myOra.stackData[stackIndex].blobData[0].blob,
                    this.props.currentFileFormat
                ).then((newBlob) => {
                    const uuid = uuidv4();
                    self.state.myOra.stackData[stackIndex].blobData.push({
                        blob: newBlob,
                        uuid,
                    });
                    if (data[0] === undefined) {
                        self.props.emptyAreaClickUpdate();
                        self.resetSelectedDetectionBoxes(event);
                        return;
                    }
                    // When the updating detection is false, this means we are creating a new detection
                    if (data[0].updatingDetection === false) {
                        const operator = constants.OPERATOR;
                        if (
                            boundingBoxArea >
                            constants.BOUNDING_BOX_AREA_THRESHOLD
                        ) {
                            self.props.addDetection({
                                algorithm: operator,
                                boundingBox: coords,
                                className: data[0].class,
                                confidence: data[0].confidence,
                                view:
                                    viewport === self.state.imageViewportTop
                                        ? constants.viewport.TOP
                                        : constants.viewport.SIDE,

                                binaryMask: [
                                    [],
                                    [coords[0], coords[1]],
                                    [
                                        coords[2] - coords[0],
                                        coords[3] - coords[1],
                                    ],
                                ],
                                polygonMask: [],
                                uuid,
                                detectionFromFile: false,
                            });
                            self.appUpdateImage();
                        } else {
                            self.props.updateCornerstoneMode({
                                cornerstoneMode:
                                    constants.cornerstoneMode.SELECTION,
                            });
                            self.resetCornerstoneTool();
                        }
                    } else {
                        // Updating existing Detection's bounding box
                        const { uuid } = data[0];

                        // Only update the Detection if the boundingBox actually changes
                        if (
                            hasDetectionCoordinatesChanged(
                                self.props.detections,
                                uuid,
                                coords,
                                polygonMask
                            )
                        ) {
                            if (
                                this.props.selectedDetection &&
                                this.props.editionMode !==
                                    constants.editionMode.POLYGON
                            ) {
                                if (
                                    this.props.selectedDetection.polygonMask
                                        .length > 0
                                ) {
                                    polygonMask = Utils.calculatePolygonMask(
                                        coords,
                                        this.props.selectedDetection.polygonMask
                                    );
                                    binaryMask =
                                        Utils.polygonToBinaryMask(polygonMask);
                                } else if (
                                    this.props.selectedDetection.binaryMask
                                        .length > 0 &&
                                    this.props.selectedDetection.binaryMask[0]
                                        .length > 0
                                ) {
                                    binaryMask = cloneDeep(
                                        this.props.selectedDetection.binaryMask
                                    );
                                    binaryMask[1][0] = coords[0];
                                    binaryMask[1][1] = coords[1];
                                }
                            }
                            self.props.updateDetection({
                                uuid: data[0].uuid,
                                update: {
                                    boundingBox: coords,
                                    polygonMask: polygonMask,
                                    binaryMask,
                                },
                            });
                            const viewportInfo =
                                Utils.eventToViewportInfo(event);
                            const contextMenuPos = self.getContextMenuPos(
                                viewportInfo,
                                coords
                            );
                            const detectionData = self.props.detections.find(
                                (det) => det.uuid === data[0].uuid
                            );
                            const editLabelWidgetPosInfo =
                                self.getEditLabelWidgetPos(
                                    detectionData,
                                    coords
                                );
                            let widgetPosition = {
                                top: editLabelWidgetPosInfo.y,
                                left: editLabelWidgetPosInfo.x,
                            };
                            self.props.onDragEndWidgetUpdate({
                                detectionLabelEditWidth:
                                    editLabelWidgetPosInfo.boundingWidth,
                                detectionLabelEditPosition: widgetPosition,
                                contextMenuPos,
                            });
                            // Detection coordinates changed and we need to re-render the detection context widget
                            if (this.props.selectedDetection) {
                                this.renderDetectionContextMenu(
                                    event,
                                    this.props.selectedDetection
                                );
                            }
                        }
                    }
                    if (
                        self.props.cornerstoneMode ===
                        constants.cornerstoneMode.ANNOTATION
                    ) {
                        self.props.emptyAreaClickUpdate();
                        self.resetCornerstoneTool();
                        self.props.clearAllSelection();
                        self.appUpdateImage();
                    } else if (
                        self.props.cornerstoneMode ===
                        constants.cornerstoneMode.EDITION
                    ) {
                        self.props.updateIsDetectionContextVisible(true);
                        self.appUpdateImage();
                    }
                });
            } else if (
                this.props.currentFileFormat ===
                constants.SETTINGS.ANNOTATIONS.COCO
            ) {
                if (data[0] === undefined) {
                    self.props.emptyAreaClickUpdate();
                    self.resetSelectedDetectionBoxes(event);
                    return;
                }
                // When the updating detection is false, this means we are creating a new detection
                if (data[0].updatingDetection === false) {
                    if (
                        boundingBoxArea > constants.BOUNDING_BOX_AREA_THRESHOLD
                    ) {
                        let detUuid = uuidv4();
                        const newDetection = {
                            algorithm: constants.OPERATOR,
                            boundingBox: coords,
                            className: data[0].class,
                            confidence: data[0].confidence,
                            view:
                                viewport === self.state.imageViewportTop
                                    ? constants.viewport.TOP
                                    : constants.viewport.SIDE,

                            binaryMask: [
                                [],
                                [coords[0], coords[1]],
                                [coords[2] - coords[0], coords[3] - coords[1]],
                            ],
                            polygonMask: [],
                            uuid: detUuid,
                            id: detUuid,
                            detectionFromFile: false,
                        };
                        this.state.myOra.stackData[
                            stackIndex
                        ].formattedData.push(newDetection);
                        self.props.addDetection(newDetection);
                        self.appUpdateImage();
                    } else {
                        self.props.updateCornerstoneMode({
                            cornerstoneMode:
                                constants.cornerstoneMode.SELECTION,
                        });
                        self.resetCornerstoneTool();
                    }
                } else {
                    // Updating existing Detection's bounding box
                    const { uuid } = data[0];

                    // Only update the Detection if the boundingBox actually changes
                    if (
                        hasDetectionCoordinatesChanged(
                            self.props.detections,
                            uuid,
                            coords,
                            polygonMask
                        )
                    ) {
                        if (
                            this.props.selectedDetection &&
                            this.props.editionMode !==
                                constants.editionMode.POLYGON
                        ) {
                            if (
                                this.props.selectedDetection.polygonMask
                                    .length > 0
                            ) {
                                polygonMask = Utils.calculatePolygonMask(
                                    coords,
                                    this.props.selectedDetection.polygonMask
                                );
                                binaryMask =
                                    Utils.polygonToBinaryMask(polygonMask);
                            } else if (
                                this.props.selectedDetection.binaryMask.length >
                                    0 &&
                                this.props.selectedDetection.binaryMask[0]
                                    .length > 0
                            ) {
                                binaryMask = cloneDeep(
                                    this.props.selectedDetection.binaryMask
                                );
                                binaryMask[1][0] = coords[0];
                                binaryMask[1][1] = coords[1];
                            }
                        }
                        self.props.updateDetection({
                            uuid: data[0].uuid,
                            update: {
                                boundingBox: coords,
                                polygonMask: polygonMask ? polygonMask : null,
                                binaryMask: binaryMask ? binaryMask : null,
                            },
                        });
                        const viewportInfo = Utils.eventToViewportInfo(event);
                        const contextMenuPos = self.getContextMenuPos(
                            viewportInfo,
                            coords
                        );
                        const detectionData = self.props.detections.find(
                            (det) => det.uuid === data[0].uuid
                        );
                        const editLabelWidgetPosInfo =
                            self.getEditLabelWidgetPos(detectionData, coords);
                        let widgetPosition = {
                            top: editLabelWidgetPosInfo.y,
                            left: editLabelWidgetPosInfo.x,
                        };
                        self.props.onDragEndWidgetUpdate({
                            detectionLabelEditWidth:
                                editLabelWidgetPosInfo.boundingWidth,
                            detectionLabelEditPosition: widgetPosition,
                            contextMenuPos,
                        });
                        // Detection coordinates changed and we need to re-render the detection context widget
                        if (this.props.selectedDetection) {
                            this.renderDetectionContextMenu(
                                event,
                                this.props.selectedDetection
                            );
                        }
                    }
                }
                if (
                    self.props.cornerstoneMode ===
                    constants.cornerstoneMode.ANNOTATION
                ) {
                    self.props.emptyAreaClickUpdate();
                    self.resetCornerstoneTool();
                    self.props.clearAllSelection();
                    self.appUpdateImage();
                } else if (
                    self.props.cornerstoneMode ===
                    constants.cornerstoneMode.EDITION
                ) {
                    self.props.updateIsDetectionContextVisible(true);
                    self.appUpdateImage();
                }
            }
        }
    }

    /**
     * Callback invoked when new polygon mask has been created.
     *
     * @param {Event} event - Event triggered when a new polygon is created
     * @param {DOMElement} viewport - The Cornerstone Viewport receiving the event
     */
    onNewPolygonMaskCreated(event, viewport) {
        if (
            this.props.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION &&
            this.props.annotationMode === constants.annotationMode.POLYGON
        ) {
            const polygonData = event.detail.measurementData;
            if (polygonData === undefined) {
                self.props.emptyAreaClickUpdate();
                self.resetSelectedDetectionBoxes(event);
                return;
            }
            const boundingBoxCoords = Utils.calculateBoundingBox(
                polygonData.handles.points
            );
            const polygonCoords = Utils.polygonDataToXYArray(
                polygonData.handles.points,
                boundingBoxCoords
            );
            const binaryData = Utils.polygonToBinaryMask(polygonCoords);

            const uuid = uuidv4();

            const newDetection = {
                uuid,
                id: uuid,
                boundingBox: boundingBoxCoords,
                algorithm: polygonData.algorithm,
                className: polygonData.class,
                confidence: polygonData.confidence,
                view:
                    viewport === this.state.imageViewportTop
                        ? constants.viewport.TOP
                        : constants.viewport.SIDE,
                validation: true,
                binaryMask: binaryData,
                polygonMask: polygonCoords,
                detectionFromFile: false,
            };
            const stackIndex = this.state.myOra.stackData.findIndex((stack) => {
                return newDetection.view === stack.view;
            });
            let self = this;
            Dicos.detectionObjectToBlob(
                newDetection,
                self.state.myOra.stackData[stackIndex].blobData[0].blob,
                this.props.currentFileFormat
            ).then((newBlob) => {
                self.state.myOra.stackData[stackIndex].blobData.push({
                    blob: newBlob,
                    uuid,
                });
                if (
                    this.props.currentFileFormat ===
                    constants.SETTINGS.ANNOTATIONS.COCO
                ) {
                    self.state.myOra.stackData[stackIndex].formattedData.push(
                        newDetection
                    );
                }
                self.props.addDetection(newDetection);
                this.resetCornerstoneTool();
                this.props.clearAllSelection();
                this.appUpdateImage();
                this.props.emptyAreaClickUpdate();
                setTimeout(() => {
                    this.startListeningClickEvents();
                }, 500);
            });
        }
    }

    /**
     * Unselects the currently selected detection and hides the context menu.
     *
     * @param {Event} e - Event data such as the mouse cursor position, mouse button clicked, etc.
     */
    resetSelectedDetectionBoxes(e) {
        if (
            this.props.cornerstoneMode === constants.cornerstoneMode.SELECTION
        ) {
            this.props.clearAllSelection();
            this.props.resetSelectedDetectionBoxesUpdate();
            this.resetCornerstoneTool();
            this.appUpdateImage();
        } else if (this.props.selectedDetection) {
            setTimeout(() => {
                this.renderDetectionContextMenu(
                    e,
                    this.props.selectedDetection
                );
            }, 5);
        }
    }

    /**
     * Hides the context menu.
     */
    hideContextMenu() {
        if (
            this.props.cornerstoneMode === constants.cornerstoneMode.SELECTION
        ) {
            this.props.hideContextMenuUpdate();
        } else {
            this.props.exitEditionModeUpdate();
        }
        this.appUpdateImage();
    }

    /**
     * Invoked when the user selects the bounding box option in the FAB
     */
    onBoundingBoxSelected() {
        if (
            this.props.cornerstoneMode === constants.cornerstoneMode.SELECTION
        ) {
            this.props.clearAllSelection();
            this.resetCornerstoneTool();
            this.props.updateCornerstoneMode({
                cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
                annotationMode: constants.annotationMode.BOUNDING,
            });
            this.appUpdateImage();
            cornerstoneTools.setToolActive('BoundingBoxDrawing', {
                mouseButtonMask: 1,
            });
        }
    }

    /**
     * Invoked when the user selects the polygon mask option in the FAB
     */
    onPolygonMaskSelected() {
        if (
            this.props.cornerstoneMode === constants.cornerstoneMode.SELECTION
        ) {
            this.stopListeningClickEvents();
            this.props.clearAllSelection();
            this.resetCornerstoneTool();
            this.props.updateCornerstoneMode({
                cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
                annotationMode: constants.annotationMode.POLYGON,
            });
            this.appUpdateImage();
            cornerstoneTools.setToolActive('PolygonDrawingTool', {
                mouseButtonMask: 1,
            });
        }
    }

    /**
     * Get position of context menu based on the associated bounding box.
     *
     * @param {DOMElement} viewportInfo viewport info
     * @param {Array<number>} coords bounding box corners' coordinates
     * @returns {{x: number, y: number}}
     */
    getContextMenuPos(viewportInfo, coords) {
        if (viewportInfo.viewport !== null) {
            if (coords !== undefined && coords.length > 0) {
                let detectionContextGap = 0;
                let viewport, originCoordX;
                const boundingBoxCoords = coords;
                const boundingWidth = Math.abs(
                    boundingBoxCoords[2] - boundingBoxCoords[0]
                );
                const boundingHeight = Math.abs(
                    boundingBoxCoords[3] - boundingBoxCoords[1]
                );
                if (viewportInfo.viewport === constants.viewport.TOP) {
                    originCoordX = 2;
                    detectionContextGap =
                        viewportInfo.offset / this.props.zoomLevelTop -
                        boundingWidth;
                    viewport = this.state.imageViewportTop;
                } else {
                    originCoordX = 0;
                    detectionContextGap =
                        viewportInfo.offset / this.props.zoomLevelSide -
                        boundingHeight / boundingWidth;
                    viewport = this.state.imageViewportSide;
                }
                const { x, y } = cornerstone.pixelToCanvas(viewport, {
                    x: boundingBoxCoords[originCoordX] + detectionContextGap,
                    y: boundingBoxCoords[1] + boundingHeight + 4,
                });
                return {
                    x: x,
                    y: y,
                };
            }
        }
    }

    /**
     * Invoked when user selects a detection (callback from onMouseClicked)
     *
     * @param {Event} event - Related mouse click event to position the widget relative to detection
     * @param {Detection} [draggedData] - Optional detection data. In the case that
     * a detection is moved during a drag event, the data in state is out of date until after this
     * function is called. Use the param data to render the context menu.
     *
     */
    renderDetectionContextMenu(event, detection) {
        if (detection !== null && detection !== undefined) {
            const viewportInfo = Utils.eventToViewportInfo(
                Utils.mockCornerstoneEvent(
                    event,
                    detection.view === constants.viewport.TOP
                        ? this.state.imageViewportTop
                        : this.state.imageViewportSide
                )
            );

            let detectionContextGap = 0;
            let viewport, originCoordX;
            const boundingBoxCoords = detection.boundingBox;
            const boundingWidth = Math.abs(
                boundingBoxCoords[2] - boundingBoxCoords[0]
            );
            const boundingHeight = Math.abs(
                boundingBoxCoords[3] - boundingBoxCoords[1]
            );
            if (viewportInfo.viewport === constants.viewport.TOP) {
                originCoordX = 2;
                console.log(`viewportInfo.offset: ${viewportInfo.offset}`);
                console.log(
                    `this.props.zoomLevelTop: ${this.props.zoomLevelTop}`
                );
                detectionContextGap =
                    viewportInfo.offset / this.props.zoomLevelTop -
                    boundingWidth;
                viewport = this.state.imageViewportTop;
            } else {
                originCoordX = 0;
                console.log(`viewportInfo.offset: ${viewportInfo.offset}`);
                console.log(
                    `this.props.zoomLevelSide: ${this.props.zoomLevelSide}`
                );
                detectionContextGap =
                    viewportInfo.offset / this.props.zoomLevelSide -
                    boundingHeight / boundingWidth;
                viewport = this.state.imageViewportSide;
            }
            /*console.log(`originCoordX: ${originCoordX}`);
            console.log(`detectionContextGap: ${detectionContextGap}`);*/
            console.log(
                '-----------------------------------------------------'
            );
            const { x, y } = cornerstone.pixelToCanvas(viewport, {
                x: boundingBoxCoords[originCoordX] + detectionContextGap,
                y: boundingBoxCoords[1] + boundingHeight + 4,
            });
            this.props.updateDetectionContextPosition({
                top: y,
                left: x,
            });
            this.appUpdateImage();
        }
    }

    /**
     * Invoked when the user selects an edition mode from DetectionContextMenu.
     *
     * @param {string} newMode - Edition mode selected from menu
     */
    selectEditionMode(newMode) {
        if ([...Object.values(constants.editionMode)].includes(newMode)) {
            const mode =
                newMode === this.props.editionMode
                    ? constants.editionMode.NO_TOOL
                    : newMode;
            if (mode === constants.editionMode.DELETE) {
                this.deleteDetection();
                return;
            }
            let payload = {
                editionMode: mode,
                isEditLabelWidgetVisible: mode === constants.editionMode.LABEL,
            };
            if (mode === constants.editionMode.LABEL) {
                this.resetCornerstoneTool();
                const detectionData = this.props.selectedDetection;
                const editLabelWidgetPosInfo = this.getEditLabelWidgetPos(
                    detectionData,
                    detectionData.boundingBox
                );
                const widgetPosition = {
                    top: editLabelWidgetPosInfo.y,
                    left: editLabelWidgetPosInfo.x,
                };
                payload = {
                    ...payload,
                    detectionLabelEditWidth:
                        editLabelWidgetPosInfo.boundingWidth,
                    detectionLabelEditPosition: widgetPosition,
                };
            } else if (
                mode === constants.editionMode.BOUNDING &&
                this.props.selectedDetection
            ) {
                // Detection selected and activating the bounding box mode
                this.resetCornerstoneTool();
                const data = {
                    handles: {
                        start: {
                            x: this.props.selectedDetection.boundingBox[0],
                            y: this.props.selectedDetection.boundingBox[1],
                        },
                        end: {
                            x: this.props.selectedDetection.boundingBox[2],
                            y: this.props.selectedDetection.boundingBox[3],
                        },
                        start_prima: {
                            x: this.props.selectedDetection.boundingBox[0],
                            y: this.props.selectedDetection.boundingBox[3],
                        },
                        end_prima: {
                            x: this.props.selectedDetection.boundingBox[2],
                            y: this.props.selectedDetection.boundingBox[1],
                        },
                    },
                    uuid: this.props.selectedDetection.uuid,
                    algorithm: this.props.selectedDetection.algorithm,
                    class: this.props.selectedDetection.className,
                    renderColor: constants.detectionStyle.SELECTED_COLOR,
                    confidence: this.props.selectedDetection.confidence,
                    updatingDetection: true,
                    view: this.props.selectedDetection.view,
                    polygonCoords:
                        this.props.selectedDetection.polygonMask !== null
                            ? this.props.selectedDetection.polygonMask
                            : undefined,
                    binaryMask: this.props.selectedDetection.binaryMask,
                };
                if (
                    this.props.selectedDetection.view === constants.viewport.TOP
                ) {
                    cornerstoneTools.addToolState(
                        this.state.imageViewportTop,
                        'BoundingBoxDrawing',
                        data
                    );
                } else if (
                    this.props.selectedDetection.view ===
                    constants.viewport.SIDE
                ) {
                    cornerstoneTools.addToolState(
                        this.state.imageViewportSide,
                        'BoundingBoxDrawing',
                        data
                    );
                }
                cornerstoneTools.setToolActive('BoundingBoxDrawing', {
                    mouseButtonMask: 1,
                });
                cornerstoneTools.setToolActive('Pan', {
                    mouseButtonMask: 1,
                });
                cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
                    cornerstoneMode: constants.cornerstoneMode.EDITION,
                    editionMode: constants.editionMode.NO_TOOL,
                });
                this.appUpdateImage();
            } else if (
                mode === constants.editionMode.POLYGON &&
                this.props.selectedDetection.polygonMask.length > 0
            ) {
                this.resetCornerstoneTool();
                const data = {
                    handles: {
                        points: [...this.props.selectedDetection.polygonMask],
                    },
                    uuid: this.props.selectedDetection.uuid,
                    algorithm: this.props.selectedDetection.algorithm,
                    class: this.props.selectedDetection.className,
                    renderColor: constants.detectionStyle.SELECTED_COLOR,
                    confidence: this.props.selectedDetection.confidence,
                    updatingDetection: true,
                    view: this.props.selectedDetection.view,
                    binaryMask: this.props.selectedDetection.binaryMask,
                };

                if (
                    this.props.selectedDetection.view === constants.viewport.TOP
                ) {
                    cornerstoneTools.addToolState(
                        this.state.imageViewportTop,
                        'PolygonDrawingTool',
                        data
                    );
                } else if (
                    this.props.selectedDetection.view ===
                    constants.viewport.SIDE
                ) {
                    cornerstoneTools.addToolState(
                        this.state.imageViewportSide,
                        'PolygonDrawingTool',
                        data
                    );
                }
                cornerstoneTools.setToolActive('PolygonDrawingTool', {
                    mouseButtonMask: 1,
                });
                cornerstoneTools.setToolOptions('PolygonDrawingTool', {
                    cornerstoneMode: constants.cornerstoneMode.EDITION,
                    editionMode: constants.editionMode.NO_TOOL,
                    updatingDetection: true,
                });
                this.appUpdateImage();
            } else if (
                mode === constants.editionMode.MOVE &&
                this.props.selectedDetection
            ) {
                this.resetCornerstoneTool();
                const data = {
                    handles: {
                        start: {
                            x: this.props.selectedDetection.boundingBox[0],
                            y: this.props.selectedDetection.boundingBox[1],
                        },
                        end: {
                            x: this.props.selectedDetection.boundingBox[2],
                            y: this.props.selectedDetection.boundingBox[3],
                        },
                    },
                    uuid: this.props.selectedDetection.uuid,
                    algorithm: this.props.selectedDetection.algorithm,
                    class: this.props.selectedDetection.className,
                    renderColor: constants.detectionStyle.SELECTED_COLOR,
                    confidence: this.props.selectedDetection.confidence,
                    updatingDetection: true,
                    view: this.props.selectedDetection.view,
                    polygonCoords: this.props.selectedDetection.polygonMask
                        ? this.props.selectedDetection.polygonMask
                        : undefined,
                    binaryMask: this.props.selectedDetection.binaryMask
                        ? cloneDeep(this.props.selectedDetection.binaryMask)
                        : undefined,
                };
                if (
                    this.props.selectedDetection.view === constants.viewport.TOP
                ) {
                    cornerstoneTools.addToolState(
                        this.state.imageViewportTop,
                        'DetectionMovementTool',
                        data
                    );
                } else if (
                    this.props.selectedDetection.view ===
                    constants.viewport.SIDE
                ) {
                    cornerstoneTools.addToolState(
                        this.state.imageViewportSide,
                        'DetectionMovementTool',
                        data
                    );
                }
                cornerstoneTools.setToolActive('DetectionMovementTool', {
                    mouseButtonMask: 1,
                });
                cornerstoneTools.setToolActive('Pan', {
                    mouseButtonMask: 1,
                });
                cornerstoneTools.setToolOptions('DetectionMovementTool', {
                    cornerstoneMode: constants.cornerstoneMode.EDITION,
                    editionMode: constants.editionMode.MOVE,
                });
                this.appUpdateImage();
            } else if (
                mode === constants.editionMode.COLOR &&
                this.props.selectedDetection
            ) {
                this.resetCornerstoneTool();
            } else if (mode === constants.editionMode.NO_TOOL) {
                this.resetCornerstoneTool();
            }

            this.props.updateEditionMode(payload);
        }
    }

    /**
     * Invoked when user completes editing a detection's label
     *
     * @param {string} newLabel - Updated label name from user interaction
     */
    editDetectionLabel(newLabel) {
        const { uuid } = this.props.selectedDetection;
        if (uuid) {
            this.props.editDetectionLabel({
                className: newLabel,
                uuid: uuid,
            });
            cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
                cornerstoneMode: constants.cornerstoneMode.EDITION,
                editionMode: constants.editionMode.NO_TOOL,
                temporaryLabel: newLabel,
            });
            this.props.onLabelEditionEnd({
                editionMode: constants.editionMode.NO_TOOL,
                detectionLabelEditWidth: 0,
                isEditLabelWidgetVisible: false,
            });
        }
    }

    /**
     * Calculates position of the edit label widget
     *
     * @param {{boundingBox: Array<number>, view: constants.viewport, label: string, confidence: number}} detectionData - Detection data
     * @param {Array<number>} [coords = undefined] - Bounding box coordinates
     */
    getEditLabelWidgetPos(detectionData, coords = undefined) {
        if (detectionData) {
            // Destructure relevant info related to selected detection
            const {
                boundingBox,
                view,
                className: label,
                confidence,
            } = detectionData;
            const bbox = coords === undefined ? boundingBox : coords;
            if (bbox) {
                const boundingWidth = Math.abs(bbox[2] - bbox[0]);
                // Position component on top of existing detection label
                let gap, viewport, labelHeight, currentViewport, zoomLevel;
                if (view === constants.viewport.TOP) {
                    currentViewport = this.state.imageViewportTop;
                    zoomLevel = this.props.zoomLevelTop;
                } else {
                    currentViewport = this.state.imageViewportSide;
                    zoomLevel = this.props.zoomLevelSide;
                }

                var fontArr = constants.detectionStyle.LABEL_FONT.split(' ');
                var fontSizeArr = fontArr[1].split('px');
                var fontSize = fontSizeArr[0];
                fontSize *= zoomLevel;
                fontSizeArr[0] = fontSize;
                var newFontSize = fontSizeArr.join('px');
                var newFont = fontArr[0] + ' ' + newFontSize + ' ' + fontArr[2];

                const canvas = currentViewport.children[0];
                const ctx = canvas.getContext('2d');
                const detectionLabel = Utils.formatDetectionLabel(
                    label,
                    confidence
                );
                const labelSize = Utils.getTextLabelSize(
                    ctx,
                    detectionLabel,
                    constants.detectionStyle.LABEL_PADDING
                );
                const { offsetLeft } = currentViewport;
                gap = offsetLeft / zoomLevel;
                viewport =
                    currentViewport.id === 'dicomImageRight'
                        ? this.state.imageViewportSide
                        : this.state.imageViewportTop;
                labelHeight = labelSize.height;
                const newViewport =
                    currentViewport.id === 'dicomImageRight'
                        ? constants.viewport.SIDE
                        : constants.viewport.TOP;
                const { x, y } = cornerstone.pixelToCanvas(viewport, {
                    x: bbox[0] + gap,
                    y: bbox[1] - labelHeight,
                });
                this.props.labelSelectedUpdate({
                    width: boundingWidth,
                    position: { x, y },
                    font: newFont,
                    viewport: newViewport,
                });
                this.appUpdateImage();
                return {
                    x: x,
                    y: y,
                    boundingWidth: boundingWidth,
                    font: newFont,
                    viewport: newViewport,
                };
            }
        }
    }

    /**
     * Invoked when the user selects 'delete' option from DetectionContextMenu.
     */
    deleteDetection() {
        // Detection is selected
        if (this.props.selectedDetection) {
            this.props.deleteDetection(this.props.selectedDetection.uuid);
            if (this.props.selectedDetection.view === constants.viewport.TOP) {
                if (
                    this.props.currentFileFormat ===
                    constants.SETTINGS.ANNOTATIONS.TDR
                )
                    this.state.myOra.setStackBlobData(
                        0,
                        this.state.myOra.stackData[0].blobData.filter(
                            (blob) =>
                                blob.uuid !== this.props.selectedDetection.uuid
                        )
                    );
            } else if (
                this.props.selectedDetection.view === constants.viewport.SIDE
            ) {
                if (
                    this.props.currentFileFormat ===
                    constants.SETTINGS.ANNOTATIONS.TDR
                )
                    this.state.myOra.setStackBlobData(
                        1,
                        this.state.myOra.stackData[1].blobData.filter(
                            (blob) =>
                                blob.uuid !== this.props.selectedDetection.uuid
                        )
                    );
            }
            // Reset remaining DetectionSets to `un-selected` state
            this.props.clearAllSelection();
            this.props.deleteDetectionUpdate();
            this.resetCornerstoneTool();
            this.appUpdateImage();
        }
    }

    /**
     * Callback invoked when the mouse pointer is moves. It captures and saves the {x , y} coordinates of the mouse
     * to the App State
     *
     * @param {Event} event
     */
    onMouseMoved(event) {
        this.setState({
            mousePosition: { x: event.x, y: event.y },
            activeViewport: event.target.parentElement.id,
        });
    }

    /**
     * Callback invoked when a mouse wheel event happens.
     */
    onMouseWheel(event) {
        if (this.props.selectedDetection !== null) {
            this.props.updateRecentScroll(true);
            clearTimeout(this.state.timer);
            this.setState({
                timer: setTimeout(() => {
                    this.props.updateRecentScroll(false);
                }, 250),
            });
            this.renderDetectionContextMenu(
                event,
                this.props.selectedDetection
            );
        }
    }

    /**
     * Mouse leave event handler. It mainly serves as a way to make sure a user does not try to drag a detection out of
     * the window.
     *
     * @param {Event} event
     */
    onMouseLeave(event) {
        /*if (this.props.numFilesInQueue > 0) this.props.emptyAreaClickUpdate();
        else this.props.onMouseLeaveNoFilesUpdate();
        if (this.props.selectedDetection !== null)
            this.resetSelectedDetectionBoxes(event);*/
    }

    render() {
        return (
            <div>
                <div
                    id="viewerContainer"
                    style={{
                        width: '100vw',
                        height: '100vh',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    className="disable-selection noIbar"
                    unselectable="off"
                    ref={(el) => {
                        el &&
                            el.addEventListener('selectstart', (e) => {
                                e.preventDefault();
                            });
                    }}>
                    <TopBar
                        connectToCommandServer={this.connectToCommandServer}
                        getFileFromLocal={this.getFileFromLocal}
                        cornerstone={cornerstone}
                    />
                    <SideMenu
                        nextImageClick={this.nextImageClick}
                        resetCornerstoneTools={this.resetCornerstoneTool}
                        renderDetectionContextMenu={
                            this.renderDetectionContextMenu
                        }
                    />
                    {this.props.remoteOrLocal === true ||
                    (!this.props.remoteOrLocal && this.props.hasFileOutput) ? (
                        <NextButton
                            collapseBtn={true}
                            nextImageClick={this.nextImageClick}
                        />
                    ) : (
                        <SaveButton
                            collapseBtn={true}
                            nextImageClick={this.nextImageClick}
                        />
                    )}
                    <div id="algorithm-outputs"></div>
                    <DetectionContextMenu
                        setSelectedOption={this.selectEditionMode}
                    />
                    <ColorPicker />
                    <EditLabel onLabelChange={this.editDetectionLabel} />
                    <BoundPolyFAB
                        onBoundingSelect={this.onBoundingBoxSelected}
                        onPolygonSelect={this.onPolygonMaskSelected}
                    />
                    {isElectron() ? (
                        <LazyImageMenu
                            getSpecificFileFromLocalDirectory={
                                this.getSpecificFileFromLocalDirectory
                            }
                            thumbnails={this.state.thumbnails}
                        />
                    ) : null}
                    <NoFileSign />
                    <MetaData />
                </div>
                {this.props.loadingElectronCookie === false ? (
                    <SettingsModal
                        connectToCommandServer={this.connectToCommandServer}
                        resetCornerstoneTool={this.resetCornerstoneTool}
                        appUpdateImage={this.appUpdateImage}
                        cornerstone={cornerstone}
                    />
                ) : null}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { server, detections, ui, settings } = state;
    return {
        // Socket connection state
        numFilesInQueue: server.numFilesInQueue,
        currentProcessingFile: server.currentProcessingFile,
        // Detections and Selection state
        detections: detections.detections,
        selectedDetection: detections.selectedDetection,
        summarizedDetections: detections.summarizedDetections,
        // UI
        cornerstoneMode: ui.cornerstoneMode,
        annotationMode: ui.annotationMode,
        zoomLevelTop: ui.zoomLevelTop,
        zoomLevelSide: ui.zoomLevelSide,
        imageViewportTop: ui.imageViewportTop,
        imageViewportSide: ui.imageViewportSide,
        singleViewport: ui.singleViewport,
        isEditLabelWidgetVisible: ui.isEditLabelWidgetVisible,
        editionMode: ui.editionMode,
        inputLabel: ui.inputLabel,
        collapsedSideMenu: ui.collapsedSideMenu,
        collapsedLazyMenu: ui.collapsedLazyMenu,
        colorPickerVisible: ui.colorPickerVisible,
        currentFileFormat: ui.currentFileFormat,
        // Settings
        displaySummarizedDetections:
            settings.settings.displaySummarizedDetections,
        remoteIp: settings.settings.remoteIp,
        remotePort: settings.settings.remotePort,
        autoConnect: settings.settings.autoConnect,
        fileFormat: settings.settings.fileFormat,
        fileSuffix: settings.settings.fileSuffix,
        firstDisplaySettings: settings.settings.firstDisplaySettings,
        annotationsFormat: settings.settings.annotationsFormat,
        remoteOrLocal: settings.settings.remoteOrLocal,
        hasFileOutput: settings.settings.hasFileOutput,
        deviceType: settings.settings.deviceType,
        localFileOutput: settings.settings.localFileOutput,
        loadingElectronCookie: settings.settings.loadingElectronCookie,
    };
};

const mapDispatchToProps = {
    setDownload,
    setUpload,
    setNumFilesInQueue,
    setProcessingHost,
    setCurrentProcessingFile,
    resetDetections,
    updateDetection,
    addDetection,
    clearAllSelection,
    selectDetection,
    selectDetectionSet,
    editDetectionLabel,
    deleteDetection,
    validateDetections,
    updateDetectionSetVisibility,
    updateFABVisibility,
    updateIsDetectionContextVisible,
    updateCornerstoneMode,
    updateEditionMode,
    emptyAreaClickUpdate,
    onMouseLeaveNoFilesUpdate,
    detectionSelectedUpdate,
    labelSelectedUpdate,
    deleteDetectionUpdate,
    exitEditionModeUpdate,
    updateDetectionContextPosition,
    updateZoomLevels,
    updateZoomLevelTop,
    updateZoomLevelSide,
    selectConfigInfoUpdate,
    newFileReceivedUpdate,
    hideContextMenuUpdate,
    resetSelectedDetectionBoxesUpdate,
    resetSelectedDetectionBoxesElseUpdate,
    onDragEndWidgetUpdate,
    onLabelEditionEnd,
    updateDetectionVisibility,
    setInputLabel,
    setConnected,
    setReceiveTime,
    colorPickerToggle,
    updateMissMatchedClassName,
    setLocalFileOpen,
    updateEditLabelPosition,
    updateRecentScroll,
    setCurrentFileFormat,
    toggleCollapsedSideMenu,
    loadElectronCookie,
    saveSettings,
    setCollapsedSideMenu,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
