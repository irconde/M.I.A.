import './App.css';
import React from 'react';
import {Component} from 'react';
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import dicomParser from 'dicom-parser';
import ReactDOM from 'react-dom';
import * as cornerstoneMath from "cornerstone-math";
import Hammer from "hammerjs";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import socketIOClient from "socket.io-client";
import Utils from "./Utils.js";
import Dicos from "./Dicos.js";
import Detection from "./Detection.js";
import axios from 'axios';
import NextButton from './components/NextButton';
import MetaData from './components/MetaData';
import TopBar from './components/TopBar';
import JSZip from "jszip";
import DetectionSet from "./DetectionSet.js";
import Selection from "./Selection.js";
const COMMAND_SERVER = process.env.REACT_APP_COMMAND_SERVER;
const FILE_SERVER = "http://127.0.0.1:4002";

// Detection label properties
const LABEL_FONT = "bold 12px Arial";
const LABEL_PADDING = 4;
const DETECTION_COLOR = '#367FFF';
const DETECTION_COLOR_SELECTED = '#F7B500';
const DETECTION_COLOR_VALID = '#87bb47';
const DETECTION_COLOR_INVALID = '#961e13';
const DETECTION_BORDER = 2;
const LABEL_TEXT_COLOR = '#FFFFFF'
const BUTTON_MARGIN_LEFT = 60;
const BUTTONS_GAP = 120;
const BUTTON_HEIGHT = 60;
const LINE_GAP = 40;

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init({
  mouseEnabled: true,
  touchEnabled: true
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
   * constructor - All the related elements of the class are intialized:
   * Callback methods are bound to the class
   * The state is initialized
   * A click listener is bound to the image viewport in order to detect click events
   * A cornerstoneimagerendered listener is bound to the image viewport to trigger some actions in response to the image rendering
   * CornerstoneJS Tools are initialized
   *
   * @param  {type} props None
   * @return {type}       None
   */
  constructor(props) {
    super(props);
    this.state = {
      threatsCount: 0,
      selectedFile: null,
      algorithm: null,
      type: null,
      configuration: null,
      station: null,
      series: null,
      study: null,
      date: null,
      time: null,
      openRasterData: [],
      image: null,
      detectionSetList: [],
      currentSelection: new Selection(),
      validations: [],
      receiveTime: null,
      displayButtons: false,
      displayNext: true,
      zoomLevel: 1,
      imageViewport: document.getElementById('dicomImage'),
      viewport: cornerstone.getDefaultViewport(null, undefined),
      isConnected: false,
      numOfFilesInQueue: 0,
      isUpload: false,
      isDownload: false,
      socketCommand: socketIOClient(COMMAND_SERVER),
      socketFS: socketIOClient(FILE_SERVER)
    };
    this.sendImageToFileServer = this.sendImageToFileServer.bind(this);
    this.sendImageToCommandServer = this.sendImageToCommandServer.bind(this);
    this.nextImageClick = this.nextImageClick.bind(this);
    this.getNextAlgorithm = this.getNextAlgorithm.bind(this);
    this.getPrevAlgorithm = this.getPrevAlgorithm.bind(this);
    this.onImageRendered = this.onImageRendered.bind(this);
    this.loadAndViewImage = this.loadAndViewImage.bind(this);
    this.onMouseClicked = this.onMouseClicked.bind(this);
    this.hideButtons = this.hideButtons.bind(this);
    this.updateNumberOfFiles = this.updateNumberOfFiles.bind(this);
    this.getFilesFromCommandServer();
    this.updateNumberOfFiles();
  }

  /**
   * componentDidMount - Method invoked after all elements on the page are rendered properly
   *
   * @return {type}  None
   */
  componentDidMount() {
    this.state.imageViewport.addEventListener('cornerstoneimagerendered', this.onImageRendered);
    this.state.imageViewport.addEventListener('cornerstonetoolsmouseclick', this.onMouseClicked);
    this.state.imageViewport.addEventListener('cornerstonetoolsmousedrag', this.hideButtons);
    this.state.imageViewport.addEventListener('cornerstonetoolsmousewheel', this.hideButtons);
    this.setupConerstoneJS(this.state.imageViewport);
    var nextButton = document.getElementById('nextAlg');
    var prevButton = document.getElementById('prevAlg');

    // Should we be able to iterate through all detections
    nextButton.addEventListener('click', this.getNextAlgorithm);
    prevButton.addEventListener('click', this.getPrevAlgorithm);
    this.getNextImage();
  }


  getNextAlgorithm = (event) => {
    let currentDetectionSet = this.state.currentSelection.detectionSetIndex + 1;
    // this.state.validations[currentDetectionSet] = [];

      this.setState({ 
        currentSelection: { detectionSetIndex: currentDetectionSet, detectionIndex: Selection.NO_SELECTION }, 
        algorithm: this.state.detectionSetList[currentDetectionSet].algorithm
      });
      // remove button too iterate through algorithms if there are no more after the current one
      if(!this.state.validations[currentDetectionSet + 1]){
        document.getElementById('nextAlg').style.display = 'none';
      }
      else {
        document.getElementById('nextAlg').style.display = 'block';
      }
      if(!this.state.validations[currentDetectionSet - 1]){
        document.getElementById('prevAlg').style.display = 'none';
      }
      else {
        document.getElementById('prevAlg').style.display = 'block';
      }

    this.displayDICOSimage();
  }

  getPrevAlgorithm = (event) => {
    let currentDetectionSet = this.state.currentSelection.detectionSetIndex - 1;

    this.setState({ 
      currentSelection: { detectionSetIndex: currentDetectionSet, detectionIndex: Selection.NO_SELECTION }, 
      algorithm: this.state.detectionSetList[currentDetectionSet].algorithm
    });
    // remove button too iterate through algorithms if there are no more after the current one
    if(!this.state.validations[currentDetectionSet - 1]){
      document.getElementById('prevAlg').style.display = 'none';
    }
    else {
      document.getElementById('prevAlg').style.display = 'block';
    }

    if(!this.state.validations[currentDetectionSet + 1]){
      document.getElementById('nextAlg').style.display = 'none';
    }
    else {
      document.getElementById('nextAlg').style.display = 'block';
    }
    this.displayDICOSimage();
  }



    /**
   * getFilesFromCommandServer - Socket Listener to get files from command server then send them
   *                           - to the file server directly after
   * @param {type} - None
   * @return {type} - Promise
   */
  async getFilesFromCommandServer(){
    this.state.socketCommand.on('connect', () => {
      this.setState({ isConnected: true });
    })
    this.state.socketCommand.on("img", data => {
      this.sendImageToFileServer(Utils.b64toBlob(data)).then((res) => {
        // If we got an image and we are null, we know we can now fetch one
        // This is how it triggers to display a new file if none existed and a new one
        // was added
        this.setState({ isDownload: false });
        if (this.state.selectedFile === null){
          this.getNextImage();
        }
      });
    })
    this.state.socketCommand.on('disconnect', () => {
      this.setState({ isConnected: false });
    })
  }

  /**
   * updateNumberOfFiles - Opens a socket to constantly monitor the number of files with the file server
   * @param {type} - None
   * @return {type} - Promise
   */
  async updateNumberOfFiles(){
    this.state.socketFS.on('numberOfFiles', data => {
      this.setState({ numberOfFilesInQueue: data});
    })
  }

  /**
   * getNextImage() - Attempts to retreive the next image from the file server via get request
   *                - Then sets the state to the blob and calls the loadAndViewImage() function
   * @param {type} - None
   * @return {type} - None
   */
  getNextImage(){
    axios.get(`${FILE_SERVER}/next`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control' : 'no-cache'
      }
    }).then(async (res) => {
      // We get our latest file upon the main component mounting
      if (res.data.response === 'error '){
        console.log('Error getting next image');
      } else if (res.data.response === 'no-next-image') {
        console.log('No next image to display');
        this.setState({selectedFile: null});
        // Need to clear the canvas here or make a no image to load display
      } else {
        const myZip = new JSZip();
        var layerOrder = [];
        var listOfPromises = [];
        var listOfLayers = [];
        var imgBuf = null;
        myZip.loadAsync(res.data.b64, { base64: true }).then(() => {
          myZip.file('stack.xml').async('string').then( async (stackFile) => {
            layerOrder = Utils.getLayerOrder(stackFile);
            for (var i = 0; i < layerOrder.length; i++) {
              await myZip.file(layerOrder[i]).async('base64').then((imageData) => {
                if (i===0) imgBuf=Utils.base64ToArrayBuffer(imageData);
                listOfLayers.push(Utils.b64toBlob(imageData));
              })
            }

            var promiseOfList = Promise.all(listOfPromises);
            // Once we have all the layers...
            promiseOfList.then(() => {
              this.state.openRasterData = listOfLayers;
              this.setState({
                selectedFile: this.state.openRasterData[0],
                image: imgBuf,
                displayNext: true,
                receiveTime: Date.now(),
              });

              this.setState({ currentSelection: { detectionSetIndex: 0, detectionIndex: Selection.NO_SELECTION } }, () => {
                this.loadAndViewImage();
              });
            });
          })
        });
      }
    }).catch((err) => {
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
  validationCompleted(validationList) {
    var validationsComplete = true;
    var detectionSetIndex = this.state.currentSelection.detectionSetIndex;

    if (!validationList[detectionSetIndex]) {
      return validationsComplete;
    }
    for( var i=0; i < validationList[detectionSetIndex].length; i++){
      if (validationList[detectionSetIndex][i] === 0) {
        validationsComplete = false;
        break;
      }
    }
    return validationsComplete;
    }

  /**
   * nextImageClick() - When the operator taps next, we send to the file server to remove the
   *                  - current image, then when that is complete, we send the image to the command
   *                  - server. Finally, calling getNextImage to display another image if there is one
   * @param {type} - None
   * @return {type} - None
   */
  nextImageClick(e) {
    axios.get(`${FILE_SERVER}/confirm`).then((res) => {
      if (res.data.confirm === 'image-removed'){
        this.setState({
          algorithm: null
        })
        let validationCompleted = this.validationCompleted(this.state.validations);
        let image = this.state.openRasterData[0];

        const stackXML = document.implementation.createDocument("", "", null);
        const imageElem = stackXML.createElement('image');
        const stackElem = stackXML.createElement('stack');
        
        const mimeType = new Blob(['image/openraster'], {type: "text/plain;charset=utf-8"});
        const newOra = new JSZip();

        newOra.file('mimetype', mimeType, { compression: null });       
        newOra.file('data/pixel_data.dcs', image);

        const pixelLayer = stackXML.createElement('layer');
        pixelLayer.setAttribute('src', 'data/pixel_data.dcs');
        stackElem.appendChild(pixelLayer);
        
        /*
        *  Third parameter is the "abort flag": True / False
        *  True. When feedback has been left for at least one detection, we need to create a TDR to save feedback
        *  False. When feedback has not been left for any detection we need to create a TDR w/ ABORT flag
        */
        for(var i = 1; i < this.state.openRasterData.length; i++){
          let imageData = this.state.openRasterData[i];
          let validationList = this.state.validations[i];
          newOra.file(`data/additional_data_${i}.dcs`, Dicos.dataToBlob(validationList, imageData, Date.now(), !validationCompleted));
          let additionalLayer = stackXML.createElement('layer');
          additionalLayer.setAttribute('src', `data/additional_data_${i}.dcs`);
          stackElem.appendChild(additionalLayer);
        }
        imageElem.appendChild(stackElem);
        stackXML.appendChild(imageElem);
        newOra.file('stack.xml', new Blob([new XMLSerializer().serializeToString(stackXML)], { type: 'application/xml '}));
        newOra.generateAsync({ type: 'blob' }).then((blob) => {
          this.sendImageToCommandServer(blob).then((res) => {
            this.hideButtons(e);
            this.setState({
              selectedFile: null,
              isUpload: false
            });
            this.getNextImage();
          });  
        })               
      } else if (res.data.confirm === 'image-not-removed') {
        console.log('File server couldnt remove the next image');
      } else if (res.data.confirm === 'no-next-image'){
        alert('No next image');
        this.setState({selectedFile: null});
      }
    }).catch((err) => {
      console.log(err);
    })
  }


  /**
   * sendImageToFileServer - Socket IO to send an imge to the file server
   * @param {type} - file - which file we are sending
   * @return {type} - None
   */
  async sendImageToFileServer(file){
    this.setState({ isDownload: true });
    this.state.socketFS.binary(true).emit("fileFromClient", file);
  }


  /**
   * sendImageToCommandServer - Socket IO to send a file to the server
   * @param {type} - file - which file we are sending
   * @return {type} - None
   */
  async sendImageToCommandServer(file){
    this.setState({ isUpload: true });
    this.state.socketCommand.binary(true).emit("fileFromClient", file);
  }

  /**
   * setupConerstoneJS - CornerstoneJS Tools are initialized
   *
   * @param  {type} imageViewport DOM element where the x-ray image is rendered
   * @return {type}               None
   */
  setupConerstoneJS(imageViewport) {
    cornerstone.enable(imageViewport);
    const PanTool = cornerstoneTools.PanTool;
    cornerstoneTools.addTool(PanTool);
    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
    const Zoom = cornerstoneTools.ZoomMouseWheelTool;
    cornerstoneTools.addTool(Zoom);
    cornerstoneTools.setToolActive("ZoomMouseWheel", {});
    const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
    cornerstoneTools.addTool(ZoomTouchPinchTool);
    cornerstoneTools.setToolActive('ZoomTouchPinch', {});
  };


  /**
   * loadAndViewImage - Method that loads the image data from the DICOS+TDR file using CornerstoneJS.
   * The method invokes the displayDICOSinfo method in order to render the image and pull the detection-specific data.
   *
   * @param  {type} imageId id that references the DICOS+TDR file to be loaded
   * @return {type}         None
   */
  loadAndViewImage() {
    const self = this;
    self.displayDICOSimage();
    // all other images do not have pixel data -- cornerstoneJS will fail and send an error
    // if pixel data is missing in the dicom/dicos file. To parse out only the data,
    // we use dicomParser instead. For each .dcs file found at an index spot > 1, load
    // the file data and call loadDICOSdata() to store the data in a DetectionSet
    for(var i=1; i< self.state.openRasterData.length; i++){
      const reader = new FileReader();

      reader.addEventListener("loadend", function() {
        const view = new Uint8Array(reader.result);
        var dataSet = dicomParser.parseDicom(view);
        self.loadDICOSdata(dataSet);
      });
      reader.readAsArrayBuffer(self.state.openRasterData[i]);
    }
  }

  /**
   * displayDICOSinfo - Method that renders the x-ray image encoded in the DICOS+TDR file and
   *
   * @param  {type} image DICOS+TDR data
   * @return {type}       None
   */
  displayDICOSimage() {
    // the first image has the pixel data so prepare it to be displayed using cornerstoneJS
    const self = this;
    const pixelData = cornerstoneWADOImageLoader.wadouri.fileManager.add(this.state.openRasterData[0]);
    cornerstone.loadImage(pixelData).then(
        function(image) {
          const viewport = cornerstone.getDefaultViewportForImage(self.state.imageViewport, image);
          self.setState({viewport: viewport})
          cornerstone.displayImage(self.state.imageViewport, image, viewport);
        });
  }


  /**
   * loadDICOSdata - Method that a DICOS+TDR file to pull all the data regarding the threat detections
   *
   * @param  {type} image DICOS+TDR data
   * @return {type}       None
   */
  loadDICOSdata(image) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    for(var i=0; i<this.state.openRasterData.length-1;i++){
      this.state.validations[i] = [0];
    }

    this.setState({
      detections: null,
      currentSelection : {
        detectionIndex: Selection.NO_SELECTION,
        detectionSetIndex: this.state.currentSelection.detectionSetIndex
      },
      threatsCount: image.uint16(Dicos.dictionary['NumberOfAlarmObjects'].tag),
      algorithm: image.string(Dicos.dictionary['ThreatDetectionAlgorithmandVersion'].tag),
      type: image.string(Dicos.dictionary['DetectorType'].tag),
      configuration: image.string(Dicos.dictionary['DetectorConfiguration'].tag),
      station: image.string(Dicos.dictionary['StationName'].tag),
      series: image.string(Dicos.dictionary['SeriesDescription'].tag),
      study: image.string(Dicos.dictionary['StudyDescription'].tag),
      time: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
      date: mm + '/' + dd + '/' + yyyy
    });

    if (this.state.threatsCount === 0 || this.state.threatsCount === undefined) {
      console.log("No Potential Threat Objects detected");
      this.setState({
        displayNext: true
      });
      return;
    }
    // Threat Sequence information
    const threatSequence = image.elements.x40101011;
    if (threatSequence == null){
      console.log("No Threat Sequence");
      return;
    }

    const detectionSet = new DetectionSet();
    detectionSet.algorithm = image.string(Dicos.dictionary['ThreatDetectionAlgorithmandVersion'].tag);

    // for every threat found, create a new Detection object and store all Detection
    // objects in a DetectionSet object
    for (var i = 0; i < this.state.threatsCount; i++) {
      const boundingBoxCoords = Dicos.retrieveBoundingBoxData(threatSequence.items[i]);
      const objectClass = Dicos.retrieveObjectClass(threatSequence.items[i]);
      const confidenceLevel = Utils.decimalToPercentage(Dicos.retrieveConfidenceLevel(threatSequence.items[i]));

      detectionSet.detections[i] = new Detection(boundingBoxCoords, objectClass, confidenceLevel);
      this.state.detectionSetList[i] = detectionSet;
    }

    if(this.state.validations[this.state.currentSelection.detectionSetIndex + 1]){
      document.getElementById('nextAlg').style.display = 'block';
    }
    else {
      document.getElementById('nextAlg').style.display = 'none';
    }

    if(this.state.validations[this.state.currentSelection.detectionSetIndex - 1]){
      document.getElementById('prevAlg').style.display = 'block';
    }
    else {
      document.getElementById('prevAlg').style.display = 'none';
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
    this.setState({zoomLevel: eventData.viewport.scale.toFixed(2)});
    // set the canvas context to the image coordinate system
    //cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, eventData.canvasContext);
    // NOTE: The coordinate system of the canvas is in image pixel space.  Drawing
    // to location 0,0 will be the top left of the image and rows,columns is the bottom
    // right.
    const context = eventData.canvasContext;
    this.renderDetections(this.state.detectionSetList, context);
  }


  /**
   * renderDetections - Method that renders the several annotations in a given DICOS+TDR file
   *
   * @param  {type} data    DICOS+TDR data
   * @param  {type} context Rendering context
   * @return {type}         None
   */
  renderDetections(data, context) {
    let validations = this.state.validations[this.state.currentSelection.detectionSetIndex];
    let B_BOX_COORDS = 4;
    let currDataSetIndex = this.state.currentSelection.detectionSetIndex;
    let currDataIndex = this.state.currentSelection.detectionIndex;
    context.clearRect(0, 0, context.width, context.height);

    if (data === null || data.length === 0) {
      return;
    }
    for(var j=0; j<data[currDataSetIndex].detections.length; j++){
      const detectionData = data[currDataSetIndex].detections[j];

      if (!detectionData || detectionData.boundingBox.length < B_BOX_COORDS) return;

      let detectionColor = detectionData.selected? DETECTION_COLOR_SELECTED : DETECTION_COLOR;

      // We set the rendering properties
      if(validations[j] === "CONFIRM"){
        detectionColor = detectionData.selected? DETECTION_COLOR_SELECTED : DETECTION_COLOR_VALID;
      }
      else if(validations[j] === "REJECT"){
        detectionColor = detectionData.selected? DETECTION_COLOR_SELECTED : DETECTION_COLOR_INVALID;
      }

      context.font = LABEL_FONT;
      context.strokeStyle = detectionColor;
      context.fillStyle = detectionColor;
      context.lineWidth = DETECTION_BORDER;
      const boundingBoxCoords = detectionData.boundingBox;
      const boundingBoxWidth = Math.abs(boundingBoxCoords[2] - boundingBoxCoords[0]);
      const boundingBoxHeight = Math.abs(boundingBoxCoords[3] - boundingBoxCoords[1]);
      if (boundingBoxWidth === 0 || boundingBoxHeight === 0) continue;
      const detectionLabel = Utils.formatDetectionLabel(detectionData.class, detectionData.confidence);
      const labelSize = Utils.getTextLabelSize(context, detectionLabel, LABEL_PADDING);
      context.fillStyle = detectionColor;
      context.strokeStyle = detectionColor;
      context.strokeRect(boundingBoxCoords[0], boundingBoxCoords[1], boundingBoxWidth, boundingBoxHeight);

      // Line rendering
      if (j === this.state.currentSelection.detectionIndex) {
        const buttonGap = (BUTTONS_GAP - BUTTON_HEIGHT/2) / this.state.zoomLevel;
        context.beginPath();
        // Staring point (10,45)
        context.moveTo(boundingBoxCoords[2], boundingBoxCoords[1] + LINE_GAP/2);
        // End point (180,47)
        context.lineTo(boundingBoxCoords[2] + BUTTON_MARGIN_LEFT / this.state.zoomLevel, boundingBoxCoords[1] + buttonGap);
        // Make the line visible
        context.stroke();
        context.beginPath();
        // Staring point (10,45)
        context.moveTo(boundingBoxCoords[2] - LINE_GAP/2, boundingBoxCoords[1]);
        // End point (180,47)
        context.lineTo(boundingBoxCoords[2] + BUTTON_MARGIN_LEFT / this.state.zoomLevel, boundingBoxCoords[1] - buttonGap);
        // Make the line visible
        context.stroke();
      }

      // Label rendering
      context.fillRect(boundingBoxCoords[0], boundingBoxCoords[1] - labelSize["height"], labelSize["width"], labelSize["height"]);
      context.strokeRect(boundingBoxCoords[0], boundingBoxCoords[1] - labelSize["height"], labelSize["width"], labelSize["height"]);
      context.fillStyle = LABEL_TEXT_COLOR;
      context.fillText(detectionLabel, boundingBoxCoords[0] + LABEL_PADDING, boundingBoxCoords[1] - LABEL_PADDING);
    }
  };


  /**
   * hideButtons - Unselect the selected detection and hide the two "feedback" buttons.
   *
   * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
   * @return {type}  None
   */
  hideButtons(e){
    this.setState({ displayButtons: false }, () => {
      this.renderButtons(e);
    });

    var selectedIndex = this.state.currentSelection.detectionIndex;
    var detectionSetIndex = this.state.currentSelection.detectionSetIndex;
    var detectionList = this.state.detectionSetList;

    if(selectedIndex !== Selection.NO_SELECTION){
      if(detectionList[detectionSetIndex].detections[selectedIndex]){
        detectionList[detectionSetIndex].detections[selectedIndex].selected = false;
        this.setState({currentSelection: {detectionIndex: Selection.NO_SELECTION, detectionSetIndex: detectionSetIndex}})
      }
    }
  }

    /**
   * onMouseClicked - Callback function invoked on mouse clicked in image viewport. We handle the selection of detections.
   *
   * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
   * @return {type}   None
   */
  onMouseClicked(e) {
    if (this.state.detectionsSetList === null || this.state.detectionSetList.length === 0){
      return;
    }

    var clickedPos = Selection.NO_SELECTION;
    var selectedIndex = this.state.currentSelection.detectionIndex;
    var detectionSetIndex = this.state.currentSelection.detectionSetIndex;
    var detectionList = this.state.detectionSetList;
    var validations = this.state.validations[detectionSetIndex];
    let feedback = "";

    // User is submitting feedback through confirm or reject buttons
    if(e.currentTarget.id === "confirm" || e.currentTarget.id === "reject"){
      if(e.currentTarget.id === "confirm"){
        feedback = "CONFIRM";
      }
      if(e.currentTarget.id === "reject"){
        feedback = "REJECT";
      }
      detectionList[detectionSetIndex].detections[selectedIndex].selected = false;
      this.state.validations[detectionSetIndex][selectedIndex] = feedback;

      this.setState({
        currentSelection: {
          detectionIndex: Selection.NO_SELECTION,
          detectionSetIndex: this.state.currentSelection.detectionSetIndex
        },
        displayButtons: false,
        displayNext: true,
      }, () => {
        this.renderButtons(e);
      });
    }

    // Handle regular click events for selecting and deselecting detections
    else{
      const mousePos = cornerstone.canvasToPixel(e.target, {x:e.detail.currentPoints.page.x, y:e.detail.currentPoints.page.y});

        for (var j = 0; j < detectionList[detectionSetIndex].detections.length; j++){
          if(Utils.pointInRect(mousePos, detectionList[detectionSetIndex].detections[j].boundingBox)){
            clickedPos = j;
            break;
        }
        }
      if(clickedPos === Selection.NO_SELECTION) {
        if (selectedIndex !== Selection.NO_SELECTION) detectionList[detectionSetIndex].detections[selectedIndex].selected = false;
        selectedIndex = Selection.NO_SELECTION;
        this.setState({ displayButtons: false,  currentSelection: { detectionIndex: selectedIndex, detectionSetIndex: this.state.currentSelection.detectionSetIndex } }, () => {
          this.renderButtons(e);
        });
      }
      else {
        if (clickedPos === selectedIndex){
          detectionList[detectionSetIndex].detections[clickedPos].selected = false;
          selectedIndex = Selection.NO_SELECTION;
          this.setState({ displayButtons: false,  currentSelection: { detectionIndex: selectedIndex, detectionSetIndex: this.state.currentSelection.detectionSetIndex } }, () => {
            this.renderButtons(e);
          });
        } else {
            if (selectedIndex !== Selection.NO_SELECTION) detectionList[detectionSetIndex].detections[selectedIndex].selected = false;
            detectionList[detectionSetIndex].detections[clickedPos].selected = true;
            selectedIndex = clickedPos;
            this.setState({displayButtons: true, currentSelection: { detectionIndex: selectedIndex, detectionSetIndex: this.state.currentSelection.detectionSetIndex } }, () => {
              this.renderButtons(e);
            });
        }
      }
    }

  }


  /**
   * renderButtons - Function that handles the logic behind whether or not to display
   * the feedback buttons and where to display those buttons depending on the current
   * zoom level in the window
   *
   * @param  {type} e Event data passed from the onMouseClick function,
   * such as the mouse cursor position, mouse button clicked, etc.
   * @return {type}   None
   */
  renderButtons(e) {
    let className = "";
    if (this.state.detectionsSetList === null || this.state.detectionsSetList === 0){
      return;
    }

    className = this.state.displayButtons ? "" : "hidden";
    var leftAcceptBtn = 0;
    var topAcceptBtn = 0;
    var topRejectBtn = 0;
    if(e.detail !== null){
      if(className !== "hidden"){
        const buttonGap = BUTTONS_GAP / this.state.zoomLevel;
        const marginLeft = BUTTON_MARGIN_LEFT / this.state.zoomLevel;
        const boundingBoxCoords = this.state.detectionSetList[this.state.currentSelection.detectionSetIndex].detections[this.state.currentSelection.detectionIndex].boundingBox;
        var coordsAcceptBtn =  cornerstone.pixelToCanvas(this.state.imageViewport, {x:boundingBoxCoords[2] + marginLeft, y:boundingBoxCoords[1]-buttonGap});
        leftAcceptBtn = coordsAcceptBtn.x ;
        topAcceptBtn = coordsAcceptBtn.y;
        var coordsRejectBtn =  cornerstone.pixelToCanvas(this.state.imageViewport, {x:boundingBoxCoords[2] + marginLeft, y:boundingBoxCoords[1]});
        topRejectBtn = coordsRejectBtn.y;
      }
    }
    className = className + "feedback-buttons";
    ReactDOM.render(React.createElement("button", { id:"confirm", onClick: this.onMouseClicked, className: className,
      style: {
        top: topAcceptBtn,
        left: leftAcceptBtn,
        backgroundColor: DETECTION_COLOR_VALID,
      }
    }, "CONFIRM"), document.getElementById('feedback-confirm'));
    ReactDOM.render(React.createElement("button", { id:"reject", onClick: this.onMouseClicked ,className: className,
      style: {
        top: topRejectBtn,
        left: leftAcceptBtn,
        backgroundColor: DETECTION_COLOR_INVALID,
      }
    }, "REJECT"), document.getElementById('feedback-reject'));
    cornerstone.updateImage(this.state.imageViewport, true);
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
          onContextMenu={(e) => e.preventDefault() }
          className='disable-selection noIbar'
          unselectable='off'
          ref={el => {
            el && el.addEventListener('selectstart', (e) =>{
              e.preventDefault();
            })
          }}
          onMouseDown={(e) => e.preventDefault() } >
          <TopBar
            numberOfFiles={this.state.numberOfFilesInQueue}
            isUpload={this.state.isUpload}
            isDownload={this.state.isDownload}
            isConnected={this.state.isConnected}
          />
          <MetaData
            algorithmType={this.state.algorithm}
            detectorType={this.state.type}
            detectorConfigType={this.state.configuration}
            seriesType={this.state.series}
            studyType={this.state.study}
          />
          <div id="algorithm-outputs"> </div>
          <div id="feedback-confirm"> </div>
          <div id="feedback-reject"> </div>
        </div>
        <NextButton nextImageClick={this.nextImageClick} displayNext={this.state.displayNext} />
      </div>
    );
  }

}

export default App;
