import './App.css';
import React from 'react';
import { Component } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'eac-cornerstone-tools';
import dicomParser from 'dicom-parser';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import io from 'socket.io-client';
import ORA from './utils/Ora.js';
import Stack from './Stack.js';
import Utils from './utils/Utils.js';
import Dicos from './utils/Dicos.js';
import axios from 'axios';
import SideMenu from './components/SideMenu/SideMenu';
import TopBar from './components/TopBar/TopBar';
import JSZip from 'jszip';
import NoFileSign from './components/NoFileSign';
import * as constants from './utils/Constants';
import BoundingBoxDrawingTool from './cornerstone-tools/BoundingBoxDrawingTool';
import PolygonDrawingTool from './cornerstone-tools/PolygonDrawingTool';
import BoundPolyFAB from './components/FAB/BoundPolyFAB';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
    setCommandServerConnection,
    setFileServerConnection,
    setUpload,
    setDownload,
    setNumFilesInQueue,
    setProcessingHost,
    setCurrentProcessingFile,
} from './redux/slices/server/serverSlice';
import {
    resetDetections,
    addDetection,
    addDetections,
    clearAllSelection,
    selectDetection,
    selectDetectionSet,
    getTopDetections,
    getSideDetections,
    updateDetection,
    updatedDetectionSet,
    editDetectionLabel,
    deleteDetection,
    validateDetections,
    updateDetectionSetVisibility,
    updateDetectionVisibility,
    hasDetectionCoordinatesChanged,
} from './redux/slices/detections/detectionsSlice';
import {
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
} from './redux/slices/ui/uiSlice';
import DetectionContextMenu from './components/DetectionContext/DetectionContextMenu';
import EditLabel from './components/EditLabel';
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

//TODO: re-add PropTypes and prop validation
/* eslint-disable react/prop-types */

// Socket IO
let COMMAND_SERVER = null;
let FILE_SERVER = null;

class App extends Component {
    /**
     * constructor - All the related elements of the class are initialized:
     * Callback methods are bound to the class
     * The state is initialized
     * A click listener is bound to the image viewport in order to detect click events
     * A cornerstoneImageRendered listener is bound to the image viewport to trigger some actions in response to the image rendering
     * CornerstoneJS Tools are initialized
     *
     * @param  {type} props None
     * @return {type}       None
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
        };
        this.sendImageToFileServer = this.sendImageToFileServer.bind(this);
        this.sendImageToCommandServer = this.sendImageToCommandServer.bind(
            this
        );
        this.nextImageClick = this.nextImageClick.bind(this);
        this.onImageRendered = this.onImageRendered.bind(this);
        this.loadAndViewImage = this.loadAndViewImage.bind(this);
        this.loadDICOSdata = this.loadDICOSdata.bind(this);
        this.onMouseClicked = this.onMouseClicked.bind(this);
        this.onMouseMoved = this.onMouseMoved.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.resetSelectedDetectionBoxes = this.resetSelectedDetectionBoxes.bind(
            this
        );
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.updateNumberOfFiles = this.updateNumberOfFiles.bind(this);
        this.appUpdateImage = this.appUpdateImage.bind(this);
        this.resizeListener = this.resizeListener.bind(this);
        this.calculateviewPortWidthAndHeight = this.calculateviewPortWidthAndHeight.bind(
            this
        );
        this.recalculateZoomLevel = this.recalculateZoomLevel.bind(this);
        this.onBoundingBoxSelected = this.onBoundingBoxSelected.bind(this);
        this.onPolygonMaskSelected = this.onPolygonMaskSelected.bind(this);
        this.resetCornerstoneTool = this.resetCornerstoneTool.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onNewPolygonMaskCreated = this.onNewPolygonMaskCreated.bind(this);
        this.renderDetectionContextMenu = this.renderDetectionContextMenu.bind(
            this
        );
        this.getContextMenuPos = this.getContextMenuPos.bind(this);
        this.getEditLabelWidgetPos = this.getEditLabelWidgetPos.bind(this);
        this.selectEditionMode = this.selectEditionMode.bind(this);
        this.editDetectionLabel = this.editDetectionLabel.bind(this);
        this.deleteDetection = this.deleteDetection.bind(this);
        this.startListeningClickEvents = this.startListeningClickEvents.bind(
            this
        );
        this.stopListeningClickEvents = this.stopListeningClickEvents.bind(
            this
        );
    }

    /**
     * componentDidMount - Method invoked after all elements on the page are rendered properly
     *
     * @return {type}  None
     */
    componentDidMount() {
        // Connect socket servers
        const hostname = window.location.hostname;
        constants.server.FILE_SERVER_ADDRESS =
            constants.server.PROTOCOL +
            hostname +
            constants.server.FILE_SERVER_PORT;
        FILE_SERVER = io(constants.server.FILE_SERVER_ADDRESS);
        COMMAND_SERVER = io(constants.COMMAND_SERVER);

        this.props.setProcessingHost(hostname);
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
            'cornerstonetoolstouchpinch',
            this.resetSelectedDetectionBoxes
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
            this.resetSelectedDetectionBoxes
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
            'cornerstonetoolstouchpinch',
            this.resetSelectedDetectionBoxes
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
        this.calculateviewPortWidthAndHeight();
        this.props.updateFABVisibility(this.props.numFilesInQueue > 0);
        let reactObj = this;
        reactObj.getFilesFromCommandServer();
        reactObj.updateNumberOfFiles();
        reactObj.setupCornerstoneJS(
            reactObj.state.imageViewportTop,
            reactObj.state.imageViewportSide
        );
        this.props.setCommandServerConnection({
            action: 'connect',
            socket: COMMAND_SERVER,
        });
        this.props.setFileServerConnection({
            action: 'connect',
            socket: FILE_SERVER,
        });
        this.getFilesFromCommandServer();
        this.updateNumberOfFiles();
        this.setupCornerstoneJS(
            this.state.imageViewportTop,
            this.state.imageViewportSide
        );
        this.recalculateZoomLevel();
        document.body.addEventListener('mousemove', this.onMouseMoved);
        document.body.addEventListener('mouseleave', this.onMouseLeave);
    }

