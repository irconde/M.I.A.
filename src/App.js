import './App.css';
import React from 'react';
import {Component} from 'react';
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import dicomParser from 'dicom-parser';
import * as cornerstoneMath from "cornerstone-math";
import Hammer from "hammerjs";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import socketIOClient from "socket.io-client";
import ORA from './ORA.js';
import Stack from './Stack.js';
import Utils from "./Utils.js";
import Dicos from "./Dicos.js";
import Detection from "./Detection.js";
import axios from 'axios';
import NextButton from './components/NextButton';
import MetaData from './components/MetaData';
import TopBar from './components/TopBar';
import ValidationButtons from './components/ValidationButtons';
import JSZip from "jszip";
import DetectionSet from "./DetectionSet";
import Selection from "./Selection";
import NoFileSign from "./components/NoFileSign";
import * as constants from './Constants';
const COMMAND_SERVER = process.env.REACT_APP_COMMAND_SERVER;

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
    this.currentSelection = new Selection();
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
      myOra: new ORA(),
      image: null,
      detections: {},
      receiveTime: null,
      displayButtons: false,
      buttonStyles: {
        confirm: {},
        reject: {}
      },
      displayNext: false,
      fileInQueue: false,
      nextAlgBtnEnabled: false,
      prevAlgBtnEnabled: false,
      zoomLevel: 1,
      imageViewport: document.getElementById('dicomImage'),
      viewport: cornerstone.getDefaultViewport(null, undefined),
      isConnected: false,
      numOfFilesInQueue: 0,
      isUpload: false,
      isDownload: false,
      socketCommand: socketIOClient(COMMAND_SERVER),
      socketFS: socketIOClient(constants.server.FILE_SERVER_ADDRESS)
    };
    this.getAlgorithmForPos = this.getAlgorithmForPos.bind(this);
    this.sendImageToFileServer = this.sendImageToFileServer.bind(this);
    this.sendImageToCommandServer = this.sendImageToCommandServer.bind(this);
    this.nextImageClick = this.nextImageClick.bind(this);
    this.onImageRendered = this.onImageRendered.bind(this);
    this.loadAndViewImage = this.loadAndViewImage.bind(this);
    this.loadDICOSdata = this.loadDICOSdata.bind(this);
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
  }

  /**
   * getAlgorithmForPos - Method triggered when there's a click event on the navigation buttons inside the Metadata widget.
   *                    - It allows users to navigate to the next or previous algorithm
   *
   * @return {type}  None
   */
  getAlgorithmForPos(deltaPos) {
    this.currentSelection.set(this.currentSelection.detectionSetIndex + deltaPos);
    this.setState({
      algorithm: this.currentSelection.getAlgorithm()
    }, () => {
      // remove button to iterate through algorithms if there are no more after the current one
      this.updateNavigationBtnState();
      this.displayDICOSimage();
    });
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
      if (!this.state.fileInQueue && data > 0) {
        this.state.imageViewport.style.visibility = 'visible'
        this.getNextImage();
      }
      this.setState({
        numberOfFilesInQueue: data,
        fileInQueue: data > 0,
      });
    })
  }


  /**
   * onNoImageLeft - Method invoked when there isn't any file in the file queue.
   * A 'No file' image is displayed insted of the cornerstonejs canvas
   *
   * @param {type}  - None
   * @return {type} -  None
   */
  onNoImageLeft(){
    console.log('No next image to display');
    let updateImageViewport = this.state.imageViewport;
    updateImageViewport.style.visibility = 'hidden';
    this.currentSelection.clear();
    this.setState({
      selectedFile: null,
      displayNext: false,
      imageViewport: updateImageViewport
    });
  }

  /**
   * getNextImage() - Attempts to retreive the next image from the file server via get request
   *                - Then sets the state to the blob and calls the loadAndViewImage() function
   * @param {type} - None
   * @return {type} - None
   */
  getNextImage(){
      axios.get(`${constants.server.FILE_SERVER_ADDRESS}/next`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control' : 'no-cache'
        }
      }).then(async (res) => {
        // We get our latest file upon the main component mounting
        if (res.data.response === 'error '){
          console.log('Error getting next image');
        } else if (res.data.response === 'no-next-image') {
          // Need to clear the canvas here or make a no image to load display
          this.onNoImageLeft();
        } else {
          const myZip = new JSZip();
          var listOfPromises = [];
          // This is our list of stacks we will append to the myOra object in our promise all
          var listOfStacks = [];
          // Lets load the compressed ORA file as base64
          myZip.loadAsync(res.data.b64, { base64: true }).then(() => {
            // First, after loading, we need to check our stack.xml
            myZip.file('stack.xml').async('string').then( async (stackFile) => {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(stackFile, 'text/xml');
              const xmlStack = xmlDoc.getElementsByTagName('stack');
              // We loop through each stack. Creating a new stack object to store our info
              // for now, we are just grabbing the location of the dicos file in the ora file
              for(let stackData of xmlStack){
                let currentStack = new Stack(stackData.getAttribute('name'), stackData.getAttribute('view'));
                let layerData = stackData.getElementsByTagName('layer');
                for(let imageSrc of layerData){
                  currentStack.rawData.push(imageSrc.getAttribute('src'));
                }
                // We have finished creating the current stack's object
                // add it onto our holder variable for now
                listOfStacks.push(currentStack);
              }
              // Now we loop through the data we have collected
              // We know the first layer of each stack is pixel data, which we need as an array buffer
              // Which we got from i===0. 
              // No matter what however, every layer gets converted a blob and added to the data set
              for (var j = 0; j < listOfStacks.length; j++){
                for (var i = 0; i < listOfStacks[j].rawData.length; i++) {
                  await myZip.file(listOfStacks[j].rawData[i]).async('base64').then((imageData) => {
                    if (i===0) listOfStacks[j].pixelData=Utils.base64ToArrayBuffer(imageData);
                    listOfStacks[j].blobData.push(Utils.b64toBlob(imageData));
                  })
                }
              }
              var promiseOfList = Promise.all(listOfPromises);
              // Once we have all the layers...
              promiseOfList.then(() => {
                this.state.myOra.stackData = listOfStacks;
                this.currentSelection.clear();
                
                this.setState({
                  selectedFile: this.state.myOra.getFirstImage(),
                  image: this.state.myOra.getFirstPixelData(),
                  displayNext: false,
                  receiveTime: Date.now()
                  }, () => {
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
   * * updateNavigationBtnState - Method that enables/disables the buttons for
   *  navigating through the several algorithms
   *
   * @param  - None
   * @return - None
   */
  updateNavigationBtnState() {
    const algorithmCount = this.currentSelection.getAlgorithmCount();
    const currentAlgorithmIndex = this.currentSelection.detectionSetIndex;
    this.setState({
      nextAlgBtnEnabled: (currentAlgorithmIndex < (algorithmCount - 1)),
      prevAlgBtnEnabled: currentAlgorithmIndex > 0,
    })
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
    for (const [key, detectionSet] of Object.entries(this.state.detections)) {
      if (detectionSet.isValidated() === false) {
        result = false;
        break;
      }
    }
    return result;
  }

  /**
   * nextImageClick() - When the operator taps next, we send to the file server to remove the
   *                  - current image, then when that is complete, we send the image to the command
   *                  - server. Finally, calling getNextImage to display another image if there is one
   * @param {type} - Event
   * @return {type} - None
   */
  nextImageClick(e) {
    axios.get(`${constants.server.FILE_SERVER_ADDRESS}/confirm`).then((res) => {
      if (res.data.confirm === 'image-removed'){
        this.setState({
          algorithm: null
        })
        let validationCompleted = this.validationCompleted();
        let image = this.state.openRasterData[0];

        const stackXML = document.implementation.createDocument("", "", null);
        const prolog = '<?xml version="1.0" encoding="utf-8"?>';
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
          newOra.file(`data/additional_data_${i}.dcs`, Dicos.dataToBlob(this.state.detections[this.currentSelection.getAlgorithmForPos(i-1)], imageData, Date.now(), !validationCompleted));
          let additionalLayer = stackXML.createElement('layer');
          additionalLayer.setAttribute('src', `data/additional_data_${i}.dcs`);
          stackElem.appendChild(additionalLayer);
        }
        imageElem.appendChild(stackElem);
        stackXML.appendChild(imageElem);
        newOra.file('stack.xml', new Blob([prolog + new XMLSerializer().serializeToString(stackXML)], { type: 'application/xml '}));
        newOra.generateAsync({ type: 'blob' }).then((oraBlob) => {
          this.sendImageToCommandServer(oraBlob).then((res) => {
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
    const dataImages = [];
    self.displayDICOSimage();
    // all other images do not have pixel data -- cornerstoneJS will fail and send an error
    // if pixel data is missing in the dicom/dicos file. To parse out only the data,
    // we use dicomParser instead. For each .dcs file found at an index spot > 1, load
    // the file data and call loadDICOSdata() to store the data in a DetectionSet

    // NOTE from James:
    // I currently just tell this to look at the top stack's blob
    for(var i = 1; i < self.state.myOra.stackData[0].blobData.length; i++){
      dataImages[i - 1] = self.state.myOra.stackData[0].blobData[i];
    }
    // for(var i = 1; i < self.state.openRasterData.length; i++){
    //   dataImages[i - 1] = self.state.openRasterData[i];
    // }
    self.loadDICOSdata(dataImages);
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
    const pixelData = cornerstoneWADOImageLoader.wadouri.fileManager.add(this.state.selectedFile);
    cornerstone.loadImage(pixelData).then(
        function(image) {
          const viewport = cornerstone.getDefaultViewportForImage(self.state.imageViewport, image);
          viewport.scale = 1.4;
          viewport.translation.y = 50;
          self.setState({viewport: viewport})
          cornerstone.displayImage(self.state.imageViewport, image, viewport);
        });
  }

  /**
   * loadDICOSdata - Method that a DICOS+TDR file to pull all the data regarding the threat detections
   *
   * @param  {type} images list of DICOS+TDR data from each algorithm
   * @return {type}       None
   */
  loadDICOSdata(images) {
    const self = this;
    self.state.detections = {};
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    for(var i=0; i<images.length;i++){
      if(i===0){
        const reader = new FileReader();
        let self = this;

        reader.addEventListener("loadend", function() {
          const view = new Uint8Array(reader.result);
          var image = dicomParser.parseDicom(view);
          self.currentSelection.clear();
          self.setState({
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
        });
        reader.readAsArrayBuffer(images[i]);
      }

      const reader = new FileReader();
      reader.addEventListener("loadend", function() {
        const view = new Uint8Array(reader.result);
        var image = dicomParser.parseDicom(view);

        let threatsCount = image.uint16(Dicos.dictionary['NumberOfAlarmObjects'].tag);
        let algorithmName = image.string(Dicos.dictionary['ThreatDetectionAlgorithmandVersion'].tag);

        if (!(algorithmName in self.state.detections)) {
          self.state.detections[algorithmName] = new DetectionSet();
          self.state.detections[algorithmName].setAlgorithmName(algorithmName);
          self.currentSelection.addAlgorithm(algorithmName);
          self.updateNavigationBtnState();
        }
        // Threat Sequence information
        const threatSequence = image.elements.x40101011;
        if (threatSequence == null){
          console.log("No Threat Sequence");
          return;
        }
        if (image.uint16(Dicos.dictionary['NumberOfAlarmObjects'].tag) === 0 || image.uint16(Dicos.dictionary['NumberOfAlarmObjects'].tag) === undefined) {
          console.log("No Potential Threat Objects detected");
          this.setState({
            displayNext: true
          });
          return;
        }
        // for every threat found, create a new Detection object and store all Detection
        // objects in a DetectionSet object
        for (var j = 0; j < threatsCount; j++) {
          const boundingBoxCoords = Dicos.retrieveBoundingBoxData(threatSequence.items[j]);
          const objectClass = Dicos.retrieveObjectClass(threatSequence.items[j]);
          const confidenceLevel = Utils.decimalToPercentage(Dicos.retrieveConfidenceLevel(threatSequence.items[j]));
          self.state.detections[algorithmName].addDetection(new Detection(boundingBoxCoords, objectClass, confidenceLevel, false));
        }
      });
      reader.readAsArrayBuffer(images[i]);
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
    this.renderDetections(this.state.detections, context);
  }


  /**
   * renderDetections - Method that renders the several annotations in a given DICOS+TDR file
   *
   * @param  {type} data    DICOS+TDR data
   * @param  {type} context Rendering context
   * @return {type}         None
   */
  renderDetections(data, context) {
    let B_BOX_COORDS = 4;
    // TODO. Note that in this version we get the detections of the top view only.
    let detectionList = data[this.currentSelection.getAlgorithm()].getData();
    if (detectionList === null || detectionList.length === 0) {
      return;
    }
    for(var j = 0; j < detectionList.length; j++) {
      const boundingBoxCoords = detectionList[j].boundingBox;
      let color = detectionList[j].getRenderColor();
      if (boundingBoxCoords.length < B_BOX_COORDS) return;
      context.font = constants.detectionStyle.LABEL_FONT;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = constants.detectionStyle.BORDER_WIDTH;
      const boundingBoxWidth = Math.abs(boundingBoxCoords[2] - boundingBoxCoords[0]);
      const boundingBoxHeight = Math.abs(boundingBoxCoords[3] - boundingBoxCoords[1]);
      const detectionLabel = Utils.formatDetectionLabel(detectionList[j].class, detectionList[j].confidence);
      const labelSize = Utils.getTextLabelSize(context, detectionLabel, constants.detectionStyle.LABEL_PADDING);
      context.fillStyle = color;
      context.strokeStyle = color;
      context.strokeRect(boundingBoxCoords[0], boundingBoxCoords[1], boundingBoxWidth, boundingBoxHeight);
      // Line rendering
      if (j === data[this.currentSelection.getAlgorithm()].selectedDetection) {
        const buttonGap = (constants.buttonStyle.GAP - constants.buttonStyle.HEIGHT/2) / this.state.zoomLevel;
        context.beginPath();
        // Staring point (10,45)
        context.moveTo(boundingBoxCoords[2], boundingBoxCoords[1] + constants.buttonStyle.LINE_GAP/2);
        // End point (180,47)
        context.lineTo(boundingBoxCoords[2] + constants.buttonStyle.MARGIN_LEFT / this.state.zoomLevel, boundingBoxCoords[1] + buttonGap);
        // Make the line visible
        context.stroke();
        context.beginPath();
        // Staring point (10,45)
        context.moveTo(boundingBoxCoords[2] - constants.buttonStyle.LINE_GAP/2, boundingBoxCoords[1]);
        // End point (180,47)
        context.lineTo(boundingBoxCoords[2] + constants.buttonStyle.MARGIN_LEFT / this.state.zoomLevel, boundingBoxCoords[1] - buttonGap);
        // Make the line visible
        context.stroke();
      }
      // Label rendering
      context.fillRect(boundingBoxCoords[0], boundingBoxCoords[1] - labelSize["height"], labelSize["width"], labelSize["height"]);
      context.strokeRect(boundingBoxCoords[0], boundingBoxCoords[1] - labelSize["height"], labelSize["width"], labelSize["height"]);
      context.fillStyle = constants.detectionStyle.LABEL_TEXT_COLOR;
      context.fillText(detectionLabel, boundingBoxCoords[0] + constants.detectionStyle.LABEL_PADDING, boundingBoxCoords[1] - constants.detectionStyle.LABEL_PADDING);
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
    this.state.detections[this.currentSelection.getAlgorithm()].clearSelection();
  }

  /**
   * onMouseClicked - Callback function invoked on mouse clicked in image viewport. We handle the selection of detections.
   *
   * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
   * @return {type}   None
   */
  onMouseClicked(e) {
    if (this.state.detections === null || this.state.detections[this.currentSelection.getAlgorithm()].getData().length === 0){
      return;
    }
    var clickedPos = constants.selection.NO_SELECTION;
    let feedback = undefined;
    let detectionSet = this.state.detections[this.currentSelection.getAlgorithm()];

    // User is submitting feedback through confirm or reject buttons
    if(e.currentTarget.id === "confirm" || e.currentTarget.id === "reject"){
      if(e.currentTarget.id === "confirm"){ feedback = true; }
      if(e.currentTarget.id === "reject"){ feedback = false; }
      detectionSet.validateSelectedDetection(feedback);
      if(this.validationCompleted()){
        this.setState({
          displayButtons: false,
          displayNext: true
        });
      } else {
        this.setState({
          displayButtons: false,
        });
      }
      cornerstone.updateImage(this.state.imageViewport, true);
    }

    // Handle regular click events for selecting and deselecting detections
    else{
      const mousePos = cornerstone.canvasToPixel(e.target, {x:e.detail.currentPoints.page.x, y:e.detail.currentPoints.page.y});
      let detectionSetData = detectionSet.getData();
      for (var j = 0; j < detectionSetData.length; j++){
        if(Utils.pointInRect(mousePos, detectionSetData[j].boundingBox)){
            clickedPos = j;
            break;
        }
      }
      // Click on an empty area
      if(clickedPos === constants.selection.NO_SELECTION) {
        detectionSet.clearSelection();
        this.setState({ displayButtons: false }, () => {
          this.renderButtons(e);
        });
      }
      else {
        let anyDetection = detectionSet.selectDetection(clickedPos);
        this.setState({ displayButtons: anyDetection }, () => {
          this.renderButtons(e);
        });
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
    if (this.state.detections === null || this.state.detections[this.currentSelection.getAlgorithm()].getData().length === 0){
      return;
    }
    var leftAcceptBtn = 0;
    var topAcceptBtn = 0;
    var topRejectBtn = 0;
    if(e.detail !== null){
      if(this.state.displayButtons !== false){
        const buttonGap = constants.buttonStyle.GAP / this.state.zoomLevel;
        const marginLeft = constants.buttonStyle.MARGIN_LEFT / this.state.zoomLevel;
        const detectionData = this.state.detections[this.currentSelection.getAlgorithm()].getDataFromSelectedDetection();
        if (detectionData === undefined) return;
        const boundingBoxCoords = detectionData.boundingBox;
        var coordsAcceptBtn =  cornerstone.pixelToCanvas(this.state.imageViewport, {x:boundingBoxCoords[2] + marginLeft, y:boundingBoxCoords[1]-buttonGap});
        leftAcceptBtn = coordsAcceptBtn.x ;
        topAcceptBtn = coordsAcceptBtn.y;
        var coordsRejectBtn =  cornerstone.pixelToCanvas(this.state.imageViewport, {x:boundingBoxCoords[2] + marginLeft, y:boundingBoxCoords[1]+buttonGap/2});
        topRejectBtn = coordsRejectBtn.y;
      }
    }
    this.setState({
      buttonStyles: {
        confirm: {
          top: topAcceptBtn,
          left: leftAcceptBtn,
          backgroundColor: constants.colors.GREEN
        },
        reject: {
          top: topRejectBtn,
          left: leftAcceptBtn,
          backgroundColor: constants.colors.RED
        }
      }
    }, () => {
      cornerstone.updateImage(this.state.imageViewport, true);
    })
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
            isVisible={this.state.fileInQueue}
            algorithmType={this.state.algorithm}
            detectorType={this.state.type}
            detectorConfigType={this.state.configuration}
            seriesType={this.state.series}
            studyType={this.state.study}
            navigationBtnClick={this.getAlgorithmForPos}
            nextAlgBtnEnabled={this.state.nextAlgBtnEnabled}
            prevAlgBtnEnabled={this.state.prevAlgBtnEnabled}
          />
          <div id="algorithm-outputs"> </div>
          <ValidationButtons displayButtons={this.state.displayButtons} buttonStyles={this.state.buttonStyles} onMouseClicked={this.onMouseClicked} />
          <NextButton nextImageClick={this.nextImageClick} displayNext={this.state.displayNext} />
          <NoFileSign isVisible={!this.state.fileInQueue} />
        </div>
      </div>
    );
  }

}

export default App;
