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
      image: null,
      detections: null,
      selectedDetection: -1,
      validations: null,
      receiveTime: null,
      displayButtons: false,
      displayNext: false,
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
    this.getNextImage();
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
        console.log('error getting next image');
      } else if (res.data.response === 'no-next-image') {
        console.log('No next image to display');
        this.setState({selectedFile: null});
        // Need to clear the canvas here or make a no image to load display
      } else {
        // TODO:
        // This is returning undefined currently. See Utils file and function base64ToOpenRaster
        Utils.base64ToOpenRaster(res.data.b64).then((res) => {
          console.log(res);
        });         
        // this.setState({
        //   selectedFile: myBlob,
        //   image: Utils.base64ToArrayBuffer(res.data.b64),
        //   validations: null,
        //   displayNext: false,
        //   receiveTime: Date.now()
        // });
        // const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(myBlob);
        // this.loadAndViewImage(imageId);
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
    if (validationList === null) {
      return validationsComplete;
    }
    for( var i=0; i < validationList.length; i++){
      if (validationList[i] === 0) {
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
        let validationCompleted = this.validationCompleted(this.state.validations);
        let validationList = this.state.validations;
        let image = this.state.image;
        /*
        *  Third parameter is the "abort flag": True / False
        *  True. When feedback has been left for at least one detection, we need to create a TDR to save feedback
        *  False. When feedback has not been left for any detection we need to create a TDR w/ ABORT flag
        */
        this.setState({
          selectedFile: Dicos.dataToBlob(validationList, image, !validationCompleted)
        })
        this.sendImageToCommandServer(this.state.selectedFile).then((res) => {
          this.hideButtons(e);
          this.setState({
            selectedFile: null,
            isUpload: false
          });
          this.getNextImage();
        });
      } else if (res.data.confirm === 'image-not-removed') {
        console.log('file server couldnt remove the next image');
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
  loadAndViewImage(imageId) {
    const self = this;
    cornerstone.loadImage(imageId).then(
      function(image) {
        self.displayDICOSimage(image);
        self.loadDICOSdata(image);
      }, function(err) {
      alert(err);
    });
  }


  /**
   * displayDICOSinfo - Method that renders the x-ray image encoded in the DICOS+TDR file and
   *
   * @param  {type} image DICOS+TDR data
   * @return {type}       None
   */
  displayDICOSimage(image) {
    const viewport = cornerstone.getDefaultViewportForImage(this.state.imageViewport, image);
    this.setState({viewport: viewport})
    cornerstone.displayImage(this.state.imageViewport, image, viewport);
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

    this.setState({
      detections: null,
      selectedDetection: -1,
      threatsCount: image.data.uint16(Dicos.dictionary['NumberOfAlarmObjects'].tag),
      algorithm: image.data.string(Dicos.dictionary['ThreatDetectionAlgorithmandVersion'].tag),
      type: image.data.string(Dicos.dictionary['DetectorType'].tag),
      configuration: image.data.string(Dicos.dictionary['DetectorConfiguration'].tag),
      station: image.data.string(Dicos.dictionary['StationName'].tag),
      series: image.data.string(Dicos.dictionary['SeriesDescription'].tag),
      study: image.data.string(Dicos.dictionary['StudyDescription'].tag),
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
    const threatSequence = image.data.elements.x40101011;
    if (threatSequence == null){
      console.log("No Threat Sequence");
      return;
    }

    var detectionList = new Array(this.state.threatsCount);
    var validations = new Array(this.state.threatsCount);
    for (var i = 0; i < this.state.threatsCount; i++) {
      const boundingBoxCoords = Dicos.retrieveBoundingBoxData(threatSequence.items[i]);
      const objectClass = Dicos.retrieveObjectClass(threatSequence.items[i]);
      const confidenceLevel = Utils.decimalToPercentage(Dicos.retrieveConfidenceLevel(threatSequence.items[i]));

      detectionList[i] = new Detection(boundingBoxCoords, objectClass, confidenceLevel);
      validations[i] = 0;
      this.setState({
        detections: detectionList,
        validations: validations
      });
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
    let validations = this.state.validations;
    context.clearRect(0, 0, context.width, context.height);
    if (data === null || data.length === 0) {
      return;
    }
    for (var i = 0; i < data.length; i++){
      const detectionData = data[i];
      if (!detectionData || detectionData.boundingBox.length < B_BOX_COORDS) return;

      let detectionColor = detectionData.selected? DETECTION_COLOR_SELECTED : DETECTION_COLOR;

      // We set the rendering properties
      if(validations[i] === "CONFIRM"){
        detectionColor = detectionData.selected? DETECTION_COLOR_SELECTED : DETECTION_COLOR_VALID;
      }
      else if(validations[i] === "REJECT"){
        detectionColor = detectionData.selected? DETECTION_COLOR_SELECTED : DETECTION_COLOR_INVALID;
      }

      context.font = LABEL_FONT;
      context.strokeStyle = detectionColor;
      context.fillStyle = detectionColor;
      context.lineWidth = DETECTION_BORDER;
      const boundingBoxCoords = detectionData.boundingBox;
      const detectionLabel = Utils.formatDetectionLabel(detectionData.class, detectionData.confidence);
      const labelSize = Utils.getTextLabelSize(context, detectionLabel, LABEL_PADDING);

      context.fillStyle = detectionColor;
      context.strokeStyle = detectionColor;
      context.strokeRect(boundingBoxCoords[0], boundingBoxCoords[1], Math.abs(boundingBoxCoords[2] - boundingBoxCoords[0]), Math.abs(boundingBoxCoords[3] - boundingBoxCoords[1]));

      // Line rendering
      if (i === this.state.selectedDetection) {
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

    var selectedIndex = this.state.selectedDetection;
    var detectionList = this.state.detections;
    if(selectedIndex !== -1){
      if(detectionList[selectedIndex]){
        detectionList[selectedIndex].selected = false;
        this.setState({selectedDetection: -1})
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
    if (this.state.detections === null || this.state.detections.length === 0){
      return;
    }

    var clickedPos = -1;
    var selectedIndex = this.state.selectedDetection;
    var detectionList = this.state.detections;
    var validations = this.state.validations;
    let feedback = "";

    // User is submitting feedback through confirm or reject buttons
    if(e.currentTarget.id === "confirm" || e.currentTarget.id === "reject"){
      if(e.currentTarget.id === "confirm"){
        feedback = "CONFIRM";
      }
      if(e.currentTarget.id === "reject"){
        feedback = "REJECT";
      }
      detectionList[selectedIndex].selected = false;
      validations[selectedIndex] = feedback;
      this.setState({
        selectedDetection: -1,
        displayButtons: false,
        displayNext: true,
        validations:validations
      }, () => {
        this.renderButtons(e);
      });
    }

    // Handle regular click events for selecting and deselecting detections
    else{
      const mousePos = cornerstone.canvasToPixel(e.target, {x:e.detail.currentPoints.page.x, y:e.detail.currentPoints.page.y});

      for (var i = 0; i < detectionList.length; i++) {
        if(Utils.pointInRect(mousePos, detectionList[i].boundingBox)){
          clickedPos = i;
          break;
        }
      }
      if(clickedPos === -1) {
        if (selectedIndex !== -1) detectionList[selectedIndex].selected = false;
        selectedIndex = -1;
        this.setState({ displayButtons: false,  selectedDetection: selectedIndex }, () => {
          this.renderButtons(e);
        });
      }
      else {
        if (clickedPos === selectedIndex){
          detectionList[clickedPos].selected = false;
          selectedIndex = -1;
          this.setState({ displayButtons: false,  selectedDetection: selectedIndex }, () => {
            this.renderButtons(e);
          });
        } else {
            if (selectedIndex !== -1) detectionList[selectedIndex].selected = false;
            detectionList[clickedPos].selected = true;
            selectedIndex = clickedPos;
            this.setState({displayButtons: true, selectedDetection: selectedIndex}, () => {
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

    if (this.state.detections === null || this.state.detections.length === 0){
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
        const boundingBoxCoords = this.state.detections[this.state.selectedDetection].boundingBox;
        var coordsAcceptBtn =  cornerstone.pixelToCanvas(this.state.imageViewport, {x:boundingBoxCoords[2] + marginLeft, y:boundingBoxCoords[1]-buttonGap});
        leftAcceptBtn = coordsAcceptBtn.x ;
        topAcceptBtn = coordsAcceptBtn.y;
        var coordsRejectBtn =  cornerstone.pixelToCanvas(this.state.imageViewport, {x:boundingBoxCoords[2] + marginLeft, y:boundingBoxCoords[1]});
        topRejectBtn = coordsRejectBtn.y;
      }
      // TODO. Make sure buttons are inside screen
      /*
      if(e.detail.viewport.scale < .7 || e.detail.viewport.scale > 2.5){
        top = 300;
        left = 30;
      }
      */
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
          <div id="feedback-confirm"> </div>
          <div id="feedback-reject"> </div>
        </div>
        <NextButton nextImageClick={this.nextImageClick} displayNext={this.state.displayNext} />
      </div>
    );
  }

}

export default App;