    /**
     * startListeningClickEvents - Method that binds a click event listener to the two cornerstonejs viewports
     *
     */
    startListeningClickEvents() {
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchstart',
            this.onMouseClicked
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolstouchstart',
            this.onMouseClicked
        );
    }

    /**
     * startListeningClickEvents - Method that unbinds a click event listener to the two cornerstonejs viewports
     *
     */
    stopListeningClickEvents() {
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolstouchstart',
            this.onMouseClicked
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolstouchstart',
            this.onMouseClicked
        );
    }

    /**
     * calculateviewPortWidthAndHeight - Function to calculate the ViewPorts width and Height.
     *
     * @param  None
     * @returns {type} None
     */
    calculateviewPortWidthAndHeight() {
        document.getElementsByClassName('twoViewportsSide')[0].style.width =
            (window.innerWidth - constants.sideMenuWidth) / 2 +
            constants.RESOLUTION_UNIT;
        document.getElementsByClassName('twoViewportsTop')[0].style.width =
            (window.innerWidth - constants.sideMenuWidth) / 2 +
            constants.RESOLUTION_UNIT;
        document.getElementById(
            'verticalDivider'
        ).style.left = document.getElementsByClassName(
            'twoViewportsTop'
        )[0].style.width;
        document.getElementsByClassName('twoViewportsSide')[0].style.left =
            document.getElementsByClassName('twoViewportsTop')[0].style.width +
            document.getElementById('verticalDivider').style.width;
    }

    /**
     * recalculateZoomLevel - Function to update cornerstoneJS viewports' zoom level based on their width
     *
     * @param  None
     * @returns {type} None
     */
    recalculateZoomLevel() {
        let canvasElements = document.getElementsByClassName(
            'cornerstone-canvas'
        );
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
    }

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
            'cornerstonetoolstouchpinch',
            this.resetSelectedDetectionBoxes
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
            'cornerstonetoolstouchpinch',
            this.resetSelectedDetectionBoxes
        );
        this.stopListeningClickEvents();
        window.removeEventListener('resize', this.resizeListener);
        document.body.removeEventListener('mousemove', this.onMouseMoved);
        document.body.removeEventListener('mouseleave', this.onMouseLeave);
    }

    /**
     * resizeListener - Function event listener for the window resize event. If a detection is selected,
     *                  we clear the detections and hide the buttons.
     *
     * @param {Event} e
     * @returns {type} None
     */
    // eslint-disable-next-line no-unused-vars
    resizeListener(e) {
        this.calculateviewPortWidthAndHeight();
        if (this.props.selectDetection) {
            this.props.clearAllSelection();
            this.appUpdateImage();
        }
    }

    /**
     * setupCornerstoneJS - CornerstoneJS Tools are initialized
     *
     * @param  {type} imageViewportTop DOM element where the top-view x-ray image is rendered
     * @param  {type} imageViewportSide DOM element where the side-view x-ray image is rendered
     * @return {type}               None
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
            }
        }
    }

    /**
     * resetCornerstoneTool - Reset Cornerstone Tools to their default state.
     *                        Invoked when user leaves annotation or edition mode
     * @param   {type} None
     * @return   {type} None
     */

    resetCornerstoneTool() {
        cornerstoneTools.clearToolState(
            this.state.imageViewportTop,
            'BoundingBoxDrawing'
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
                'PolygonDrawingTool'
            );
        }
        cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
            cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
            temporaryLabel: undefined,
        });
        cornerstoneTools.setToolOptions('PolygonDrawingTool', {
            cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
        });
        cornerstoneTools.setToolDisabled('BoundingBoxDrawing');
        cornerstoneTools.setToolDisabled('PolygonDrawingTool');
        cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
        cornerstoneTools.setToolActive('ZoomMouseWheel', {});
        cornerstoneTools.setToolActive('ZoomTouchPinch', {});
    }

    /**
     * getFilesFromCommandServer - Socket Listener to get files from command server then send them
     *                           - to the file server directly after
     * @param {type} - None
     * @return {type} - Promise
     */
    async getFilesFromCommandServer() {
        COMMAND_SERVER.on('img', (data) => {
            // eslint-disable-next-line no-unused-vars
            this.sendImageToFileServer(Utils.b64toBlob(data)).then((res) => {
                // If we got an image and we are null, we know we can now fetch one
                // This is how it triggers to display a new file if none existed and a new one was added
                this.props.setDownload(false);
                if (this.props.currentProcessingFile === null) {
                    this.getNextImage();
                }
            });
        });
    }

    /**
     * updateNumberOfFiles - Opens a socket to constantly monitor the number of files with the file server
     * @param {type} - None
     * @return {type} - Promise
     */
    async updateNumberOfFiles() {
        FILE_SERVER.on('numberOfFiles', (data) => {
            if (!this.props.numFilesInQueue > 0 && data > 0) {
                const updateImageViewportTop = this.state.imageViewportTop;
                updateImageViewportTop.style.visibility = 'visible';
                this.setState({
                    imageViewportTop: updateImageViewportTop,
                });
                this.getNextImage();
            }
            this.props.updateFABVisibility(data > 0);
            this.props.setNumFilesInQueue(data);
        });
    }

    /**
     * sendImageToFileServer - Socket IO to send an image to the file server
     * @param {type} - file - which file we are sending
     * @return {type} - None
     */
    async sendImageToFileServer(file) {
        this.props.setDownload(true);
        FILE_SERVER.emit('fileFromClient', file);
    }

    /**
     * sendImageToCommandServer - Socket IO to send a file to the server
     * @param {type} - file - which file we are sending
     * @return {type} - None
     */
    async sendImageToCommandServer(file) {
        this.props.setUpload(true);
        COMMAND_SERVER.emit('fileFromClient', file);
    }

    /**
     * onNoImageLeft - Method invoked when there isn't any file in the file queue.
     * A 'No file' image is displayed instead of the cornerstoneJs canvas
     *
     * @param {type}  - None
     * @return {type} -  None
     */
    onNoImageLeft() {
        let updateImageViewport = this.state.imageViewportTop;
        let updateImageViewportSide = this.state.imageViewportSide;
        updateImageViewport.style.visibility = 'hidden';
        updateImageViewportSide.style.visibility = 'hidden';
        this.props.updateFABVisibility(false);
        this.setState({
            imageViewportTop: updateImageViewport,
            imageViewportSide: updateImageViewportSide,
        });
    }

    /**
     * getNextImage() - Attempts to retrieve the next image from the file server via get request
     *                - Then sets the state to the blob and calls the loadAndViewImage() function
     * @param {type} - None
     * @return {type} - None
     */
    getNextImage() {
        // TODO: James B. - These fetch calls can be refactored into the serverSlice with Async Thunk calls.
        axios
            .get(`${constants.server.FILE_SERVER_ADDRESS}/next`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            })
            .then(async (res) => {
                // We get our latest file upon the main component mounting
                if (res.data.response === 'error ') {
                    console.log('Error getting next image');
                } else if (res.data.response === 'no-next-image') {
                    this.props.setCurrentProcessingFile(null);
                    document.getElementById(
                        'verticalDivider'
                    ).style.visibility = 'hidden';
                    // Need to clear the canvas here or make a no image to load display
                    this.onNoImageLeft();
                } else {
                    var fileNameProcessing = Utils.getFilenameFromURI(
                        res.data.fileNameProcessing
                    );
                    this.props.setCurrentProcessingFile(fileNameProcessing);
                    const myZip = new JSZip();
                    var listOfPromises = [];
                    // This is our list of stacks we will append to the myOra object in our promise all
                    var listOfStacks = [];
                    // Lets load the compressed ORA file as base64
                    myZip.loadAsync(res.data.b64, { base64: true }).then(() => {
                        // First, after loading, we need to check our stack.xml
                        myZip
                            .file('stack.xml')
                            .async('string')
                            .then(async (stackFile) => {
                                const parser = new DOMParser();
                                const xmlDoc = parser.parseFromString(
                                    stackFile,
                                    'text/xml'
                                );
                                const xmlStack = xmlDoc.getElementsByTagName(
                                    'stack'
                                );
                                // We loop through each stack. Creating a new stack object to store our info
                                // for now, we are just grabbing the location of the dicos file in the ora file
                                for (let stackData of xmlStack) {
                                    let currentStack = new Stack(
                                        stackData.getAttribute('name'),
                                        stackData.getAttribute('view')
                                    );
                                    let layerData = stackData.getElementsByTagName(
                                        'layer'
                                    );
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
                                                    listOfStacks[
                                                        j
                                                    ].pixelData = Utils.base64ToArrayBuffer(
                                                        imageData
                                                    );
                                                listOfStacks[j].blobData.push({
                                                    blob: Utils.b64toBlob(
                                                        imageData
                                                    ),
                                                    uuid: uuidv4(),
                                                });
                                            });
                                    }
                                }
                                const promiseOfList = Promise.all(
                                    listOfPromises
                                );
                                // Once we have all the layers...
                                promiseOfList.then(() => {
                                    this.state.myOra.stackData = listOfStacks;
                                    this.props.newFileReceivedUpdate({
                                        singleViewport: listOfStacks.length < 2,
                                        receiveTime: Date.now(),
                                    });
                                    Utils.changeViewport(
                                        this.props.singleViewport
                                    );
                                    if (this.props.singleViewport) {
                                        cornerstone.resize(
                                            this.state.imageViewportTop,
                                            true
                                        );
                                    } else {
                                        cornerstone.resize(
                                            this.state.imageViewportTop
                                        );
                                    }
                                    this.props.resetDetections();
                                    this.loadAndViewImage();
                                });
                            });
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * nextImageClick() - When the operator taps next, we send to the file server to remove the
     *                  - current image, then when that is complete, we send the image to the command
     *                  - server. Finally, calling getNextImage to display another image if there is one
     * @param {type} - Event
     * @return {type} - None
     */
    nextImageClick(e) {
        // TODO: James B. - These fetch calls can be refactored into the serverSlice with Async Thunk calls.
        axios
            .get(`${constants.server.FILE_SERVER_ADDRESS}/confirm`)
            .then((res) => {
                if (res.data.confirm === 'image-removed') {
                    this.props.validateDetections();
                    const stackXML = document.implementation.createDocument(
                        '',
                        '',
                        null
                    );
                    const prolog = '<?xml version="1.0" encoding="utf-8"?>';
                    const imageElem = stackXML.createElement('image');
                    const mimeType = new Blob(['image/openraster'], {
                        type: 'text/plain;charset=utf-8',
                    });
                    const newOra = new JSZip();
                    newOra.file('mimetype', mimeType, { compression: null });
                    let stackCounter = 1;
                    const listOfPromises = [];
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
                        newOra.file(
                            `data/${stack.view}_pixel_data.dcs`,
                            stack.blobData[0].blob
                        );
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
                                        .blobData[0].blob
                                ).then((threatBlob) => {
                                    newOra.file(
                                        `data/top_threat_detection_${j + 1}_${
                                            topDetections[j].algorithm
                                        }.dcs`,
                                        threatBlob
                                    );
                                    let newLayer = stackXML.createElement(
                                        'layer'
                                    );
                                    newLayer.setAttribute(
                                        'src',
                                        `data/top_threat_detection_${j + 1}_${
                                            topDetections[j].algorithm
                                        }.dcs`
                                    );
                                    newLayer.setAttribute(
                                        'UUID',
                                        `${topDetections[j].uuid}`
                                    );
                                    stackElem.appendChild(newLayer);
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
                                        .blobData[0].blob
                                ).then((threatBlob) => {
                                    newOra.file(
                                        `data/side_threat_detection_${i + 1}_${
                                            sideDetections[i].algorithm
                                        }.dcs`,
                                        threatBlob
                                    );
                                    let newLayer = stackXML.createElement(
                                        'layer'
                                    );
                                    newLayer.setAttribute(
                                        'src',
                                        `data/side_threat_detection_${i + 1}_${
                                            sideDetections[i].algorithm
                                        }.dcs`
                                    );
                                    newLayer.setAttribute(
                                        'UUID',
                                        `${sideDetections[i].uuid}`
                                    );
                                    stackElem.appendChild(newLayer);
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
                                        new XMLSerializer().serializeToString(
                                            stackXML
                                        ),
                                ],
                                { type: 'application/xml ' }
                            )
                        );
                        newOra
                            .generateAsync({ type: 'blob' })
                            .then((oraBlob) => {
                                this.sendImageToCommandServer(oraBlob).then(
                                    // eslint-disable-next-line no-unused-vars
                                    (res) => {
                                        this.resetSelectedDetectionBoxes(e);
                                        this.props.setUpload(false);
                                        this.getNextImage();
                                    }
                                );
                            });
                    });
                } else if (res.data.confirm === 'image-not-removed') {
                    console.log("File server couldn't remove the next image");
                } else if (res.data.confirm === 'no-next-image') {
                    alert('No next image');
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * loadAndViewImage - Method that loads the image data from the DICOS+TDR file using CornerstoneJS.
     * The method invokes the displayDICOSinfo method in order to render the image and pull the detection-specific data.
     *
     * @param  {type} imageId id that references the DICOS+TDR file to be loaded
     * @return {type}         None
     */
    loadAndViewImage() {
        const self = this;
        const dataImagesLeft = [];
        const dataImagesRight = [];
        self.displayDICOSimage();
        // all other images do not have pixel data -- cornerstoneJS will fail and send an error
        // if pixel data is missing in the dicom/dicos file. To parse out only the data,
        // we use dicomParser instead. For each .dcs file found at an index spot > 1, load
        // the file data and call loadDICOSdata() to store the data in a DetectionSet
        if (self.state.myOra.stackData[0].blobData.length === 1) {
            dataImagesLeft[0] = self.state.myOra.stackData[0].blobData[0];
        } else {
            for (
                var i = 1;
                i < self.state.myOra.stackData[0].blobData.length;
                i++
            ) {
                dataImagesLeft[i - 1] =
                    self.state.myOra.stackData[0].blobData[i];
            }
        }
        if (this.props.singleViewport === false) {
            if (self.state.myOra.stackData[1] !== undefined) {
                for (
                    var j = 1;
                    j < self.state.myOra.stackData[1].blobData.length;
                    j++
                ) {
                    dataImagesRight[j - 1] =
                        self.state.myOra.stackData[1].blobData[j];
                }
            }
        }
        self.loadDICOSdata(dataImagesLeft, dataImagesRight);
    }

    /**
     * displayDICOSinfo - Method that renders the  top and side view x-ray images encoded in the DICOS+TDR file and
     *
     * @param  {type} image DICOS+TDR data
     * @return {type}       None
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

            const pixelDataSide = cornerstoneWADOImageLoader.wadouri.fileManager.add(
                self.state.myOra.stackData[1].blobData[0].blob
            );
            cornerstone.loadImage(pixelDataSide).then(function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportSide,
                    image
                );
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
    }

    /**
     * loadDICOSdata - Method that a DICOS+TDR file to pull all the data regarding the threat detections
     *
     * @param  {type} images list of DICOS+TDR data from  algorithm
     * @return {type}       None
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
                    console.log('No Threat Sequence');
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
                    console.log('No Potential Threat Objects detected');
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
                    // eslint-disable-next-line no-unused-vars
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
                        binaryMask: [[]],
                        polygonMask: [],
                        uuid: imagesLeft[i].uuid,
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
                        console.log('No Threat Sequence');
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
                        console.log('No Potential Threat Objects detected');
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
                        var pixelData = Dicos.retrieveMaskData(image);
                        self.props.addDetection({
                            algorithm: algorithmName,
                            className: objectClass,
                            confidence: confidenceLevel,
                            view: constants.viewport.SIDE,
                            boundingBox: boundingBoxCoords,
                            binaryMask: pixelData,
                            polygonMask: [],
                            uuid: currentRightImage.uuid,
                        });
                    }
                });
                read.readAsArrayBuffer(imagesRight[k].blob);
            }
        }
    }

    /**
     * onImageRendered - Callback method automatically invoked when CornerstoneJS renders a new image.
     * It triggers the rendering of the several annotations associated to the image
     *
     * @param  {type} e Event
     * @return {type}   None
     */
    onImageRendered(e) {
        const eventData = e.detail;
        const context = eventData.canvasContext;
        if (eventData.element.id === 'dicomImageLeft') {
            cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
                zoomLevelTop: eventData.viewport.scale,
            });
            if (this.props.zoomLevelTop !== eventData.viewport.scale) {
                this.props.updateZoomLevelTop(eventData.viewport.scale);
            }
            let detections = [];
            this.props.detections.forEach((det) => {
                if (det.view === constants.viewport.TOP) detections.push(det);
            });
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
            cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
                zoomLevelSide: eventData.viewport.scale,
            });
            if (this.props.zoomLevelSide !== eventData.viewport.scale) {
                this.props.updateZoomLevelSide(eventData.viewport.scale);
            }
            let detections = [];
            this.props.detections.forEach((det) => {
                if (det.view === constants.viewport.SIDE) detections.push(det);
            });
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
     * appUpdateImage - Simply updates our cornerstone image depending on the number of view-ports.
     *
     * @return {none} None
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
     * renderDetections - Method that renders the several annotations in a given DICOS+TDR file
     *
     * @param  {type} data    DICOS+TDR data
     * @param  {type} context Rendering context
     * @return {type}         None
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
                (data[j].selected &&
                    this.props.cornerstoneMode !==
                        constants.cornerstoneMode.SELECTION)
            ) {
                continue;
            }

            const boundingBoxCoords = data[j].boundingBox;
            if (boundingBoxCoords.length < B_BOX_COORDS) {
                return;
            }
            context.strokeStyle = data[j].selected
                ? constants.detectionStyle.SELECTED_COLOR
                : data[j].displayColor;
            context.fillStyle = data[j].selected
                ? constants.detectionStyle.SELECTED_COLOR
                : data[j].displayColor;
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
            // Binary mask rendering
            this.renderBinaryMasks(data[j].binaryMask, context);

            // Polygon mask rendering
            this.renderPolygonMasks(data[j].polygonMask, context);
            context.globalAlpha = 1.0;

            // Label rendering
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
     * renderBinaryMasks - Method that renders the binary mask associated with a detection
     *
     * @param  {type} data    DICOS+TDR data
     * @param  {type} context Rendering context
     * @return {type}         None
     */
    renderBinaryMasks(data, context) {
        if (data === undefined || data === null || data.length === 0) {
            return;
        }
        if (data[0].length === 0) return;
        const baseX = data[1][0];
        const baseY = data[1][1];
        const maskWidth = data[2][0];
        const maskHeight = data[2][1];
        const pixelData = data[0];
        context.imageSmoothingEnabled = true;
        for (var y = 0; y < maskHeight; y++)
            for (var x = 0; x < maskWidth; x++) {
                if (pixelData[x + y * maskWidth] === 1) {
                    context.fillRect(baseX + x, baseY + y, 1, 1);
                }
            }
        context.imageSmoothingEnabled = false;
    }

    /**
     * renderPolygonMasks - Method that renders the polygon mask associated with a detection
     *
     * @param  {array} coords    polygon mask coordinates
     * @param  {Context} context Rendering context
     */
    renderPolygonMasks(coords, context) {
        if (coords === undefined || coords === null || coords.length === 0) {
            return;
        }
        let index = 0;
        context.beginPath();
        context.moveTo(coords[index], coords[index + 1]);
        index += 2;
        for (let i = index; i < coords.length; i += 2) {
            context.lineTo(coords[i], coords[i + 1]);
        }
        context.closePath();
        context.fill();
    }

    /**
     * onMouseClicked - Callback function invoked on mouse clicked in image viewport. We handle the selection of detections.
     *
     * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
     * @return {type}   None
     */
    onMouseClicked(e) {
        let view;
        if (e.detail.element.id === 'dicomImageLeft') {
            view = constants.viewport.TOP;
        } else if (e.detail.element.id === 'dicomImageRight') {
            // eslint-disable-next-line no-unused-vars
            view = constants.viewport.SIDE;
        }
        if (!this.props.detections) {
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
                    )
                ) {
                    clickedPos = j;
                    break;
                }
            }

            if (
                this.props.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION
            )
                return;

            // Click on an empty area
            if (clickedPos === constants.selection.NO_SELECTION) {
                // Only clear if a detection is selected
                this.props.clearAllSelection();
                this.props.emptyAreaClickUpdate();
                this.resetCornerstoneTool();
                this.appUpdateImage();
                this.onDetectionSelected(e);
            } else {
                // Clicked on detection
                if (
                    combinedDetections[clickedPos].visible !== false &&
                    this.props.cornerstoneMode ===
                        constants.cornerstoneMode.SELECTION
                ) {
                    this.props.selectDetection(
                        combinedDetections[clickedPos].uuid
                    );

                    this.onDetectionSelected(e).finally(() => {
                        this.props.detectionSelectedUpdate();
                        this.renderDetectionContextMenu(e);
                        this.appUpdateImage();
                    });
                } else if (
                    combinedDetections[clickedPos].visible !== false &&
                    this.props.cornerstoneMode ===
                        constants.cornerstoneMode.EDITION
                ) {
                    // We clicked a visible detection and are in edition mode

                    this.props.clearAllSelection();
                    this.onDetectionSelected(e).finally(() => {
                        this.props.emptyAreaClickUpdate();
                        this.resetCornerstoneTool();
                        this.appUpdateImage();
                    });
                }
            }
        }
    }

    /**
     * onDragEnd - Invoked when user stops dragging mouse or finger on touch device
     *
     * @param {Event} event Mouse drag end event
     * @param {container}  viewport The Cornerstone Viewport containing the event
     * @return {type} None
     */
    onDragEnd(event, viewport) {
        if (
            (this.props.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION &&
                this.props.annotationMode ===
                    constants.annotationMode.BOUNDING) ||
            this.props.cornerstoneMode === constants.cornerstoneMode.EDITION
        ) {
            const toolState = cornerstoneTools.getToolState(
                viewport,
                'BoundingBoxDrawing'
            );
            if (toolState === undefined || toolState.data.length === 0) {
                this.props.emptyAreaClickUpdate();
                this.props.clearAllSelection();
                this.resetSelectedDetectionBoxes(event);
                this.resetCornerstoneTool();
                this.appUpdateImage();
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
            const { handles } = data[0];
            const { start, end } = handles;
            let coords = [];
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
            let boundingBoxArea = Math.abs(
                (coords[0] - coords[2]) * (coords[1] - coords[3])
            );
            let newDetection = {
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
                binaryMask: [[]],
                polygonMask: [],
            };
            const stackIndex = this.state.myOra.stackData.findIndex((stack) => {
                return newDetection.view === stack.view;
            });
            let self = this;
            Dicos.detectionObjectToBlob(
                newDetection,
                self.state.myOra.stackData[stackIndex].blobData[0].blob
            ).then((newBlob) => {
                const uuid = uuidv4();
                self.state.myOra.stackData[stackIndex].blobData.push({
                    blob: newBlob,
                    uuid,
                });
                if (data[0] === undefined) {
                    self.props.emptyAreaClickUpdate();
                    self.resetCornerstoneTool();
                    self.props.clearAllSelection();
                    self.resetSelectedDetectionBoxes(event);
                    self.appUpdateImage();
                    return;
                }
                if (data[0].updatingDetection === false) {
                    // Need to determine if updating operator or new
                    // Create new user-created detection
                    const operator = constants.OPERATOR;
                    if (
                        boundingBoxArea > constants.BOUNDING_BOX_AREA_THRESHOLD
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
                            binaryMask: [[]],
                            polygonMask: [],
                            uuid,
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
                            coords
                        )
                    ) {
                        self.props.updateDetection({
                            uuid: data[0].uuid,
                            update: {
                                boundingBox: coords,
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
                        const editLabelWidgetPosInfo = self.getEditLabelWidgetPos(
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
        }
    }

    /**
     * onNewPolygonMaskCreated - Callback invoked when new polygon mask has been created.
     *
     * @param {Event} event Event triggered when a new polygon is created
     * @param {container}  viewport The Cornerstone Viewport receiving the event
     * @return {type}  None
     */
    onNewPolygonMaskCreated(event, viewport) {
        if (
            this.props.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION &&
            this.props.annotationMode === constants.annotationMode.POLYGON
        ) {
            const polygonData = event.detail.measurementData;
            const polygonCoords = Utils.polygonDataToCoordArray(
                polygonData.handles.points
            );
            const boundingBoxCoords = Utils.calculateBoundingBox(
                polygonData.handles.points
            );

            let newDetection = {
                uuid: polygonData.uuid,
                boundingBox: boundingBoxCoords,
                algorithm: polygonData.algorithm,
                className: polygonData.class,
                confidence: polygonData.confidence,
                view:
                    viewport === this.state.imageViewportTop
                        ? constants.viewport.TOP
                        : constants.viewport.SIDE,
                validation: true,
                binaryMask: [[]],
                polygonMask: polygonCoords,
            };
            const stackIndex = this.state.myOra.stackData.findIndex((stack) => {
                return newDetection.view === stack.view;
            });
            let self = this;
            Dicos.detectionObjectToBlob(
                newDetection,
                self.state.myOra.stackData[stackIndex].blobData[0].blob
            ).then((newBlob) => {
                const uuid = uuidv4();
                self.state.myOra.stackData[stackIndex].blobData.push({
                    blob: newBlob,
                    uuid,
                });
                if (polygonData === undefined) {
                    self.props.emptyAreaClickUpdate();
                    self.resetCornerstoneTool();
                    self.props.clearAllSelection();
                    self.resetSelectedDetectionBoxes(event);
                    self.appUpdateImage();
                    return;
                }
                self.props.addDetection({
                    algorithm: constants.OPERATOR,
                    boundingBox: boundingBoxCoords,
                    className: polygonData.class,
                    confidence: polygonData.confidence,
                    view:
                        viewport === self.state.imageViewportTop
                            ? constants.viewport.TOP
                            : constants.viewport.SIDE,
                    binaryMask: [[]],
                    polygonMask: polygonCoords,
                    uuid,
                });

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
     * resetSelectedDetectionBoxes - Unselect the selected detection and hide the context menu.
     *
     * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
     * @return {type}  None
     */
    resetSelectedDetectionBoxes(e, sideMenuUpdate = false) {
        if (
            this.props.cornerstoneMode ===
                constants.cornerstoneMode.SELECTION ||
            sideMenuUpdate === true
        ) {
            this.props.clearAllSelection();
            this.props.resetSelectedDetectionBoxesUpdate();
            this.onDetectionSelected(e);
            this.resetCornerstoneTool();
            this.appUpdateImage();
        } else {
            this.props.resetSelectedDetectionBoxesElseUpdate();
        }
    }

    /**
     * hideContextMenu - Hide context menu when mouse is moved.
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
     * renderButtons - Function that handles the logic behind whether or not to display
     * the feedback buttons and where to display those buttons depending on the current
     * zoom level in the window
     *
     * @param  {Event} e Event data passed from the onMouseClick function,
     * such as the mouse cursor position, mouse button clicked, etc.
     * C
     */
    async onDetectionSelected(e) {
        return new Promise((resolve, reject) => {
            const viewportInfo = Utils.eventToViewportInfo(e);
            const view =
                viewportInfo.viewport === constants.viewport.TOP
                    ? constants.viewport.TOP
                    : constants.viewport.SIDE;
            if (!this.props.detections) {
                reject();
            }
            const detectionData = this.props.selectedDetection;
            if (detectionData) {
                if (detectionData.boundingBox !== undefined) {
                    const detectionBoxCoords = detectionData.boundingBox;
                    const data = {
                        handles: {
                            start: {
                                x: detectionBoxCoords[0],
                                y: detectionBoxCoords[1],
                            },
                            end: {
                                x: detectionBoxCoords[2],
                                y: detectionBoxCoords[3],
                            },
                            start_prima: {
                                x: detectionBoxCoords[0],
                                y: detectionBoxCoords[3],
                            },
                            end_prima: {
                                x: detectionBoxCoords[2],
                                y: detectionBoxCoords[1],
                            },
                        },
                        uuid: detectionData.uuid,
                        algorithm: detectionData.algorithm,
                        class: detectionData.className,
                        renderColor: constants.detectionStyle.SELECTED_COLOR,
                        confidence: detectionData.confidence,
                        updatingDetection: true,
                        view: detectionData.view,
                    };
                    if (view === constants.viewport.TOP) {
                        cornerstoneTools.addToolState(
                            this.state.imageViewportTop,
                            'BoundingBoxDrawing',
                            data
                        );
                    } else if (view === constants.viewport.SIDE) {
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
                    resolve();
                }
                this.appUpdateImage();
                resolve();
            }
            resolve();
        });
    }

    /**
     * Invoked when user selects bounding box option from FAB
     * @return {none} None
     * @param {none} None
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
     * Invoked when user selects polygon mask option from FAB
     * @return {none} None
     * @param {none} None
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
     * getContextMenuPos - Get position of context menu based on the associated bounding box.
     *
     * @param {object} viewportInfo - viewport info
     * @param {array} coords - bounding box' corners' coordinates
     * @param {array}
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
     * @param {Event} event Related mouse click event to position the widget relative to detection
     * @param {Detection} [draggedData] Optional detection data. In the case that
     * a detection is moved during a drag event, the data in state is out of date until after this
     * function is called. Use the param data to render the context menu.
     */
    renderDetectionContextMenu(event, draggedData = undefined) {
        if (this.props.selectedDetection !== null) {
            const viewportInfo = Utils.eventToViewportInfo(event);
            const detectionData = draggedData
                ? draggedData
                : this.props.selectedDetection;

            const contextMenuPos = this.getContextMenuPos(
                viewportInfo,
                detectionData.boundingBox
            );
            this.props.updateDetectionContextPosition({
                top: contextMenuPos.y,
                left: contextMenuPos.x,
            });
            if (viewportInfo.viewport !== null) {
                if (detectionData !== undefined) {
                    let detectionContextGap = 0;
                    let viewport, originCoordX;
                    const boundingBoxCoords = detectionData.boundingBox;
                    const boundingWidth = Math.abs(
                        boundingBoxCoords[2] - boundingBoxCoords[0]
                    );
                    const boundingHeight = Math.abs(
                        boundingBoxCoords[3] - boundingBoxCoords[1]
                    );
                    if (viewportInfo.viewport === constants.viewport.TOP) {
                        detectionContextGap =
                            viewportInfo.offset / this.props.zoomLevelTop -
                            boundingWidth;
                        originCoordX = 2;
                        viewport = this.state.imageViewportTop;
                    } else {
                        originCoordX = 0;
                        detectionContextGap =
                            viewportInfo.offset / this.props.zoomLevelSide -
                            boundingHeight / boundingWidth;
                        viewport = this.state.imageViewportSide;
                    }
                    const { x, y } = cornerstone.pixelToCanvas(viewport, {
                        x:
                            boundingBoxCoords[originCoordX] +
                            detectionContextGap,
                        y: boundingBoxCoords[1] + boundingHeight + 4,
                    });
                    this.props.updateDetectionContextPosition({
                        top: y,
                        left: x,
                    });
                    this.appUpdateImage();
                }
            }
        }
    }

    /**
     * Invoked when user selects an edition mode from DetectionContextMenu.
     * @param {string} newMode Edition mode selected from menu
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
                const detectionData = this.props.selectedDetection;
                let coords;
                if (
                    this.props.cornerstoneMode ===
                    constants.cornerstoneMode.EDITION
                ) {
                    const currentViewport =
                        detectionData.view === constants.viewport.TOP
                            ? this.state.imageViewportTop
                            : this.state.imageViewportSide;
                    const toolState = cornerstoneTools.getToolState(
                        currentViewport,
                        'BoundingBoxDrawing'
                    );
                    const { data } = toolState;
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
                }
                const editLabelWidgetPosInfo = this.getEditLabelWidgetPos(
                    detectionData,
                    coords
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
            }
            this.props.updateEditionMode(payload);
        }
    }

    /**
     * Invoked when user completes editing a detection's label
     * @param {string} newLabel Updated label name from user interaction
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
     * @param {dictionary} detectionData detection data
     * @param {array} coords bounding box coordinates
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
     * Invoked when user selects 'delete' option from DetectionContextMenu
     */
    deleteDetection() {
        // Detection is selected
        if (this.props.selectedDetection) {
            this.props.deleteDetection(this.props.selectedDetection.uuid);
            if (this.props.selectedDetection.view === constants.viewport.TOP) {
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

    onMouseMoved(event) {
        this.setState({
            mousePosition: { x: event.x, y: event.y },
            activeViewport: event.target.parentElement.id,
        });
    }

    onMouseLeave(event) {
        if (this.props.numFilesInQueue > 0) this.props.emptyAreaClickUpdate();
        else this.props.onMouseLeaveNoFilesUpdate();
        this.props.clearAllSelection();
        this.resetSelectedDetectionBoxes(event);
        this.resetCornerstoneTool();
        this.appUpdateImage();
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
                    }}
                    onMouseDown={(e) => e.preventDefault()}>
                    <TopBar />
                    <SideMenu
                        nextImageClick={this.nextImageClick}
                        resetSelectedDetectionBoxes={
                            this.resetSelectedDetectionBoxes
                        }
                        resetCornerstoneTools={this.resetCornerstoneTool}
                    />
                    <div id="algorithm-outputs"> </div>
                    <DetectionContextMenu
                        setSelectedOption={this.selectEditionMode}
                    />
                    <EditLabel onLabelChange={this.editDetectionLabel} />
                    <BoundPolyFAB
                        onBoundingSelect={this.onBoundingBoxSelected}
                        onPolygonSelect={this.onPolygonMaskSelected}
                    />
                    <NoFileSign isVisible={this.props.numFilesInQueue > 0} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { server, detections, ui } = state;
    return {
        // Socket connection state
        numFilesInQueue: server.numFilesInQueue,
        currentProcessingFile: server.currentProcessingFile,
        // Detections and Selection state
        detections: detections.detections,
        selectedDetection: detections.selectedDetection,
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
    };
};

const mapDispatchToProps = {
    setCommandServerConnection,
    setFileServerConnection,
    setDownload,
    setUpload,
    setNumFilesInQueue,
    setProcessingHost,
    setCurrentProcessingFile,
    resetDetections,
    updateDetection,
    updatedDetectionSet,
    addDetection,
    addDetections,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
