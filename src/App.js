import './App.css';
import React from 'react';
import { Component } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import dicomParser from 'dicom-parser';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import socketIOClient from 'socket.io-client';
import ORA from './ORA.js';
import Stack from './Stack.js';
import Utils from './Utils.js';
import Dicos from './Dicos.js';
import Detection from './Detection.js';
import axios from 'axios';
import SideMenu from './components/SideMenu';
import TopBar from './components/TopBar/TopBar';
import ValidationButtons from './components/ValidationButtons';
import JSZip from 'jszip';
import DetectionSet from './DetectionSet';
import Selection from './Selection';
import NoFileSign from './components/NoFileSign';
import * as constants from './Constants';
import * as mixins from './cornerstone-tools/mixins/index';
import BoundingBoxDrawingTool from './cornerstone-tools/BoundingBoxDrawingTool';
import BoundPolyFAB from './components/FAB/BoundPolyFAB';

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
            isEditingOrAnnotating: false, // To be used to keep track of when the new tool is open
            receiveTime: null,
            displayButtons: false,
            buttonStyles: {
                confirm: {},
                reject: {},
            },
            displayNext: false,
            fileInQueue: false,
            nextAlgBtnEnabled: false,
            prevAlgBtnEnabled: false,
            zoomLevelTop: constants.viewportStyle.ZOOM,
            zoomLevelSide: constants.viewportStyle.ZOOM,
            imageViewportTop: document.getElementById('dicomImageLeft'),
            imageViewportSide: document.getElementById('dicomImageRight'),
            singleViewport: true,
            viewport: cornerstone.getDefaultViewport(null, undefined),
            isConnected: false,
            numOfFilesInQueue: 0,
            isUpload: false,
            isDownload: false,
            currentProcessingFile: null,
            processingHost: null,
            socketCommand: null,
            socketFS: null,
            cornerstoneMode: constants.cornerstoneMode.SELECTION,
            isFABVisible: false,
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
        this.hideButtons = this.hideButtons.bind(this);
        this.updateNumberOfFiles = this.updateNumberOfFiles.bind(this);
        this.appUpdateImage = this.appUpdateImage.bind(this);
        this.onDetectionSelected = this.onDetectionSelected.bind(this);
        this.onAlgorithmSelected = this.onAlgorithmSelected.bind(this);
        this.resizeListener = this.resizeListener.bind(this);
        this.calculateviewPortWidthAndHeight = this.calculateviewPortWidthAndHeight.bind(
            this
        );
        this.onBoundingBoxSelected = this.onBoundingBoxSelected.bind(this);
        this.onPolygonMaskSelected = this.onPolygonMaskSelected.bind(this);
        this.resetCornerstoneTool = this.resetCornerstoneTool.bind(this);
    }

    /**
     * componentDidMount - Method invoked after all elements on the page are rendered properly
     *
     * @return {type}  None
     */
    componentDidMount() {
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
            'cornerstonetoolsmousedrag',
            this.hideButtons
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolsmousewheel',
            this.hideButtons
        );
        this.state.imageViewportTop.addEventListener(
            'cornerstonetoolstouchpinch',
            this.hideButtons
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
            'cornerstonetoolsmousedrag',
            this.hideButtons
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolsmousewheel',
            this.hideButtons
        );
        this.state.imageViewportSide.addEventListener(
            'cornerstonetoolstouchpinch',
            this.hideButtons
        );
        window.addEventListener('resize', this.resizeListener);

        this.calculateviewPortWidthAndHeight();

        const hostname = window.location.hostname;
        constants.server.FILE_SERVER_ADDRESS =
            constants.server.PROTOCOL +
            hostname +
            constants.server.FILE_SERVER_PORT;
        this.setState({ processingHost: hostname });

        let reactObj = this;
        this.setState({
            socketCommand: socketIOClient(constants.COMMAND_SERVER),
        });
        this.setState(
            { socketFS: socketIOClient(constants.server.FILE_SERVER_ADDRESS) },
            () => {
                reactObj.getFilesFromCommandServer();
                reactObj.updateNumberOfFiles();
                reactObj.setupCornerstoneJS(
                    reactObj.state.imageViewportTop,
                    reactObj.state.imageViewportSide
                );
            }
        );

        this.setState({
            isFABVisible: true,
        });
    }

    /**
     * calculateviewPortWidthAndHeight - Function to calculate the ViewPorts width and Height.
     *
     * @param  None
     * @returns {type} None
     */
    calculateviewPortWidthAndHeight() {
        document.getElementsByClassName('twoViewportsSide')[0].style.left =
            (window.innerWidth - constants.sideMenuWidth) / 2 +
            constants.sideMenuWidth +
            constants.RESOLUTION_UNIT;
        document.getElementsByClassName('twoViewportsSide')[0].style.width =
            (window.innerWidth - constants.sideMenuWidth) / 2 +
            constants.RESOLUTION_UNIT;
        document.getElementsByClassName('twoViewportsTop')[0].style.width =
            (window.innerWidth - constants.sideMenuWidth) / 2 +
            constants.RESOLUTION_UNIT;
        document.getElementById('verticalDivider').style.left =
            (window.innerWidth - constants.sideMenuWidth) / 2 +
            constants.sideMenuWidth +
            constants.RESOLUTION_UNIT;
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
            this.hideButtons
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolsmousewheel',
            this.hideButtons
        );
        this.state.imageViewportTop.removeEventListener(
            'cornerstonetoolstouchpinch',
            this.hideButtons
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
            this.hideButtons
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolsmousewheel',
            this.hideButtons
        );
        this.state.imageViewportSide.removeEventListener(
            'cornerstonetoolstouchpinch',
            this.hideButtons
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

        if (this.state.displayButtons === true) {
            for (const [key, detectionSet] of Object.entries(
                this.state.detections
            )) {
                detectionSet.clearAll();
            }
            this.setState({ displayButtons: false }, () => {
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
        const boundingBoxDrawingToolMixin = cornerstoneTools.importInternal(
            './cornerstone-tools/mixins/boundingBoxDrawingToolMixin'
        );
        cornerstoneTools.register(
            'mixin',
            'boundingBoxDrawingToolMixin',
            boundingBoxDrawingToolMixin,
            true
        );
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
     * Invoked when user leaves annotation or edition mode
     * @param   {type} None
     * @return   {type} None
     */

    resetCornerstoneTool() {
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
        this.state.socketCommand.on('connect', () => {
            this.setState({ isConnected: true });
        });

        this.state.socketCommand.on('img', (data) => {
            this.sendImageToFileServer(Utils.b64toBlob(data)).then((res) => {
                // If we got an image and we are null, we know we can now fetch one
                // This is how it triggers to display a new file if none existed and a new one
                // was added
                this.setState({ isDownload: false });
                if (this.state.selectedFile === null) {
                    this.getNextImage();
                }
            });
        });
        this.state.socketCommand.on('disconnect', () => {
            this.setState({ isConnected: false });
        });
    }

    /**
     * updateNumberOfFiles - Opens a socket to constantly monitor the number of files with the file server
     * @param {type} - None
     * @return {type} - Promise
     */
    async updateNumberOfFiles() {
        this.state.socketFS.on('numberOfFiles', (data) => {
            if (!this.state.fileInQueue && data > 0) {
                this.state.imageViewportTop.style.visibility = 'visible';
                this.getNextImage();
            }
            this.setState({
                numberOfFilesInQueue: data,
                fileInQueue: data > 0,
            });
        });
    }

    /**
     * sendImageToFileServer - Socket IO to send an image to the file server
     * @param {type} - file - which file we are sending
     * @return {type} - None
     */
    async sendImageToFileServer(file) {
        this.setState({ isDownload: true });
        this.state.socketFS.binary(true).emit('fileFromClient', file);
    }

    /**
     * sendImageToCommandServer - Socket IO to send a file to the server
     * @param {type} - file - which file we are sending
     * @return {type} - None
     */
    async sendImageToCommandServer(file) {
        this.setState({ isUpload: true });
        this.state.socketCommand.binary(true).emit('fileFromClient', file);
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
                    // Need to clear the canvas here or make a no image to load display
                    this.onNoImageLeft();
                } else {
                    var fileNameProcessing = Utils.getFilenameFromURI(
                        res.data.fileNameProcessing
                    );
                    this.state.currentProcessingFile = fileNameProcessing;
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
                            for (const [key, detectionSet] of Object.entries(
                                this.state.detections
                            )) {
                                if (detectionSet.data.top !== undefined) {
                                    for (
                                        let j = 0;
                                        j < detectionSet.data.top.length;
                                        j++
                                    ) {
                                        newOra.file(
                                            `data/${stack.view}_threat_detection_${topCounter}.dcs`,
                                            Dicos.dataToBlob(
                                                detectionSet,
                                                stack.blobData[j + topCounter],
                                                Date.now(),
                                                !validationCompleted
                                            )
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
                                }
                            }
                            // Loop through each detection and only the side view of the detection
                        } else if (stack.view === 'side') {
                            for (const [key, detectionSet] of Object.entries(
                                this.state.detections
                            )) {
                                if (detectionSet.data.side !== undefined) {
                                    for (
                                        let j = 0;
                                        j < detectionSet.data.side.length;
                                        j++
                                    ) {
                                        newOra.file(
                                            `data/${stack.view}_threat_detection_${sideCounter}.dcs`,
                                            Dicos.dataToBlob(
                                                detectionSet,
                                                stack.blobData[j + sideCounter],
                                                Date.now(),
                                                !validationCompleted
                                            )
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
                                }
                            }
                        }
                        stackCounter++;
                        imageElem.appendChild(stackElem);
                    });
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
                    newOra.generateAsync({ type: 'blob' }).then((oraBlob) => {
                        this.sendImageToCommandServer(oraBlob).then((res) => {
                            this.hideButtons(e);
                            this.setState({
                                selectedFile: null,
                                isUpload: false,
                                displayNext: false,
                            });
                            this.getNextImage();
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
            if (detectionSet.isValidated() === false) {
                result = false;
                break;
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
            this.setState({ updatedImageViewportSide });

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
     * @param  {type} images list of DICOS+TDR data from each algorithm
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
                            constants.viewport.TOP
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
                                constants.viewport.SIDE
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
            detectionList = detectionSet.getData();
            selectedViewport = constants.viewport.TOP;
            if (
                context.canvas.offsetParent.id === 'dicomImageRight' &&
                this.state.singleViewport === false
            ) {
                detectionList = detectionSet.getData(constants.viewport.SIDE);
                selectedViewport = constants.viewport.SIDE;
            }
            if (detectionList === undefined) {
                return;
            } else {
                if (detectionList === null || detectionList.length === 0) {
                    return;
                }
            }
            for (let j = 0; j < detectionList.length; j++) {
                if (detectionList[j].visible !== true) continue;
                const boundingBoxCoords = detectionList[j].boundingBox;
                let color = detectionList[j].getRenderColor();
                if (
                    color === constants.detectionStyle.SELECTED_COLOR &&
                    j > 0
                ) {
                    detectionList[j].selected = false;
                    color = detectionList[j].getRenderColor();
                    this.appUpdateImage();
                }
                if (boundingBoxCoords.length < B_BOX_COORDS) return;
                if (detectionSet.anotherSelected === true) {
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

                // Line rendering
                if (
                    detectionList[j].selected &&
                    this.state.displayButtons === true
                ) {
                    this.renderLinesFromRect(detectionList[j], context);
                }

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
     * renderLinesFromRect - render lines than link validation buttons to the bounding box of the selected detection
     *
     * @param {Detection} detectionData - Detection object that represents the selected detection. Its bounding box is use as reference
     * to calculate lines' end points
     * @param {Event.eventData.canvasContext} context - canvas' rendering context
     * @return {type}   None
     */
    renderLinesFromRect(detectionData, context) {
        let zoomLevel;
        let bboxCoordXIndex;
        let factor = 1;
        const boundingBoxCoords = detectionData.boundingBox;
        if (detectionData.view === 'top') {
            zoomLevel = this.state.zoomLevelTop;
            bboxCoordXIndex = 2;
        } else {
            zoomLevel = this.state.zoomLevelSide;
            bboxCoordXIndex = 0;
            factor = -1;
        }
        const buttonGap =
            (constants.buttonStyle.GAP - constants.buttonStyle.HEIGHT / 2) /
            zoomLevel;
        context.beginPath();
        context.moveTo(
            boundingBoxCoords[bboxCoordXIndex],
            boundingBoxCoords[1] + constants.buttonStyle.LINE_GAP / 2
        );
        context.lineTo(
            boundingBoxCoords[bboxCoordXIndex] +
                (factor * constants.buttonStyle.MARGIN_LEFT) / zoomLevel,
            boundingBoxCoords[1] + buttonGap
        );
        context.stroke();
        context.beginPath();
        context.moveTo(
            boundingBoxCoords[bboxCoordXIndex] -
                (factor * constants.buttonStyle.LINE_GAP) / 2,
            boundingBoxCoords[1]
        );
        context.lineTo(
            boundingBoxCoords[bboxCoordXIndex] +
                (factor * constants.buttonStyle.MARGIN_LEFT) / zoomLevel,
            boundingBoxCoords[1] - buttonGap
        );
        context.stroke();
    }

    /**
     * onMouseClicked - Callback function invoked on mouse clicked in image viewport. We handle the selection of detections.
     *
     * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
     * @return {type}   None
     */
    onMouseClicked(e) {
        if (
            this.state.detections === null ||
            this.state.detections[
                this.currentSelection.getAlgorithm()
            ].getData().length === 0
        ) {
            return;
        }
        this.currentSelection.resetAlgorithmPositionToEnd();
        do {
            let detectionSet = this.state.detections[
                this.currentSelection.getAlgorithm()
            ];
            let clickedPos = constants.selection.NO_SELECTION;
            let feedback = undefined;

            // User selected 'next' button, update all detections as accepted
            if (e.currentTarget.id === 'nextButton') {
                let updatedDetections = this.state.detections;
                Object.keys(updatedDetections).forEach((algo) => {
                    const { data } = updatedDetections[algo];
                    Object.keys(data).forEach((detection) => {
                        data[detection].forEach((view) => {
                            view.validation = true;
                        });
                    });
                });
            } else if (['confirm', 'reject'].includes(e.currentTarget.id)) {
                // User is submitting feedback through confirm or reject buttons
                if (
                    e.currentTarget.id === 'confirm' ||
                    e.currentTarget.id === 'reject'
                ) {
                    if (e.currentTarget.id === 'confirm') {
                        feedback = true;
                    }
                    if (e.currentTarget.id === 'reject') {
                        feedback = false;
                    }
                    detectionSet.validateSelectedDetection(feedback);
                    if (this.validationCompleted()) {
                        this.setState({
                            displayButtons: false,
                            displayNext: true,
                        });
                    } else {
                        this.setState({
                            displayButtons: false,
                        });
                    }
                    this.appUpdateImage();
                }
            }

            // Handle regular click events for selecting and deselecting detections
            else {
                const mousePos = cornerstone.canvasToPixel(e.target, {
                    x: e.detail.currentPoints.canvas.x,
                    y: e.detail.currentPoints.canvas.y,
                });
                let detectionSetData = detectionSet.getData();
                let viewport = constants.viewport.TOP;
                if (
                    e.detail.element.id === 'dicomImageRight' &&
                    this.state.singleViewport === false
                ) {
                    detectionSetData = detectionSet.getData(
                        constants.viewport.SIDE
                    );
                    viewport = constants.viewport.SIDE;
                }
                if (detectionSetData !== undefined) {
                    for (var j = 0; j < detectionSetData.length; j++) {
                        if (
                            Utils.pointInRect(
                                mousePos,
                                detectionSetData[j].boundingBox
                            )
                        ) {
                            clickedPos = j;
                            break;
                        }
                    }
                } else {
                    return;
                }
                // Click on an empty area
                if (clickedPos === constants.selection.NO_SELECTION) {
                    if (
                        this.state.cornerstoneMode !==
                        constants.cornerstoneMode.ANNOTATION
                    ) {
                        detectionSet.clearAll();
                        this.setState({ displayButtons: false }, () => {
                            this.renderButtons(e);
                        });
                    }
                    // User is in annotation mode, reset tool to default selection
                    else if (
                        this.state.cornerstoneMode ===
                        constants.cornerstoneMode.ANNOTATION
                    ) {
                        this.setState(
                            {
                                cornerstoneMode:
                                    constants.cornerstoneMode.SELECTION,
                            },
                            () => {
                                this.resetCornerstoneTool();
                            }
                        );
                    }
                } else {
                    for (const [key, myDetectionSet] of Object.entries(
                        this.state.detections
                    )) {
                        myDetectionSet.selectAlgorithm(false);
                    }
                    if (
                        detectionSet.visibility !== false &&
                        this.state.cornerstoneMode !==
                            constants.cornerstoneMode.ANNOTATION
                    ) {
                        let anyDetection = this.currentSelection.selectDetection(
                            detectionSet.algorithm,
                            clickedPos,
                            viewport
                        );
                        if (
                            detectionSet.getDataFromSelectedDetection()
                                .visible === false
                        ) {
                            detectionSet.getDataFromSelectedDetection().selected = false;
                            continue;
                        }
                        this.setState({ displayButtons: anyDetection }, () => {
                            this.renderButtons(e);
                        });
                        if (
                            anyDetection !== undefined ||
                            anyDetection !== null
                        ) {
                            break;
                        }
                    }
                }
            }
        } while (this.currentSelection.selectPriorAlgorithm() === true);
        this.currentSelection.resetAlgorithmPositionToEnd();
    }

    /**
     * hideButtons - Unselect the selected detection and hide the two "feedback" buttons.
     *
     * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
     * @return {type}  None
     */
    hideButtons(e) {
        for (const [key, detectionSet] of Object.entries(
            this.state.detections
        )) {
            detectionSet.clearAll();
        }
        this.setState({ displayButtons: false }, () => {
            this.renderButtons(e);
        });
    }

    /**
     * renderButtons - Function that handles the logic behind whether or not to display
     * the feedback buttons and where to display those buttons depending on the current
     * zoom level in the window
     *
     * @param  {Event} e Event data passed from the onMouseClick function,
     * such as the mouse cursor position, mouse button clicked, etc.
     * @return {type}   None
     */
    renderButtons(e) {
        if (
            this.state.detections === null ||
            this.currentSelection.getAlgorithm() === undefined ||
            this.state.detections[
                this.currentSelection.getAlgorithm()
            ].getData().length === 0
        ) {
            return;
        }
        const viewportInfo = Utils.eventToViewportInfo(e);
        const detectionData = this.state.detections[
            this.currentSelection.getAlgorithm()
        ].getDataFromSelectedDetection();
        this.renderButtonsFromRef(viewportInfo, detectionData);
    }

    /**
     * renderButtonsFromRef - Function that display validations buttons depending on the current
     * zoom level in the window and the given reference rectangle
     *
     * @param  {dictionary} viewportInfo - It provides information about the current viewport and its offset
     * @return {Detection} detectionData - Detection object that represents the reference used for button rendering
     */
    renderButtonsFromRef(viewportInfo, detectionData) {
        let leftAcceptBtn,
            topAcceptBtn,
            topRejectBtn = 0;
        if (viewportInfo.viewport !== null) {
            if (this.state.displayButtons !== false) {
                let coordsAcceptBtn,
                    coordsRejectBtn,
                    zoomLevel,
                    margin,
                    buttonGap,
                    btnOriginCoordX,
                    btnOriginGap,
                    viewport;
                if (viewportInfo.viewport === constants.viewport.TOP) {
                    zoomLevel = this.state.zoomLevelTop;
                    margin =
                        constants.buttonStyle.MARGIN_LEFT /
                        this.state.zoomLevelTop;
                    btnOriginCoordX = 2;
                    btnOriginGap =
                        margin + viewportInfo.offset / this.state.zoomLevelTop;
                    viewport = this.state.imageViewportTop;
                } else {
                    zoomLevel = this.state.zoomLevelSide;
                    margin =
                        constants.buttonStyle.MARGIN_RIGHT /
                        this.state.zoomLevelSide;
                    btnOriginCoordX = 0;
                    btnOriginGap =
                        viewportInfo.offset / this.state.zoomLevelSide - margin;
                    viewport = this.state.imageViewportSide;
                }
                buttonGap = constants.buttonStyle.GAP / zoomLevel;
                if (detectionData === undefined) return;
                const boundingBoxCoords = detectionData.boundingBox;
                coordsAcceptBtn = cornerstone.pixelToCanvas(viewport, {
                    x: boundingBoxCoords[btnOriginCoordX] + btnOriginGap,
                    y: boundingBoxCoords[1] - buttonGap,
                });
                coordsRejectBtn = cornerstone.pixelToCanvas(viewport, {
                    x: boundingBoxCoords[btnOriginCoordX] + btnOriginGap,
                    y: boundingBoxCoords[1] + buttonGap / 2,
                });
                leftAcceptBtn = coordsAcceptBtn.x;
                topAcceptBtn = coordsAcceptBtn.y;
                topRejectBtn = coordsRejectBtn.y;
            }
        }
        this.setState(
            {
                buttonStyles: {
                    confirm: {
                        top: topAcceptBtn,
                        left: leftAcceptBtn,
                        backgroundColor: constants.colors.GREEN,
                    },
                    reject: {
                        top: topRejectBtn,
                        left: leftAcceptBtn,
                        backgroundColor: constants.colors.RED,
                    },
                },
            },
            () => {
                this.appUpdateImage();
            }
        );
    }

    /**
     * onAlgorithmSelected - It updates detection sets' visualization
     *
     * @return {none} None
     * @param selected {boolean} - Indicates whether the algorithm was selected or not
     * @param algorithm {string} - Algorithm's name
     */
    onAlgorithmSelected(selected, algorithm) {
        this.setState({ displayButtons: false }, () => {
            this.appUpdateImage();
        });
    }

    /**
     * onDetectionSelected - It updates validation button visualization.
     *
     * @return {none} None
     * @param detection {Detection} - detection-related data used as reference for buttons' location
     */
    onDetectionSelected(detection) {
        const prevState = this.state;
        const updatedDetections = this.state.detections;
        updatedDetections[detection.algorithm].selectedDetection = detection;
        this.setState({ ...prevState, updatedDetections });
        const viewportInfo = Utils.getDataFromViewport(
            detection.view,
            document
        );
        this.setState({ displayButtons: true }, () => {
            this.renderButtonsFromRef(viewportInfo, detection);
        });
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
                    displayButtons: true,
                },
                () => {
                    cornerstoneTools.setToolActive('BoundingBoxDrawing', {
                        mouseButtonMask: 1,
                    });
                }
            );
        }
    }

    addNewDetection(algorithm, { classname, score }) {
        console.log('add new detection!');
    }

    /**
     * Invoked when user selects polygon mask option from FAB
     * @return {none} None
     * @param {none} None
     */
    onPolygonMaskSelected() {
        //TODO
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
                        numberOfFiles={this.state.numberOfFilesInQueue}
                        isUpload={this.state.isUpload}
                        isDownload={this.state.isDownload}
                        isConnected={this.state.isConnected}
                        connectedServer={this.state.processingHost}
                        processingFile={this.state.currentProcessingFile}
                    />
                    <SideMenu
                        detections={this.state.detections}
                        configurationInfo={this.state.configurationInfo}
                        enableMenu={this.state.fileInQueue}
                        appUpdateImage={this.appUpdateImage}
                        onAlgorithmSelected={this.onAlgorithmSelected}
                        onDetectionSelected={this.onDetectionSelected}
                        hideButtons={this.hideButtons}
                        renderButtons={this.onMouseClicked}
                        nextImageClick={this.nextImageClick}
                        enableNextButton={!this.state.displayButtons}
                    />
                    <div id="algorithm-outputs"> </div>
                    <ValidationButtons
                        displayButtons={
                            this.state.displayButtons &&
                            this.state.cornerstoneMode ===
                                constants.cornerstoneMode.SELECTION
                        }
                        buttonStyles={this.state.buttonStyles}
                        onMouseClicked={this.onMouseClicked}
                    />
                    <NoFileSign isVisible={!this.state.fileInQueue} />
                    <BoundPolyFAB
                        isVisible={this.state.isFABVisible}
                        cornerstoneMode={this.state.cornerstoneMode}
                        onBoundingSelect={this.onBoundingBoxSelected}
                        onPolygonSelect={this.onPolygonMaskSelected}
                    />
                </div>
            </div>
        );
    }
}

export default App;
