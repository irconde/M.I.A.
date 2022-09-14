import './App.css';
import React, { Component } from 'react';
import Box from '@mui/material/Box';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'eac-cornerstone-tools';
import dicomParser from 'dicom-parser';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader';
import Utils from './utils/general/Utils.js';
import Dicos from './utils/detections/Dicos.js';
import TapDetector from './utils/general/TapDetector';
import SideMenuComponent from './components/side-menu/side-menu.component';
import SaveButtonComponent from './components/side-menu/buttons/save-button.component';
import TopBarComponent from './components/top-bar/top-bar.component';
import JSZip from 'jszip';
import NoFileSignComponent from './components/no-file-sign/no-file-sign.component';
import * as constants from './utils/enums/Constants';
import BoundingBoxDrawingTool from './cornerstone-tools/BoundingBoxDrawingTool';
import DetectionMovementTool from './cornerstone-tools/DetectionMovementTool';
import PolygonDrawingTool from './cornerstone-tools/PolygonDrawingTool';
import BoundPolyFAB from './components/fab/bound-poly-fab.component';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
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
    invalidateDetections,
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
    toggleSettingsVisibility,
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
import DetectionContextMenu from './components/detection-context/detection-context-menu.component';
import EditLabel from './components/edit-label/edit-label.component';
import { buildCocoDataZip } from './utils/detections/Coco';
import { fileOpen } from 'browser-fs-access';
import ColorPicker from './components/color/color-picker.component';
import MetaDataComponent from './components/snackbars/meta-data.component';
import isElectron from 'is-electron';
import LazyImageMenu from './components/lazy-image/lazy-image-menu.component';
import AboutModal from './components/about-modal/about-modal.component';
import {
    loadElectronCookie,
    saveSettings,
} from './redux/slices/settings/settingsSlice';
import fetch from 'cross-fetch';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import FileUtils from './utils/files/file-utils';

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
            imageData: [],
            imageViewportTop: document.getElementById('dicomImageLeft'),
            imageViewportSide: document.getElementById('dicomImageRight'),
            viewport: cornerstone.getDefaultViewport(null, undefined),
            mousePosition: { x: 0, y: 0 },
            activeViewport: 'dicomImageLeft',
            tapDetector: new TapDetector(),
            commandServer: null,
            timer: null,
            thumbnails: null,
            showSnackbar: false,
            errorMessage: '',
            localWorkspaceError: '',
        };
        this.getFileFromLocal = this.getFileFromLocal.bind(this);
        this.localDirectoryChangeHandler =
            this.localDirectoryChangeHandler.bind(this);
        this.getFileFromLocalDirectory =
            this.getFileFromLocalDirectory.bind(this);
        this.getSpecificFileFromLocalDirectory =
            this.getSpecificFileFromLocalDirectory.bind(this);
        this.sendImageToLocalDirectory =
            this.sendImageToLocalDirectory.bind(this);
        this.nextImageClick = this.nextImageClick.bind(this);
        this.onImageRendered = this.onImageRendered.bind(this);
        this.loadAndViewImage = this.loadAndViewImage.bind(this);
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
        this.setShowSnackbar = this.setShowSnackbar.bind(this);
        this.handleNextImageError = this.handleNextImageError.bind(this);
    }

    /**
     * Generic handler for errors in the next image click function
     *
     * @param {Error} error
     * @param {boolean?} showSnackbar - if true, show the snackbar with error
     */
    handleNextImageError(error, showSnackbar = true) {
        this.props.setUpload(false);
        this.props.invalidateDetections();
        const errorMsg = typeof error === 'object' ? error.message : error;
        // show the snackbar based on param
        showSnackbar && this.setShowSnackbar(true, errorMsg);
    }

    /**
     * Updates a piece of state for the snack bar to show or hide
     *
     * @param {boolean} show - the value the state will be set to
     * @param {string} error
     */
    setShowSnackbar(show, error) {
        this.setState({ showSnackbar: show, errorMessage: error });
    }

    /**
     * Gets called by an update (in changes to props or state). It is called before render(),
     * returning false means we can skip the update. Where returning true means we need to update the render().
     * Namely, this is an edge case for if a user is connected to a server, then decides to use the
     * local mode option, this handles the disconnect.
     *
     * @param {Readonly<P>} nextProps
     * @param {Readonly<S>} nextState
     * @returns {boolean} - True, to update. False, to skip the update
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.showSnackbar !== nextState.showSnackbar) return true;
        if (
            this.props.displaySummarizedDetections &&
            !this.props.collapsedSideMenu &&
            nextProps.currentProcessingFile !== null &&
            this.props.currentProcessingFile === null
        ) {
            this.props.setCollapsedSideMenu({
                cornerstone: cornerstone,
                desktopMode: true,
                collapsedSideMenu: true,
            });
            return true;
        }
        if (this.state.thumbnails !== nextState.thumbnails) return true;
        if (
            isElectron() &&
            nextProps.localFileOutput !== '' &&
            !nextProps.loadingElectronCookie &&
            this.props.currentProcessingFile === null &&
            nextProps.currentProcessingFile === null &&
            !fetchingFromLocalDirectory &&
            this.state.localWorkspaceError !== 'end-of-queue'
        ) {
            fetchingFromLocalDirectory = true;
            this.getFileFromLocalDirectory();
            return true;
        }
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
        } else if (
            !isElectron() &&
            !this.props.loadingSettings &&
            this.props.firstDisplaySettings
        ) {
            this.props.toggleSettingsVisibility(true);
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
        // TODO: Investigate device type below
        Utils.calculateViewportDimensions(
            cornerstone,
            this.props.singleViewport,
            this.props.collapsedSideMenu,
            this.props.collapsedLazyMenu,
            true
        );

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
     * @param {HTMLElement} imageViewportTop - DOM element where the top-view x-ray image is rendered
     * @param {HTMLElement} imageViewportSide - DOM element where the side-view x-ray image is rendered
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
     * @param {boolean?} update
     * @returns {Promise}
     */
    async getFileFromCommandServer(update = false) {
        if (
            (this.props.currentProcessingFile === null &&
                this.state.commandServer !== null) ||
            update === true
        ) {
            fetch(`${this.props.apiPrefix}/files/getCurrentFile`, {
                method: 'GET',
            })
                .then((response) => {
                    response
                        .json()
                        .then((jsonParsed) => {
                            if (jsonParsed.status === 'Ok') {
                                this.loadNextImage(
                                    jsonParsed.file,
                                    jsonParsed.fileName,
                                    jsonParsed.numberOfFiles
                                );
                            } else {
                                this.onNoImageLeft();
                            }
                        })
                        .catch((error) => {
                            this.handleNextImageError(error);
                            this.onNoImageLeft();
                        });
                })
                .catch((error) => {
                    this.handleNextImageError(error);
                    this.onNoImageLeft();
                });
        }
    }

    /**
     * Function called from the TopBarComponent Icon OpenFile. Uses the browser-fs-access library to load a file as a blob. That
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
                    this.setState({
                        localWorkspaceError: '',
                    });
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
                        this.props.invalidateDetections();
                        this.setState({
                            localWorkspaceError: 'end-of-queue',
                        });
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
            if (this.props.selectedDetection) {
                this.props.resetSelectedDetectionBoxesUpdate();
                this.props.updateFABVisibility(true);
            }
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
        this.props.setReceiveTime(null);
        this.props.setCurrentProcessingFile(null);
        this.props.setNumFilesInQueue(0);
        this.props.updateFABVisibility(false);
        this.setState({
            imageViewportTop: updateImageViewport,
            imageViewportSide: updateImageViewportSide,
        });
    }

    /**
     * Takes new XML file (image) and does all parsing/pre-processing for detections/images to be loaded.
     * @param {string} image - Base-64 encoded string containing all data for annotations/images (Supported file formats: DICOS-TDR, MS COCO)
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
        const fileUtils = new FileUtils(image);
        fileUtils.loadData().then((result) => {
            this.props.setCurrentFileFormat(result.imageData[0]?.type);
            this.props.resetDetections();
            result.detectionData.forEach((detection) => {
                this.props.addDetection(detection);
            });
            const updateImageViewportTop = this.state.imageViewportTop;
            updateImageViewportTop.style.visibility = 'visible';
            this.props.newFileReceivedUpdate({
                singleViewport: result.imageData.length === 1,
                receiveTime: Date.now(),
            });
            this.props.setNumFilesInQueue(numberOfFiles);
            Utils.changeViewport(this.props.singleViewport);
            this.setState(
                {
                    imageViewportTop: updateImageViewportTop,
                    thumbnails,
                    imageData: result.imageData,
                },
                () => {
                    this.loadAndViewImage(result.imageData[0]?.type);
                }
            );
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
        const viewports = [
            {
                view: constants.viewport.TOP,
                element: this.state.imageViewportTop,
            },
        ];
        if (this.props.singleViewport === false)
            viewports.push({
                view: constants.viewport.SIDE,
                element: this.state.imageViewportSide,
            });
        if (
            this.props.annotationsFormat === constants.SETTINGS.ANNOTATIONS.COCO
        ) {
            // Convert to MS COCO
            buildCocoDataZip(
                this.state.imageData,
                this.props.detections,
                viewports,
                cornerstone,
                this.props.currentFileFormat
            )
                .then((cocoZip) => {
                    cocoZip
                        .generateAsync({ type: 'base64' })
                        .then((file) => {
                            this.sendImageToLocalDirectory(file)
                                .then(() => {
                                    this.setState({
                                        imageData: [],
                                    });
                                    this.props.setCurrentProcessingFile(null);
                                    this.resetSelectedDetectionBoxes(e);
                                    this.props.resetDetections();
                                    this.props.setReceiveTime(null);
                                })
                                .catch((error) => {
                                    this.handleNextImageError(error);
                                });
                        })
                        .catch((error) => {
                            this.handleNextImageError(error);
                        });
                })
                .catch((error) => {
                    this.handleNextImageError(error);
                });
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

            // Loop through each stack, being either top or side currently
            this.state.imageData.forEach((image) => {
                const stackElem = stackXML.createElement('stack');
                stackElem.setAttribute(
                    'name',
                    `SOP Instance UID #${stackCounter}`
                );
                stackElem.setAttribute('view', image.view);
                const pixelLayer = stackXML.createElement('layer');
                // We always know the first element in the stack.blob data is pixel element
                pixelLayer.setAttribute(
                    'src',
                    `data/${image.view}_pixel_data.dcs`
                );
                if (
                    this.props.currentFileFormat ===
                    constants.SETTINGS.ANNOTATIONS.TDR
                ) {
                    newOra.file(
                        `data/${image.view}_pixel_data.dcs`,
                        image.pixelData
                    );
                } else if (
                    this.props.currentFileFormat ===
                    constants.SETTINGS.ANNOTATIONS.COCO
                ) {
                    const currentViewportIndex = viewports.findIndex(
                        (view) => view.view === image.view
                    );
                    const tdrPromise = Dicos.pngToDicosPixelData(
                        cornerstone,
                        viewports[currentViewportIndex].element
                    )
                        .then((blob) => {
                            newOra.file(
                                `data/${image.view}_pixel_data.dcs`,
                                blob
                            );
                        })
                        .catch((error) => {
                            this.handleNextImageError(error);
                        });
                    listOfPromises.push(tdrPromise);
                }

                stackElem.appendChild(pixelLayer);
                if (image.view === 'top') {
                    // Loop through each detection and only the top view of the detection
                    const topDetections = getTopDetections(
                        this.props.detections
                    );
                    for (let j = 0; j < topDetections.length; j++) {
                        let threatPromise = Dicos.detectionObjectToBlob(
                            topDetections[j],
                            image.pixelData,
                            this.props.currentFileFormat
                        )
                            .then((threatBlob) => {
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
                            })
                            .catch((error) => {
                                this.handleNextImageError(error);
                            });
                        listOfPromises.push(threatPromise);
                    }
                    // Loop through each detection and only the side view of the detection
                } else if (image.view === 'side') {
                    const sideDetections = getSideDetections(
                        this.props.detections
                    );
                    for (let i = 0; i < sideDetections.length; i++) {
                        let threatPromise = Dicos.detectionObjectToBlob(
                            sideDetections[i],
                            image.pixelData,
                            this.props.currentFileFormat
                        )
                            .then((threatBlob) => {
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
                            })
                            .catch((error) => {
                                this.handleNextImageError(error);
                            });
                        listOfPromises.push(threatPromise);
                    }
                }
                stackCounter++;
                imageElem.appendChild(stackElem);
            });
            const promiseOfList = Promise.all(listOfPromises);
            promiseOfList
                .then(() => {
                    stackXML.appendChild(imageElem);

                    newOra.file(
                        'stack.xml',
                        new Blob(
                            [
                                prolog +
                                    new XMLSerializer().serializeToString(
                                        stackXML
                                    ),
                            ],
                            { type: 'application/xml ' }
                        )
                    );
                    newOra
                        .generateAsync({ type: 'base64' })
                        .then((file) => {
                            this.sendImageToLocalDirectory(file)
                                .then(() => {
                                    this.setState({
                                        imageData: [],
                                    });
                                    this.props.setCurrentProcessingFile(null);
                                    this.resetSelectedDetectionBoxes(e);
                                    this.props.resetDetections();
                                    this.props.setReceiveTime(null);
                                })
                                .catch((error) => {
                                    this.handleNextImageError(error);
                                });
                        })
                        .catch((error) => {
                            this.handleNextImageError(error);
                        });
                })
                .catch((error) => {
                    this.handleNextImageError(error);
                });
        }
    }

    /**
     * Loads pixel data from a DICOS+TDR file using CornerstoneJS. It invokes the displayDICOSinfo method in order
     * to render the image and pull the detection-specific data.
     * @param {string} type
     */
    loadAndViewImage(type) {
        const topIndex = this.state.imageData.findIndex(
            (view) => view.view === constants.viewport.TOP
        );
        const sideIndex = this.state.imageData.findIndex(
            (view) => view.view === constants.viewport.SIDE
        );
        if (type === constants.SETTINGS.ANNOTATIONS.TDR) {
            this.displayDICOSimage(topIndex, sideIndex);
        } else if (type === constants.SETTINGS.ANNOTATIONS.COCO) {
            this.displayCOCOimage(topIndex, sideIndex);
        }
    }

    /**
     * Renders the top and side view x-ray images when annotations are encoded as JSON files with the MS COCO format.
     * @param {number} topIndex
     * @param {number} sideIndex
     */
    async displayCOCOimage(topIndex, sideIndex) {
        // the first image has the pixel data so prepare it to be displayed using cornerstoneJS
        const self = this;
        if (topIndex !== -1) {
            const imageIdTop = 'coco:0';
            Utils.loadImage(
                imageIdTop,
                self.state.imageData[topIndex].pixelData
            ).then(function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportTop,
                    image
                );
                viewport.translation.y = constants.viewportStyle.ORIGIN;
                viewport.scale = self.props.zoomLevelTop;
                const displayedArea = cornerstone.getDisplayedArea(
                    image,
                    self.state.imageViewportTop
                );
                // eslint-disable-next-line react/no-direct-mutation-state
                if (displayedArea !== undefined)
                    self.state.imageData[0].dimensions = displayedArea.brhc;
                self.setState({ viewport: viewport });
                cornerstone.displayImage(
                    self.state.imageViewportTop,
                    image,
                    viewport
                );
            });
        }
        if (this.props.singleViewport === false && sideIndex !== -1) {
            const imageIdSide = 'coco:1';
            const updatedImageViewportSide = this.state.imageViewportSide;
            updatedImageViewportSide.style.visibility = 'visible';
            this.setState({ imageViewportSide: updatedImageViewportSide });
            Utils.loadImage(
                imageIdSide,
                self.state.imageData[sideIndex].pixelData
            ).then(function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportSide,
                    image
                );
                const displayedArea = cornerstone.getDisplayedArea(
                    image,
                    self.state.imageViewportSide
                );
                // eslint-disable-next-line react/no-direct-mutation-state
                if (displayedArea !== undefined)
                    self.state.imageData[1].dimensions = displayedArea.brhc;
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
        Utils.calculateViewportDimensions(
            cornerstone,
            this.props.singleViewport,
            this.props.collapsedSideMenu,
            this.props.collapsedLazyMenu,
            true
        );
        this.recalculateZoomLevel();
    }

    /**
     * Renders the top and side view x-ray images when encoded in DICOS+TDR files
     * @param {number} topIndex
     * @param {number} sideIndex
     */
    displayDICOSimage(topIndex, sideIndex) {
        // the first image has the pixel data so prepare it to be displayed using cornerstoneJS
        const self = this;

        if (topIndex !== -1) {
            const pixelDataTop =
                cornerstoneWADOImageLoader.wadouri.fileManager.add(
                    self.state.imageData[topIndex].pixelData
                );

            cornerstone.loadImage(pixelDataTop).then(function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportTop,
                    image
                );
                viewport.translation.y = constants.viewportStyle.ORIGIN;
                viewport.scale = self.props.zoomLevelTop;
                const displayedArea = cornerstone.getDisplayedArea(
                    image,
                    self.state.imageViewportTop
                );
                // eslint-disable-next-line react/no-direct-mutation-state
                if (displayedArea !== undefined)
                    self.state.imageData[topIndex].dimensions =
                        displayedArea.brhc;
                self.setState({ viewport: viewport });
                cornerstone.displayImage(
                    self.state.imageViewportTop,
                    image,
                    viewport
                );
            });
        }
        if (this.props.singleViewport === false && sideIndex !== -1) {
            const updatedImageViewportSide = this.state.imageViewportSide;
            updatedImageViewportSide.style.visibility = 'visible';
            this.setState({ imageViewportSide: updatedImageViewportSide });

            const pixelDataSide =
                cornerstoneWADOImageLoader.wadouri.fileManager.add(
                    self.state.imageData[sideIndex].pixelData
                );
            cornerstone.loadImage(pixelDataSide).then(function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportSide,
                    image
                );
                const displayedArea = cornerstone.getDisplayedArea(
                    image,
                    self.state.imageViewportSide
                );
                // eslint-disable-next-line react/no-direct-mutation-state
                if (displayedArea !== undefined)
                    self.state.imageData[sideIndex].dimensions =
                        displayedArea.brhc;
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

        Utils.calculateViewportDimensions(
            cornerstone,
            this.props.singleViewport,
            this.props.collapsedSideMenu,
            this.props.collapsedLazyMenu,
            true
        );
        this.recalculateZoomLevel();
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
                if (
                    this.props.selectedDetection &&
                    this.props.editionMode === constants.editionMode.NO_TOOL
                ) {
                    this.renderDetectionContextMenu(
                        e,
                        this.props.selectedDetection,
                        eventData.viewport.scale
                    );
                }
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
                if (
                    this.props.selectedDetection &&
                    this.props.editionMode === constants.editionMode.NO_TOOL
                ) {
                    this.renderDetectionContextMenu(
                        e,
                        this.props.selectedDetection,
                        eventData.viewport.scale
                    );
                }
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
     * @param {HTMLElement} target Targeted HTMLElement caught via mouse event data
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
                Utils.truncateString(
                    data[j].className,
                    constants.MAX_LABEL_LENGTH
                ),
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
     * @param {HTMLElement} viewport - The Cornerstone Viewport containing the event
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
                    polygonMask,
                };
            }
            const self = this;

            if (
                this.props.currentFileFormat ===
                constants.SETTINGS.ANNOTATIONS.TDR
            ) {
                if (data[0] === undefined) {
                    self.props.emptyAreaClickUpdate();
                    self.resetSelectedDetectionBoxes(event);
                    return;
                }
                // When the updating detection is false, this means we are creating a new detection
                if (data[0].updatingDetection === false) {
                    const uuid = uuidv4();
                    if (
                        boundingBoxArea > constants.BOUNDING_BOX_AREA_THRESHOLD
                    ) {
                        self.props.addDetection({
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
                                polygonMask: polygonMask,
                                binaryMask,
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
                            this.renderDetectionContextMenu(event, {
                                boundingBox: coords,
                                view:
                                    viewport === self.state.imageViewportTop
                                        ? constants.viewport.TOP
                                        : constants.viewport.SIDE,
                            });
                            return;
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
                    self.renderDetectionContextMenu(
                        event,
                        this.props.selectedDetection
                    );
                    self.appUpdateImage();
                }
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
     * @param {HTMLElement} viewport - The Cornerstone Viewport receiving the event
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
            this.props.addDetection(newDetection);
            this.resetCornerstoneTool();
            this.props.clearAllSelection();
            this.appUpdateImage();
            this.props.emptyAreaClickUpdate();
            setTimeout(() => {
                this.startListeningClickEvents();
            }, 500);
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
     * @param {HTMLElement} viewportInfo viewport info
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
     * @param detection
     * @param updatedZoomLevel
     * a detection is moved during a drag event, the data in state is out of date until after this
     * function is called. Use the param data to render the context menu.
     *
     */
    renderDetectionContextMenu(event, detection, updatedZoomLevel = null) {
        if (detection !== null && detection !== undefined) {
            const viewportInfo = Utils.eventToViewportInfo(
                Utils.mockCornerstoneEvent(
                    event,
                    detection.view === constants.viewport.TOP
                        ? this.state.imageViewportTop
                        : this.state.imageViewportSide
                )
            );
            let zoomLevel;
            if (updatedZoomLevel !== null) {
                zoomLevel = updatedZoomLevel;
            } else {
                zoomLevel =
                    detection.view === constants.viewport.TOP
                        ? this.props.zoomLevelTop
                        : this.props.zoomLevelSide;
            }
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
                detectionContextGap =
                    viewportInfo.offset / zoomLevel - boundingWidth;
                viewport = this.state.imageViewportTop;
            } else {
                originCoordX = 0;
                detectionContextGap =
                    viewportInfo.offset / zoomLevel -
                    boundingHeight / boundingWidth;
                viewport = this.state.imageViewportSide;
            }
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
                let currentViewport, zoomLevel;
                if (view === constants.viewport.TOP) {
                    currentViewport = this.state.imageViewportTop;
                    zoomLevel = this.props.zoomLevelTop;
                } else {
                    currentViewport = this.state.imageViewportSide;
                    zoomLevel = this.props.zoomLevelSide;
                }

                // TODO: Future refactoring of how the label to be rendered is calculated. The size calculation at certain zoom levels needs to be taken into account
                const fontArr = constants.detectionStyle.LABEL_FONT.split(' ');
                const fontSizeArr = fontArr[1].split('px');
                fontSizeArr[0] = fontSizeArr[0] * zoomLevel;
                const newFontSize = fontSizeArr.join('px');
                const newFont =
                    fontArr[0] + ' ' + newFontSize + ' ' + fontArr[2];

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
                const horizontalGap = offsetLeft / zoomLevel;
                const viewport =
                    currentViewport.id === 'dicomImageRight'
                        ? this.state.imageViewportSide
                        : this.state.imageViewportTop;
                const newViewport =
                    currentViewport.id === 'dicomImageRight'
                        ? constants.viewport.SIDE
                        : constants.viewport.TOP;
                const verticalGap = labelSize.height / Math.pow(zoomLevel, 2);
                const { x, y } = cornerstone.pixelToCanvas(viewport, {
                    x: bbox[0] + horizontalGap,
                    y: bbox[1] - verticalGap - 6,
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
    onMouseWheel() {
        if (this.props.selectedDetection !== null) {
            this.props.updateRecentScroll(true);
            clearTimeout(this.state.timer);
            this.setState({
                timer: setTimeout(() => {
                    if (
                        this.props.editionMode === constants.editionMode.LABEL
                    ) {
                        let payload = {
                            editionMode: constants.editionMode.LABEL,
                            isEditLabelWidgetVisible: true,
                        };
                        const editLabelWidgetPosInfo =
                            this.getEditLabelWidgetPos(
                                this.props.selectedDetection
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
                        this.props.updateEditionMode(payload);
                    }
                    this.props.updateRecentScroll(false);
                }, 250),
            });
        }
    }

    /**
     * Mouse leave event handler. It mainly serves as a way to make sure a user does not try to drag a detection out of
     * the window.
     */
    onMouseLeave() {
        if (this.props.selectedDetection !== null) {
            // TODO: Future refactoring
            this.props.emptyAreaClickUpdate();
            this.props.onMouseLeaveNoFilesUpdate();
            this.props.clearAllSelection();
            this.props.resetSelectedDetectionBoxesUpdate();
            this.resetCornerstoneTool();
            this.appUpdateImage();
        }
    }

    render() {
        if (this.props.loadingSettings) {
            return (
                <Box
                    sx={{
                        position: 'absolute',
                        display: 'flex',
                        left: '45%',
                        top: '45%',
                    }}>
                    <CircularProgress size={120} />
                </Box>
            );
        } else {
            return (
                <div>
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        open={this.state.showSnackbar}
                        autoHideDuration={3000}
                        onClose={(event, reason) => {
                            if (reason !== 'clickaway') {
                                this.setShowSnackbar(false, '');
                            }
                        }}>
                        <Alert
                            severity="error"
                            onClose={(event, reason) => {
                                if (reason !== 'clickaway') {
                                    this.setShowSnackbar(false, '');
                                }
                            }}>
                            {this.state.errorMessage}
                        </Alert>
                    </Snackbar>
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
                        <TopBarComponent
                            getFileFromLocal={this.getFileFromLocal}
                            cornerstone={cornerstone}
                        />
                        <SideMenuComponent
                            nextImageClick={this.nextImageClick}
                            resetCornerstoneTools={this.resetCornerstoneTool}
                            renderDetectionContextMenu={
                                this.renderDetectionContextMenu
                            }
                        />
                        <SaveButtonComponent
                            collapseBtn={true}
                            nextImageClick={this.nextImageClick}
                        />
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
                        <LazyImageMenu
                            getSpecificFileFromLocalDirectory={
                                this.getSpecificFileFromLocalDirectory
                            }
                            thumbnails={this.state.thumbnails}
                        />
                        <NoFileSignComponent />
                        <MetaDataComponent />
                    </div>
                    <AboutModal />
                </div>
            );
        }
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
        deviceType: settings.settings.deviceType,
        localFileOutput: settings.settings.localFileOutput,
        loadingElectronCookie: settings.settings.loadingElectronCookie,
        apiPrefix: settings.apiPrefix,
        loadingSettings: settings.loadingSettings,
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
    invalidateDetections,
    toggleSettingsVisibility,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
