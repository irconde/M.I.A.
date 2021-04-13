import './App.css';
import React from 'react';
import { Component } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import dicomParser from 'dicom-parser';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import ORA from './ORA.js';
import Stack from './Stack.js';
import Utils from './Utils.js';
import Dicos from './Dicos.js';
import Detection from './Detection.js';
import axios from 'axios';
import SideMenu from './components/SideMenu';
import TopBar from './components/TopBar/TopBar';
import JSZip from 'jszip';
import DetectionSet from './DetectionSet';
import Selection from './Selection';
import NoFileSign from './components/NoFileSign';
import * as constants from './Constants';
import BoundingBoxDrawingTool from './cornerstone-tools/BoundingBoxDrawingTool';
import BoundPolyFAB from './components/FAB/BoundPolyFAB';
import { connect } from 'react-redux';
import {
    setCommandServerConnection,
    setFileServerConnection,
    setUpload,
    setDownload,
    setIsFileInQueue,
    setNumFilesInQueue,
    setProcessingHost,
    setCurrentProcessingFile,
} from './redux/slices/server/serverSlice';
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
        this.currentSelection = new Selection();
        this.state = {
            threatsCount: 0,
            selectedFile: null,
            algorithm: null,
            date: null,
            time: null,
            configurationInfo: {},
            myOra: new ORA(),
            image: null,
            detections: {},
            receiveTime: null,
            displaySelectedBoundingBox: false,
            buttonStyles: {
                confirm: {},
                reject: {},
            },
            displayNext: false,
            nextAlgBtnEnabled: false,
            prevAlgBtnEnabled: false,
            zoomLevelTop: constants.viewportStyle.ZOOM,
            zoomLevelSide: constants.viewportStyle.ZOOM,
            imageViewportTop: document.getElementById('dicomImageLeft'),
            imageViewportSide: document.getElementById('dicomImageRight'),
            singleViewport: true,
            viewport: cornerstone.getDefaultViewport(null, undefined),
            cornerstoneMode: constants.cornerstoneMode.SELECTION,
            isDrawingBoundingBox: false,
            isFABVisible: false,
            isDetectionContextVisible: false,
            detectionContextPosition: {
                top: 0,
                left: 0,
            },
            editionMode: null,
            detectionLabels: [],
            detectionLabelEditWidth: '0px',
            detectionLabelEditPosition: {
                top: 0,
                left: 0,
            },
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
        this.resetSelectedDetectionBoxes = this.resetSelectedDetectionBoxes.bind(
            this
        );
        this.updateNumberOfFiles = this.updateNumberOfFiles.bind(this);
        this.appUpdateImage = this.appUpdateImage.bind(this);
        this.onMenuDetectionSelected = this.onMenuDetectionSelected.bind(this);
        this.onAlgorithmSelected = this.onAlgorithmSelected.bind(this);
        this.resizeListener = this.resizeListener.bind(this);
        this.calculateviewPortWidthAndHeight = this.calculateviewPortWidthAndHeight.bind(
            this
        );
        this.recalculateZoomLevel = this.recalculateZoomLevel.bind(this);
        this.onBoundingBoxSelected = this.onBoundingBoxSelected.bind(this);
        this.onPolygonMaskSelected = this.onPolygonMaskSelected.bind(this);
        this.resetCornerstoneTool = this.resetCornerstoneTool.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.renderDetectionContextMenu = this.renderDetectionContextMenu.bind(
            this
        );
        this.selectEditionMode = this.selectEditionMode.bind(this);
        this.selectEditDetectionLabel = this.selectEditDetectionLabel.bind(
            this
        );
        this.editDetectionLabel = this.editDetectionLabel.bind(this);
        this.editBoundingBox = this.editBoundingBox.bind(this);
        this.editPolygonMask = this.editPolygonMask.bind(this);
        this.deleteDetection = this.deleteDetection.bind(this);
        this.getAllLabels = this.getAllLabels.bind(this);
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
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchstart',
            this.onMouseClicked
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchdragend',
            (event) => {
                this.onDragEnd(event, this.state.imageViewportTop);
            }
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolsmousedrag',
            this.resetSelectedDetectionBoxes
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
        this.state.imageViewportSide.addEventListener(
            'cornerstoneimagerendered',
            this.onImageRendered
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolstouchstart',
            this.onMouseClicked
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
        window.addEventListener('resize', this.resizeListener);

        this.calculateviewPortWidthAndHeight();

        let reactObj = this;
        this.setState(
            {
                isFABVisible:
                    this.state.numberOfFilesInQueue > 0 ? true : false,
            },
            () => {
                reactObj.getFilesFromCommandServer();
                reactObj.updateNumberOfFiles();
                reactObj.setupCornerstoneJS(
                    reactObj.state.imageViewportTop,
                    reactObj.state.imageViewportSide
                );
            }
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
        this.setState({
            zoomLevelTop: newZoomLevelTop,
            zoomLevelSide: newZoomLevelSide,
            imageViewportTop: updateImageViewportTop,
            imageViewportSide: updateImageViewportSide,
        });
    }

    componentWillUnmount() {
        this.state.imageViewportTop.removeEventListener(
            'cornerstoneimagerendered',
            this.onImageRendered
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolstouchstart',
            this.onMouseClicked
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
            'cornerstonetoolsmouseclick',
            this.onMouseClicked
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolstouchstart',
            this.onMouseClicked
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
        window.removeEventListener('resize', this.resizeListener);
    }

    /**
     * resizeListener - Function event listener for the window resize event. If a detection is selected,
     *                  we clear the detections and hide the buttons.
     *
     * @param {Event} e
     * @returns {type} None
     */
    resizeListener(e) {
        this.calculateviewPortWidthAndHeight();
        if (this.state.displaySelectedBoundingBox === true) {
            for (const [key, detectionSet] of Object.entries(
                this.state.detections
            )) {
                detectionSet.clearAll();
            }
            this.setState({ displaySelectedBoundingBox: false }, () => {
                this.appUpdateImage();
            });
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
        if (
            this.state.cornerstoneMode === constants.cornerstoneMode.ANNOTATION
        ) {
            cornerstoneTools.setToolActive('BoundingBoxDrawing', {
                mouseButtonMask: 1,
            });
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
        if (this.state.singleViewport !== true) {
            cornerstoneTools.clearToolState(
                this.state.imageViewportSide,
                'BoundingBoxDrawing'
            );
        }
        cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
            cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
        });
        cornerstoneTools.setToolDisabled('BoundingBoxDrawing');
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
            this.sendImageToFileServer(Utils.b64toBlob(data)).then((res) => {
                // If we got an image and we are null, we know we can now fetch one
                // This is how it triggers to display a new file if none existed and a new one was added
                this.props.setDownload(false);
                if (this.state.selectedFile === null) {
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
            if (!this.props.isFileInQueue && data > 0) {
                const updateImageViewportTop = this.state.imageViewportTop;
                updateImageViewportTop.style.visibility = 'visible';
                this.setState({
                    imageViewportTop: updateImageViewportTop,
                });
                this.getNextImage();
            }
            this.setState({
                isFABVisible: data > 0,
            });

            this.props.setNumFilesInQueue(data);
            this.props.setIsFileInQueue(data > 0);
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
        this.currentSelection = new Selection();
        this.setState({
            selectedFile: null,
            displayNext: false,
            imageViewportTop: updateImageViewport,
            imageViewportSide: updateImageViewportSide,
            isFABVisible: false,
        });
    }

    /**
     * getNextImage() - Attempts to retrieve the next image from the file server via get request
     *                - Then sets the state to the blob and calls the loadAndViewImage() function
     * @param {type} - None
     * @return {type} - None
     */
    getNextImage() {
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
                                                listOfStacks[j].blobData.push(
                                                    Utils.b64toBlob(imageData)
                                                );
                                            });
                                    }
                                }
                                const promiseOfList = Promise.all(
                                    listOfPromises
                                );
                                // Once we have all the layers...
                                promiseOfList.then(() => {
                                    this.state.myOra.stackData = listOfStacks;
                                    this.setState(
                                        {
                                            selectedFile: this.state.myOra.getFirstImage(),
                                            image: this.state.myOra.getFirstPixelData(),
                                            displayNext: false,
                                            singleViewport:
                                                listOfStacks.length < 2,
                                            receiveTime: Date.now(),
                                        },
                                        () => {
                                            Utils.changeViewport(
                                                this.state.singleViewport
                                            );
                                            if (this.state.singleViewport) {
                                                cornerstone.resize(
                                                    this.state.imageViewportTop,
                                                    true
                                                );
                                            } else {
                                                cornerstone.resize(
                                                    this.state.imageViewportTop
                                                );
                                            }
                                            this.state.detections = {};
                                            this.currentSelection.availableAlgorithms = [];
                                            this.loadAndViewImage();
                                        }
                                    );
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
        axios
            .get(`${constants.server.FILE_SERVER_ADDRESS}/confirm`)
            .then((res) => {
                if (res.data.confirm === 'image-removed') {
                    this.setState({
                        algorithm: null,
                    });
                    let validationCompleted = this.validationCompleted();
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
                    let topCounter = 1;
                    let sideCounter = 1;
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
                            stack.blobData[0]
                        );
                        stackElem.appendChild(pixelLayer);
                        if (stack.view === 'top') {
                            // Loop through each detection and only the top view of the detection
                            const topDetections = this.currentSelection.getDetectionsFromView(
                                constants.viewport.TOP
                            );
                            for (let j = 0; j < topDetections.length; j++) {
                                let threatPromise = Dicos.dataToBlob(
                                    topDetections[j],
                                    stack.blobData[j + 1],
                                    Date.now(),
                                    !validationCompleted,
                                    function (threatBlob) {
                                        newOra.file(
                                            `data/${stack.view}_threat_detection_${topCounter}.dcs`,
                                            threatBlob
                                        );
                                        let newLayer = stackXML.createElement(
                                            'layer'
                                        );
                                        newLayer.setAttribute(
                                            'src',
                                            `data/${stack.view}_threat_detection_${topCounter}.dcs`
                                        );
                                        stackElem.appendChild(newLayer);
                                        topCounter++;
                                    }
                                );
                                listOfPromises.push(threatPromise);
                            }
                            // Loop through each detection and only the side view of the detection
                        } else if (stack.view === 'side') {
                            const sideDetections = this.currentSelection.getDetectionsFromView(
                                constants.viewport.SIDE
                            );
                            for (let j = 0; j < sideDetections.length; j++) {
                                let threatPromise = Dicos.dataToBlob(
                                    sideDetections[j],
                                    sideDetections[j].blobData,
                                    Date.now(),
                                    !validationCompleted,
                                    function (threatBlob) {
                                        newOra.file(
                                            `data/${stack.view}_threat_detection_${sideCounter}.dcs`,
                                            threatBlob
                                        );
                                        let newLayer = stackXML.createElement(
                                            'layer'
                                        );
                                        newLayer.setAttribute(
                                            'src',
                                            `data/${stack.view}_threat_detection_${sideCounter}.dcs`
                                        );
                                        stackElem.appendChild(newLayer);
                                        sideCounter++;
                                    }
                                );
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
                                    (res) => {
                                        this.resetSelectedDetectionBoxes(e);
                                        this.setState({
                                            selectedFile: null,
                                            displayNext: false,
                                        });
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
                    this.setState({ selectedFile: null });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * * validationCompleted - Method that indicates is the operator has finished validating detections
     *
     * @param  {type} validationList array sized with the number of detections. Every position
     * in the array is an int value (0/1) that indicates whether the corresponding detection has been validated or not.
     * @return {type}                boolean value. True in case al detections were validated. False, otherwise.
     */
    validationCompleted() {
        let result = true;
        for (const [key, detectionSet] of Object.entries(
            this.state.detections
        )) {
            if (detectionSet.data.top !== undefined) {
                detectionSet.data.top.forEach((detection) => {
                    detection.validation = true;
                });
            }
            if (detectionSet.data.side !== undefined) {
                detectionSet.data.side.forEach((detection) => {
                    detection.validation = true;
                });
            }
        }
        return result;
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
        if (this.state.singleViewport === false) {
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
            self.state.myOra.stackData[0].blobData[0]
        );

        cornerstone.loadImage(pixelDataTop).then(function (image) {
            const viewport = cornerstone.getDefaultViewportForImage(
                self.state.imageViewportTop,
                image
            );
            viewport.translation.y = constants.viewportStyle.ORIGIN;
            viewport.scale = self.state.zoomLevelTop;
            self.setState({ viewport: viewport });
            cornerstone.displayImage(
                self.state.imageViewportTop,
                image,
                viewport
            );
        });
        if (this.state.singleViewport === false) {
            const updatedImageViewportSide = this.state.imageViewportSide;
            updatedImageViewportSide.style.visibility = 'visible';
            this.setState({ imageViewportSide: updatedImageViewportSide });

            const pixelDataSide = cornerstoneWADOImageLoader.wadouri.fileManager.add(
                self.state.myOra.stackData[1].blobData[0]
            );
            cornerstone.loadImage(pixelDataSide).then(function (image) {
                const viewport = cornerstone.getDefaultViewportForImage(
                    self.state.imageViewportSide,
                    image
                );
                viewport.translation.y = constants.viewportStyle.ORIGIN;
                viewport.scale = self.state.zoomLevelSide;
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
        // self.state.detections = {};
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        const reader = new FileReader();
        reader.addEventListener('loadend', function () {
            const view = new Uint8Array(reader.result);
            var image = dicomParser.parseDicom(view);
            self.currentSelection = new Selection();
            self.setState({
                threatsCount: image.uint16(
                    Dicos.dictionary['NumberOfAlarmObjects'].tag
                ),
                algorithm: image.string(
                    Dicos.dictionary['ThreatDetectionAlgorithmandVersion'].tag
                ),
                time:
                    today.getHours() +
                    ':' +
                    today.getMinutes() +
                    ':' +
                    today.getSeconds(),
                date: mm + '/' + dd + '/' + yyyy,
                configurationInfo: {
                    type: image.string(Dicos.dictionary['DetectorType'].tag),
                    configuration: image.string(
                        Dicos.dictionary['DetectorConfiguration'].tag
                    ),
                    station: image.string(Dicos.dictionary['StationName'].tag),
                    series: image.string(
                        Dicos.dictionary['SeriesDescription'].tag
                    ),
                    study: image.string(
                        Dicos.dictionary['StudyDescription'].tag
                    ),
                },
            });
        });
        reader.readAsArrayBuffer(imagesLeft[0]);
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

                if (!(algorithmName in self.state.detections)) {
                    self.state.detections[algorithmName] = new DetectionSet();
                    self.state.detections[algorithmName].setAlgorithmName(
                        algorithmName
                    );
                    self.state.detections[algorithmName].visibility = true;
                    self.currentSelection.addAlgorithm(
                        self.state.detections[algorithmName]
                    );
                }
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
                    this.setState({
                        displayNext: true,
                    });
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
                    self.state.detections[algorithmName].addDetection(
                        new Detection(
                            boundingBoxCoords,
                            maskData,
                            objectClass,
                            confidenceLevel,
                            false,
                            algorithmName,
                            constants.viewport.TOP,
                            uuidv4(),
                            false,
                            new Blob([new Uint8Array(reader.result)])
                        )
                    );
                }
            });
            readFile.readAsArrayBuffer(imagesLeft[i]);
        }

        if (this.state.singleViewport === false) {
            for (var k = 0; k < imagesRight.length; k++) {
                const read = new FileReader();
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

                    if (!(algorithmName in self.state.detections)) {
                        self.state.detections[
                            algorithmName
                        ] = new DetectionSet();
                        self.state.detections[algorithmName].setAlgorithmName(
                            algorithmName
                        );
                        self.currentSelection.addAlgorithm(
                            self.state.detections[algorithmName]
                        );
                    }

                    self.state.detections[algorithmName].data[
                        constants.viewport.SIDE
                    ] = [];

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
                        this.setState({
                            displayNext: true,
                        });
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
                        self.state.detections[algorithmName].addDetection(
                            new Detection(
                                boundingBoxCoords,
                                pixelData,
                                objectClass,
                                confidenceLevel,
                                false,
                                algorithmName,
                                constants.viewport.SIDE,
                                uuidv4(),
                                false,
                                new Blob([new Uint8Array(read.result)])
                            ),
                            constants.viewport.SIDE
                        );
                    }
                });
                read.readAsArrayBuffer(imagesRight[k]);
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

        if (eventData.element.id === 'dicomImageLeft') {
            const context = eventData.canvasContext;
            const toolData = cornerstoneTools.getToolState(
                e.currentTarget,
                'BoundingBoxDrawing'
            );
            this.setState({ zoomLevelTop: eventData.viewport.scale });
            this.renderDetections(this.state.detections, context);
        } else if (
            eventData.element.id === 'dicomImageRight' &&
            this.state.singleViewport === false
        ) {
            const context = eventData.canvasContext;
            const toolData = cornerstoneTools.getToolState(
                e.currentTarget,
                'BoundingBoxDrawing'
            );
            this.setState({ zoomLevelSide: eventData.viewport.scale });
            this.renderDetections(this.state.detections, context);
        }
        // set the canvas context to the image coordinate system
        //cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, eventData.canvasContext);
        // NOTE: The coordinate system of the canvas is in image pixel space.  Drawing
        // to location 0,0 will be the top left of the image and rows,columns is the bottom
        // right.
    }

    /**
     * appUpdateImage - Simply updates our cornerstone image depending on the number of view-ports.
     *
     * @return {none} None
     */
    appUpdateImage() {
        cornerstone.updateImage(this.state.imageViewportTop, true);
        if (this.state.singleViewport === false) {
            cornerstone.updateImage(this.state.imageViewportSide, true);
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
        if (
            this.state.detections === {} ||
            this.currentSelection.getAlgorithm() === undefined ||
            data[this.currentSelection.getAlgorithm()] === undefined ||
            this.currentSelection.getAlgorithm() === false
        ) {
            return;
        }
        const B_BOX_COORDS = 4;
        let detectionList;
        let selectedViewport;
        context.font = constants.detectionStyle.LABEL_FONT;
        context.lineWidth = constants.detectionStyle.BORDER_WIDTH;
        for (const [key, detectionSet] of Object.entries(data)) {
            if (detectionSet.visibility !== true) {
                continue;
            }
            selectedViewport = constants.viewport.TOP;
            detectionList = detectionSet.getData(selectedViewport);
            if (
                context.canvas.offsetParent.id === 'dicomImageRight' &&
                this.state.singleViewport === false
            ) {
                selectedViewport = constants.viewport.SIDE;
                detectionList = detectionSet.getData(selectedViewport);
            }
            if (detectionList === undefined) {
                return;
            } else {
                if (detectionList === null || detectionList.length === 0) {
                    continue;
                }
            }
            for (let j = 0; j < detectionList.length; j++) {
                if (
                    detectionList[j].visible !== true ||
                    detectionList[j].updatingDetection === true
                )
                    continue;
                const boundingBoxCoords = detectionList[j].boundingBox;
                let color = detectionList[j].getRenderColor();
                if (boundingBoxCoords.length < B_BOX_COORDS) {
                    return;
                }
                if (
                    detectionSet.lowerOpacity === true &&
                    detectionList[j].selected === false
                ) {
                    let rgbColor = Utils.hexToRgb(color);
                    color = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.4)`;
                }
                context.strokeStyle = color;
                context.fillStyle = color;
                const boundingBoxWidth = Math.abs(
                    boundingBoxCoords[2] - boundingBoxCoords[0]
                );
                const boundingBoxHeight = Math.abs(
                    boundingBoxCoords[3] - boundingBoxCoords[1]
                );
                const detectionLabel = Utils.formatDetectionLabel(
                    detectionList[j].class,
                    detectionList[j].confidence
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

                // Mask rendering
                this.renderDetectionMasks(detectionList[j].maskBitmap, context);

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
                    boundingBoxCoords[0] +
                        constants.detectionStyle.LABEL_PADDING,
                    boundingBoxCoords[1] -
                        constants.detectionStyle.LABEL_PADDING
                );
            }
        }
    }

    /**
     * renderDetectionMasks - Method that renders the several annotations in a given DICOS+TDR file
     *
     * @param  {type} data    DICOS+TDR data
     * @param  {type} context Rendering context
     * @return {type}         None
     */
    renderDetectionMasks(data, context) {
        if (data === undefined || data === null || data.length === 0) {
            return;
        }
        const baseX = data[1][0];
        const baseY = data[1][1];
        const maskWidth = data[2][0];
        const maskHeight = data[2][1];
        const pixelData = data[0];
        context.globalAlpha = 0.5;
        context.imageSmoothingEnabled = true;
        for (var y = 0; y < maskHeight; y++)
            for (var x = 0; x < maskWidth; x++) {
                if (pixelData[x + y * maskWidth] === 1) {
                    context.fillRect(baseX + x, baseY + y, 1, 1);
                }
            }
        context.globalAlpha = 1.0;
        context.imageSmoothingEnabled = false;
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
            view = constants.viewport.SIDE;
        }
        if (this.state.detections === null) {
            return;
        }
        let combinedDetections;
        let viewport;
        if (e.detail.element.id === 'dicomImageLeft') {
            // top
            combinedDetections = this.currentSelection.getDetectionsFromView(
                constants.viewport.TOP
            );
            viewport = constants.viewport.TOP;
        } else if (e.detail.element.id === 'dicomImageRight') {
            // side
            combinedDetections = this.currentSelection.getDetectionsFromView(
                constants.viewport.SIDE
            );
            viewport = constants.viewport.SIDE;
        }
        if (combinedDetections.length > 0) {
            const mousePos = cornerstone.canvasToPixel(e.target, {
                x: e.detail.currentPoints.canvas.x,
                y: e.detail.currentPoints.canvas.y,
            });
            let clickedPos = constants.selection.NO_SELECTION;
            for (var j = combinedDetections.length - 1; j > -1; j--) {
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
                this.state.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION
            )
                return;

            // Click on an empty area
            if (clickedPos === constants.selection.NO_SELECTION) {
                for (const [key, detSet] of Object.entries(
                    this.state.detections
                )) {
                    detSet.clearAll();
                }
                this.setState(
                    {
                        displaySelectedBoundingBox: false,
                        cornerstoneMode: constants.cornerstoneMode.SELECTION,
                        editionMode: null,
                        isFABVisible: true,
                        isDetectionContextVisible: false,
                        detectionContextPosition: {
                            top: 0,
                            left: 0,
                        },
                    },
                    () => {
                        this.onDetectionSelected(e);
                        this.resetCornerstoneTool();
                        this.appUpdateImage();
                    }
                );
            } else {
                // Clicked on detection
                if (
                    combinedDetections[clickedPos].visible !== false &&
                    this.state.cornerstoneMode ===
                        constants.cornerstoneMode.SELECTION
                ) {
                    let anyDetection = this.currentSelection.selectDetection(
                        combinedDetections[clickedPos].algorithm,
                        combinedDetections[clickedPos].detectionIndex,
                        viewport
                    );
                    const selectedDetection = this.state.detections[
                        this.currentSelection.getAlgorithm()
                    ].getDataFromSelectedDetection();
                    for (const [key, detSet] of Object.entries(
                        this.state.detections
                    )) {
                        if (selectedDetection.algorithm !== detSet.algorithm) {
                            detSet.clearAll();
                        } else {
                            if (detSet.data.top !== undefined) {
                                detSet.data.top.forEach((det) => {
                                    if (det.uuid !== selectedDetection.uuid) {
                                        det.selected = false;
                                        det.updatingDetection = false;
                                    }
                                });
                            }
                            if (detSet.data.side !== undefined) {
                                detSet.data.side.forEach((det) => {
                                    if (det.uuid !== selectedDetection.uuid) {
                                        det.selected = false;
                                        det.updatingDetection = false;
                                    }
                                });
                            }
                        }
                    }
                    this.setState(
                        {
                            cornerstoneMode: constants.cornerstoneMode.EDITION,
                            displaySelectedBoundingBox: anyDetection,
                            isDetectionContextVisible: true,
                            isFABVisible: false,
                        },
                        () => {
                            // This is needed because currentSelection's algorithmNames property
                            // is being set inconsistently and the root cause was not located.
                            // Here, we reset the algorithmNames property to contain all algorithmNames
                            // from our state value, then update the currentSelection to be the current algorithm
                            const algoNames = Object.values(
                                this.state.detections
                            ).map((algo) => {
                                return {
                                    algorithm: algo.algorithm,
                                };
                            });

                            const ind = algoNames.findIndex(
                                (algo) =>
                                    algo.algorithm ===
                                    selectedDetection.algorithm
                            );
                            this.currentSelection.algorithmNames = algoNames;
                            this.currentSelection.setCurrentAlgorithm(ind);
                            this.onDetectionSelected(e);
                            this.renderDetectionContextMenu(e);
                        }
                    );
                } else if (
                    combinedDetections[clickedPos].visible !== false &&
                    this.state.cornerstoneMode ===
                        constants.cornerstoneMode.EDITION
                ) {
                    // We clicked a visible detection and are in edition mode
                    for (const [key, detSet] of Object.entries(
                        this.state.detections
                    )) {
                        detSet.clearAll();
                    }
                    this.setState(
                        {
                            displaySelectedBoundingBox: false,
                            cornerstoneMode:
                                constants.cornerstoneMode.SELECTION,
                            editionMode: null,
                            isFABVisible: true,
                            isDetectionContextVisible: false,
                            detectionContextPosition: {
                                top: 0,
                                left: 0,
                            },
                        },
                        () => {
                            this.onDetectionSelected(e);
                            this.resetCornerstoneTool();
                            this.appUpdateImage();
                        }
                    );
                }
            }
            clickedPos = constants.selection.NO_SELECTION;
            // this.currentSelection.resetAlgorithmPositionToEnd();
        }
    }
    /**
     * onDragEnd - Invoked when user stops dragging mouse or finger on touch device
     * @param {*}  Viewport The Cornerstone Viewport containing the event
     * @return {type} None
     */
    onDragEnd(event, viewport) {
        if (
            this.state.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION ||
            this.state.cornerstoneMode === constants.cornerstoneMode.EDITION
        ) {
            const toolState = cornerstoneTools.getToolState(
                viewport,
                'BoundingBoxDrawing'
            );
            if (toolState === undefined) {
                return;
            }
            const { data } = toolState;
            // Destructure data needed from event
            if (data === undefined) {
                return;
            } else if (data[0] === undefined) {
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
            let newDetection = new Detection(
                coords,
                null,
                data[0].class,
                data[0].confidence,
                true,
                data[0].algorithm,
                viewport === this.state.imageViewportTop
                    ? constants.viewport.TOP
                    : constants.viewport.SIDE,
                data[0].uuid
            );
            const stackIndex = this.state.myOra.stackData.findIndex((stack) => {
                return newDetection.view === stack.view;
            });
            let state = this.state;
            Dicos.detectionObjectToBlob(
                newDetection,
                this.state.myOra.stackData[stackIndex].blobData[0],
                function (newBlob) {
                    state.myOra.stackData[stackIndex].blobData.push(newBlob);
                    newDetection.blobData = newBlob;
                }
            );

            let updatedDetections = this.state.detections;
            if (data[0].updatingDetection === false) {
                // Need to determine if updating operator or new
                // Create new user-created detection
                const operator = constants.OPERATOR;
                // add new DetectionSet if it doesn't exist
                if (boundingBoxArea > constants.BOUNDING_BOX_AREA_THRESHOLD) {
                    if (!(operator in this.state.detections)) {
                        let newDetectionSet = new DetectionSet();
                        newDetectionSet.setAlgorithmName(operator);
                        newDetectionSet.visibility = true;
                        newDetectionSet.addDetection(
                            newDetection,
                            newDetection.view
                        );
                        this.currentSelection.addAlgorithm(newDetectionSet);
                        updatedDetections[operator] = newDetectionSet;
                    }
                    // Operator DetectionSet exists, add new detection to set
                    else {
                        updatedDetections[operator].addDetection(
                            newDetection,
                            newDetection.view
                        );
                    }
                } else {
                    this.setState(
                        {
                            cornerstoneMode:
                                constants.cornerstoneMode.SELECTION,
                            displayButtons: false,
                        },
                        () => {
                            this.resetCornerstoneTool();
                        }
                    );
                }
            } else {
                newDetection.selected = true;
                newDetection.updatingDetection = true;
                if (newDetection.view === constants.viewport.TOP) {
                    const detectionIndex = updatedDetections[
                        newDetection.algorithm
                    ].data.top.findIndex((det) => {
                        return data[0].uuid === det.uuid;
                    });
                    newDetection.detectionIndex = detectionIndex;
                    updatedDetections[newDetection.algorithm].data.top[
                        detectionIndex
                    ] = newDetection;
                } else if (newDetection.view === constants.viewport.SIDE) {
                    const detectionIndex = updatedDetections[
                        newDetection.algorithm
                    ].data.side.findIndex((det) => {
                        return data[0].uuid === det.uuid;
                    });
                    newDetection.detectionIndex = detectionIndex;
                    updatedDetections[newDetection.algorithm].data.side[
                        detectionIndex
                    ] = newDetection;
                }
            }
            if (
                this.state.cornerstoneMode ===
                constants.cornerstoneMode.ANNOTATION
            ) {
                this.setState(
                    {
                        cornerstoneMode: constants.cornerstoneMode.SELECTION,
                        displaySelectedBoundingBox: false,
                        detections: updatedDetections,
                        isDetectionContextVisible: false,
                    },
                    () => {
                        this.resetCornerstoneTool();
                        for (const [key, detectionSet] of Object.entries(
                            this.state.detections
                        )) {
                            detectionSet.clearAll();
                        }
                        this.appUpdateImage();
                    }
                );
            } else if (
                this.state.cornerstoneMode === constants.cornerstoneMode.EDITION
            ) {
                newDetection.updatingDetection = true;
                this.setState(
                    {
                        detections: updatedDetections,
                        isDetectionContextVisible: true,
                    },
                    () => {
                        this.renderDetectionContextMenu(event, newDetection);
                        // this.currentSelection.resetAlgorithmPositionToEnd();
                    }
                );
            }
        }
    }

    /**
     * resetSelectedDetectionBoxes - Unselect the selected detection and hide the two "feedback" buttons.
     *
     * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
     * @return {type}  None
     */
    resetSelectedDetectionBoxes(e, sideMenuUpdate = false) {
        if (
            this.state.cornerstoneMode ===
                constants.cornerstoneMode.SELECTION ||
            sideMenuUpdate === true
        ) {
            for (const [key, detectionSet] of Object.entries(
                this.state.detections
            )) {
                detectionSet.clearAll();
            }
            this.setState(
                {
                    displaySelectedBoundingBox: false,
                    cornerstoneMode: constants.cornerstoneMode.SELECTION,
                    editionMode: null,
                    isDetectionContextVisible: false,
                    detectionContextPosition: {
                        top: 0,
                        left: 0,
                    },
                },
                () => {
                    this.onDetectionSelected(e);
                    this.resetCornerstoneTool();
                    this.appUpdateImage();
                }
            );
        } else {
            this.setState({
                isDetectionContextVisible: false,
                editionMode: null,
            });
        }
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
    onDetectionSelected(e) {
        const viewportInfo = Utils.eventToViewportInfo(e);
        const view =
            viewportInfo.viewport === constants.viewport.TOP
                ? constants.viewport.TOP
                : constants.viewport.SIDE;
        if (
            this.state.detections === null ||
            this.currentSelection.getAlgorithm() === undefined ||
            this.state.detections[this.currentSelection.getAlgorithm()] ===
                undefined ||
            this.state.detections[this.currentSelection.getAlgorithm()].getData(
                view
            ).length === 0
        ) {
            return;
        }
        const detectionData = this.state.detections[
            this.currentSelection.getAlgorithm()
        ].getDataFromSelectedDetection();
        if (detectionData !== undefined) {
            const detectionBoxCoords = detectionData.boundingBox;
            this.setState(
                {
                    displaySelectedBoundingBox: true,
                },
                () => {
                    const data = {
                        handles: {
                            end: {
                                x: detectionBoxCoords[2],
                                y: detectionBoxCoords[3],
                            },
                            start: {
                                x: detectionBoxCoords[0],
                                y: detectionBoxCoords[1],
                            },
                        },
                        uuid: detectionData.uuid,
                        algorithm: detectionData.algorithm,
                        class: detectionData.class,
                        renderColor: detectionData.getRenderColor(),
                        confidence: detectionData.confidence,
                        updatingDetection: true,
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
                    for (const [key, myDetectionSet] of Object.entries(
                        this.state.detections
                    )) {
                        myDetectionSet.lowerOpacity = true;
                    }
                    detectionData.updatingDetection = true;
                    cornerstoneTools.setToolActive('BoundingBoxDrawing', {
                        mouseButtonMask: 1,
                    });
                    cornerstoneTools.setToolOptions('BoundingBoxDrawing', {
                        cornerstoneMode: constants.cornerstoneMode.EDITION,
                    });
                    this.appUpdateImage();
                }
            );
        }
        this.appUpdateImage();
    }

    /**
     * onAlgorithmSelected - It updates detection sets' visualization
     *
     * @return {none} None
     * @param selected {boolean} - Indicates whether the algorithm was selected or not
     * @param algorithm {string} - Algorithm's name
     */
    onAlgorithmSelected(selected, algorithm) {
        if (selected === true) {
            for (const [key, myDetectionSet] of Object.entries(
                this.state.detections
            )) {
                myDetectionSet.lowerOpacity = true;
            }
        }
        this.setState(
            {
                displaySelectedBoundingBox: false,
                isDetectionContextVisible: false,
                isFABVisible: selected,
                cornerstoneMode: constants.cornerstoneMode.SELECTION,
            },
            () => {
                this.resetCornerstoneTool();
                this.appUpdateImage();
            }
        );
    }

    /**
     * onMenuDetectionSelected - It updates validation button visualization.
     *
     * @return {none} None
     * @param detection {Detection} - detection-related data used as reference for buttons' location
     */
    onMenuDetectionSelected(detection, e) {
        const prevState = this.state;
        const updatedDetections = this.state.detections;
        updatedDetections[detection.algorithm].selectedDetection = detection;
        this.setState({ detections: updatedDetections });
        const viewportInfo = Utils.getDataFromViewport(
            detection.view,
            document
        );

        this.setState(
            {
                displaySelectedBoundingBox: true,
                cornerstoneMode: detection.selected
                    ? constants.cornerstoneMode.EDITION
                    : constants.cornerstoneMode.SELECTION,
                isDetectionContextVisible: detection.selected,
            },
            () => {
                this.resetCornerstoneTool();
                if (detection.selected === true) {
                    for (const [key, detSet] of Object.entries(
                        this.state.detections
                    )) {
                        if (detection.algorithm !== detSet.algorithm) {
                            detSet.clearAll();
                        } else {
                            if (detSet.data.top !== undefined) {
                                detSet.data.top.forEach((det) => {
                                    if (det.uuid !== detection.uuid) {
                                        det.selected = false;
                                        det.updatingDetection = false;
                                    }
                                });
                            }
                            if (detSet.data.side !== undefined) {
                                detSet.data.side.forEach((det) => {
                                    if (det.uuid !== detection.uuid) {
                                        det.selected = false;
                                        det.updatingDetection = false;
                                    }
                                });
                            }
                        }
                        detSet.lowerOpacity = true;
                    }
                    this.currentSelection.selectDetection(
                        detection.algorithm,
                        detection.detectionIndex,
                        detection.view
                    );
                    this.renderDetectionContextMenu(e);
                } else {
                    for (const [key, detSet] of Object.entries(
                        this.state.detections
                    )) {
                        detSet.clearAll();
                    }
                    this.setState(
                        {
                            editionMode: null,
                            isFABVisible: true,
                            detectionContextPosition: {
                                top: 0,
                                left: 0,
                            },
                        },
                        () => {
                            this.appUpdateImage();
                        }
                    );
                }
                this.onDetectionSelected(e);
            }
        );
    }

    /**
     * Invoked when user selects bounding box option from FAB
     * @return {none} None
     * @param {none} None
     */
    onBoundingBoxSelected() {
        if (
            this.state.cornerstoneMode === constants.cornerstoneMode.SELECTION
        ) {
            this.setState(
                {
                    cornerstoneMode: constants.cornerstoneMode.ANNOTATION,
                    displaySelectedBoundingBox: true,
                },
                () => {
                    for (const [key, myDetectionSet] of Object.entries(
                        this.state.detections
                    )) {
                        myDetectionSet.selectAlgorithm(false);
                    }
                    this.appUpdateImage();
                    cornerstoneTools.setToolActive('BoundingBoxDrawing', {
                        mouseButtonMask: 1,
                    });
                }
            );
        }

        this.clearDetectionset(this.state.detections);
    }

    /**
     * 
     * Method invoked to clear detectionset
     * 
     */
    clearDetectionset(listOfDetections) {

        for (const [key, detectionSet] of Object.entries(
            listOfDetections
        )) {

            detectionSet.clearAll();
        }

    }

    /**
     * Invoked when user selects polygon mask option from FAB
     * @return {none} None
     * @param {none} None
     */
    onPolygonMaskSelected() {
        this.clearDetectionset(this.state.detections);
    }

    /**
     * Invoked when user selects a detection (callback from onMouseClicked)
     * @param {Event} event Related mouse click event to position the widget relative to detection
     * @param {Detection} [draggedData] Optional detection data. In the case that
     * a detection is moved during a drag event, the data in state is out of date until after this
     * function is called. Use the param data to render the context menu.
     */
    renderDetectionContextMenu(event, draggedData = undefined) {
        const viewportInfo = Utils.eventToViewportInfo(event);
        const detectionData = draggedData
            ? draggedData
            : this.state.detections[
                  this.currentSelection.getAlgorithm()
              ].getDataFromSelectedDetection();
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
                        viewportInfo.offset / this.state.zoomLevelTop -
                        boundingWidth;
                    originCoordX = 2;
                    viewport = this.state.imageViewportTop;
                } else {
                    originCoordX = 0;
                    detectionContextGap =
                        viewportInfo.offset / this.state.zoomLevelSide -
                        boundingHeight / boundingWidth;
                    viewport = this.state.imageViewportSide;
                }
                const { x, y } = cornerstone.pixelToCanvas(viewport, {
                    x: boundingBoxCoords[originCoordX] + detectionContextGap,
                    y: boundingBoxCoords[1] + boundingHeight + 4,
                });

                this.setState(
                    {
                        detectionContextPosition: {
                            top: y,
                            left: x,
                        },
                    },
                    () => {
                        this.appUpdateImage();
                    }
                );
            }
        }
    }
    /**
     * Invoked when user selects an edition mode from DetectionContextMenu
     * @param {string} newMode Edition mode selected from menu
     */
    selectEditionMode(newMode) {
        if ([...Object.values(constants.editionMode)].includes(newMode)) {
            this.setState(
                {
                    editionMode: newMode,
                },
                () => this.appUpdateImage()
            );
        }
    }

    /**
     * Invoked when user completes editing a detection's label
     * @param {string} newLabel Updated label name from user interaction
     */
    editDetectionLabel(newLabel) {
        // Destructure and gather useful data from selected detection
        const algo = this.currentSelection.getAlgorithm();
        const { uuid, view } = this.state.detections[
            algo
        ].getDataFromSelectedDetection();

        if (uuid && view) {
            let updatedDetections = this.state.detections;
            // Find index of selected detection by uuid
            const idx = updatedDetections[algo].data[view].findIndex(
                (detection) => (detection.uuid = uuid)
            );

            if (idx !== -1) {
                // Update label and color of detection
                updatedDetections[algo].data[view][idx].class = newLabel;
                updatedDetections[algo].data[view][
                    idx
                ].color = Utils.getRandomColor(newLabel);

                // Clear selections, etc. of all detections
                for (const detectionSet of Object.values(updatedDetections)) {
                    detectionSet.clearAll();
                }
                this.setState(
                    {
                        isFABVisible: true,
                        detections: updatedDetections,
                        editionMode: null,
                        cornerstoneMode: constants.cornerstoneMode.SELECTION,
                        detectionLabels: [],
                        detectionLabelEditWidth: 0,
                        detectionLabelEditPosition: { top: 0, left: 0 },
                        displaySelectedBoundingBox: false,
                    },
                    () => {
                        this.appUpdateImage();
                        this.resetCornerstoneTool();
                    }
                );
            }
        }
    }
    /**
     * Invoked when user selects 'label' option from DetectionContextMenu
     * Renders and positions EditLabel widget relative to detection
     */
    selectEditDetectionLabel() {
        const detectionData = this.state.detections[
            this.currentSelection.getAlgorithm()
        ].getDataFromSelectedDetection();

        if (detectionData) {
            // Destructure relevant info related to selected detection
            const {
                boundingBox,
                view,
                class: label,
                confidence,
            } = detectionData;
            if (boundingBox) {
                // Get all detection label options for label list
                const allLabels = this.getAllLabels();

                const boundingHeight = Math.abs(
                    boundingBox[3] - boundingBox[1]
                );
                const boundingWidth = Math.abs(boundingBox[2] - boundingBox[0]);

                // Position component on top of existing detection label
                let gap, viewport, labelHeight;
                if (view === constants.viewport.TOP) {
                    const canvas = this.state.imageViewportTop.children[0];
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
                    const { offsetLeft } = this.state.imageViewportTop;
                    gap = offsetLeft / this.state.zoomLevelTop;
                    viewport = this.state.imageViewportTop;
                    labelHeight = labelSize.height;
                } else {
                    const canvas = this.state.imageViewportSide.children[0];
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
                    const { offsetLeft } = this.state.imageViewportSide;
                    gap = offsetLeft / this.state.zoomLevelSide;
                    viewport = this.state.imageViewportSide;
                    labelHeight = labelSize.height;
                }
                const { x, y } = cornerstone.pixelToCanvas(viewport, {
                    x: boundingBox[0] + gap,
                    y: boundingBox[1] - labelHeight,
                });
                const widgetPosition = {
                    top: y,
                    left: x,
                };
                this.setState(
                    {
                        isDetectionContextVisible: false,
                        editionMode: constants.editionMode.LABEL,
                        detectionLabels: allLabels,
                        detectionLabelEditWidth: boundingWidth,
                        detectionLabelEditPosition: widgetPosition,
                    },
                    () => {
                        this.appUpdateImage();
                    }
                );
            }
        }
    }

    /**
     * Invoked when user selects 'bounding box' option from DetectionContextMenu
     */
    editBoundingBox() {
        console.log('edit bounding box selected');
    }

    /**
     * Invoked when user selects 'polygon mask' option from DetectionContextMenu
     */
    editPolygonMask() {
        console.log('edit polygon mask selected');
    }

    /**
     * Invoked when user selects 'delete' option from DetectionContextMenu
     */
    deleteDetection() {
        const updatedDetections = this.state.detections;
        const selectedDetection = updatedDetections[
            this.currentSelection.getAlgorithm()
        ].getDataFromSelectedDetection();
        let updatedStack;
        // Detection is selected
        if (selectedDetection) {
            updatedDetections[selectedDetection.algorithm].deleteDetection(
                selectedDetection
            );
            if (selectedDetection.view === constants.viewport.TOP) {
                this.state.myOra.setStackBlobData(
                    0,
                    this.state.myOra.stackData[0].blobData.filter(
                        (blob) => blob.size !== selectedDetection.blobData.size
                    )
                );
            } else if (selectedDetection.view === constants.viewport.SIDE) {
                this.state.myOra.setStackBlobData(
                    1,
                    this.state.myOra.stackData[1].blobData.filter(
                        (blob) => blob.size !== selectedDetection.blobData.size
                    )
                );
            }

            // Remove empty DetectionSet
            if (updatedDetections[selectedDetection.algorithm].isEmpty()) {
                delete updatedDetections[selectedDetection.algorithm];

                this.currentSelection.availableAlgorithms = updatedDetections;
                this.currentSelection.algorithmNames = Object.values(
                    updatedDetections
                ).map((detectionSet) => {
                    return {
                        algorithm: detectionSet.algorithm,
                    };
                });

                this.currentSelection.resetAlgorithmPositionToEnd();
            }

            // Reset remaining DetectionSets to `un-selected` state
            for (const [key, detectionSet] of Object.entries(
                updatedDetections
            )) {
                detectionSet.clearAll();
            }
        }
        this.setState(
            {
                detections: updatedDetections,
                isFABVisible: true,
                isDetectionContextVisible: false,
                isDrawingBoundingBox: false,
                displaySelectedBoundingBox: false,
                cornerstoneMode: constants.cornerstoneMode.SELECTION,
            },
            () => {
                this.resetCornerstoneTool();
                this.appUpdateImage();
            }
        );
    }

    /**
     * Calls `DetectionSet` method `getClassNames` for each algorithm in detections state
     * @returns {Array<string>} array of all unique class names
     */
    getAllLabels() {
        let results = [];
        const { detections } = this.state;
        for (const algo in detections) {
            const labels = detections[algo].getClassNames();
            const uniqueLabels = labels.filter(
                (label) => !results.find((existing) => existing === label)
            );
            results = [...results, ...uniqueLabels];
        }
        return results;
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
                    <TopBar
                        connectedServer={this.props.processingHost}
                        processingFile={this.props.currentProcessingFile}
                        numberOfFiles={this.props.numFilesInQueue}
                        isUpload={this.props.isUpload}
                        isDownload={this.props.isDownload}
                        isConnected={this.props.isConnected}
                    />
                    <SideMenu
                        detections={this.state.detections}
                        configurationInfo={this.state.configurationInfo}
                        enableMenu={this.props.isFileInQueue}
                        appUpdateImage={this.appUpdateImage}
                        onAlgorithmSelected={this.onAlgorithmSelected}
                        onMenuDetectionSelected={this.onMenuDetectionSelected}
                        resetSelectedDetectionBoxes={
                            this.resetSelectedDetectionBoxes
                        }
                        onDetectionSelected={this.onMouseClicked}
                        nextImageClick={this.nextImageClick}
                        enableNextButton={
                            !this.state.displaySelectedBoundingBox &&
                            this.state.cornerstoneMode ===
                                constants.cornerstoneMode.SELECTION
                        }
                    />
                    <div id="algorithm-outputs"> </div>
                    <DetectionContextMenu
                        position={this.state.detectionContextPosition}
                        isVisible={this.state.isDetectionContextVisible}
                        selectedOption={this.state.editionMode}
                        setSelectedOption={this.selectEditionMode}
                        onLabelClicked={this.selectEditDetectionLabel}
                        onBoundingClicked={this.editBoundingBox}
                        onPolygonClicked={this.editPolygonMask}
                        onDeleteClicked={this.deleteDetection}
                    />
                    <EditLabel
                        isVisible={
                            this.state.editionMode ===
                            constants.editionMode.LABEL
                        }
                        position={this.state.detectionLabelEditPosition}
                        width={this.state.detectionLabelEditWidth}
                        labels={this.state.detectionLabels}
                        onLabelChange={this.editDetectionLabel}
                    />
                    <BoundPolyFAB
                        isVisible={this.state.isFABVisible}
                        cornerstoneMode={this.state.cornerstoneMode}
                        onBoundingSelect={this.onBoundingBoxSelected}
                        onPolygonSelect={this.onPolygonMaskSelected}
                    />
                    <NoFileSign isVisible={!this.props.isFileInQueue} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { server } = state;
    return {
        isConnected: server.isConnected,
        isDownload: server.isDownload,
        isUpload: server.isUpload,
        isFileInQueue: server.isFileInQueue,
        numFilesInQueue: server.numFilesInQueue,
        processingHost: server.processingHost,
        currentProcessingFile: server.currentProcessingFile,
    };
};

export default connect(mapStateToProps, {
    setCommandServerConnection,
    setFileServerConnection,
    setDownload,
    setUpload,
    setIsFileInQueue,
    setNumFilesInQueue,
    setProcessingHost,
    setCurrentProcessingFile,
})(App);
