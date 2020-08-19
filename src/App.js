import React from 'react';
import {Component} from 'react';
import './App.css';
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import dicomParser from 'dicom-parser';
import ReactDOM from 'react-dom';
import * as cornerstoneMath from "cornerstone-math";
import Hammer from "hammerjs";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import socketIOClient from "socket.io-client";
import Utils from "./Utils.js";
import Detection from "./Detection.js";
import axios from 'axios';
const COMMAND_SERVER = "http://127.0.0.1:4001";
const FILE_SERVER = "http://127.0.0.1:4002";

const BYTES_PER_FLOAT = 4;
const B_BOX_TAG = 'x4010101d';
const OBJECT_CLASS_TAG = 'x40101013';
const CONFIDENCE_LEVEL_TAG = 'x40101016';
const B_BOX_COORDS = 4;
const B_BOX_POINT_COUNT = 2;

// Detection label properties
const LABEL_FONT = "bold 12px Arial";
const LABEL_PADDING = 4;
const DETECTION_COLOR = '#367FFF';
const DETECTION_COLOR_SELECTED = '#F7B500';
const DETECTION_BORDER = 2;
const LABEL_TEXT_COLOR = '#FFFFFF'

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
    this.topLeftRef = React.createRef();
    this.topLeft2Ref = React.createRef();
    this.topLeft3Ref = React.createRef();
    this.topRightRef = React.createRef();
    this.topRight2Ref = React.createRef();
    this.topRight3Ref = React.createRef();
    this.bottomLeftRef = React.createRef();
    this.bottomLeft2Ref = React.createRef();
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
      detections: null,
      selectedDetection: -1,
      validated: false,
      displayButtons: false,
      imageViewport: document.getElementById('dicomImage'),
      viewport: cornerstone.getDefaultViewport(null, undefined),
      isConnected: null,
      socketCommand: socketIOClient(COMMAND_SERVER),
      socketFS: socketIOClient(FILE_SERVER)
    };
  }


  /**
   * componentDidMount - Method invoked after all elements on the page are rendered properly
   *
   * @return {type}  None
   */
  componentDidMount() {
    this.sendFilesToServer = this.sendFilesToServer.bind(this);
    this.nextImageClick = this.nextImageClick.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onImageRendered = this.onImageRendered.bind(this);
    this.loadAndViewImage = this.loadAndViewImage.bind(this);
    this.onMouseClicked = this.onMouseClicked.bind(this);
    this.state.imageViewport.addEventListener('cornerstoneimagerendered', this.onImageRendered);
    this.state.imageViewport.addEventListener('click', this.onMouseClicked);

    this.setupConerstoneJS(this.state.imageViewport);
    this.state.socketCommand = socketIOClient(COMMAND_SERVER);
    this.state.socketFS = socketIOClient(FILE_SERVER);
    this.getFilesFromCommandServer();
  }
  

  /**
   * getFilesFromCommandServer - Socket Listener to get files from command server then send them
   *                           - to the file server directly after
   * @param {type} - None      
   * @return {type} - None
   */
  async getFilesFromCommandServer(){
    this.state.socketCommand.on("img", data => {
      console.log('got image from command server');
      var imgBlob = this.b64toBlob(data, "image/dcs");
      this.sendFilesToServer(imgBlob, this.state.socketFS);
      console.log('sending image to file server');
    })
  }

  /**
   * sendFilesToServer - Socket IO to send a file to the server
   * @param {type} - file - which file we are sending
   * @param {type} - socket - what socket we are sending files on, command or file server
   * @return {type} - None
   */
  async sendFilesToServer(file, socket){
    socket.emit("fileFromClient", file);
    console.log(`File sent to server`);
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
    }).then((res) => {
      // We get our latest file upon the main component mounting
      if (res.data.response === 'error '){
        console.log('error getting next image');
      } else if (res.data.response === 'no-next-image') {
        console.log('No next image to display');
      } else {
        const myBlob = this.b64toBlob(res.data.b64);
        this.setState({ selectedFile: myBlob});
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(myBlob);
        this.loadAndViewImage(imageId);
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * nextImageClick() - When the operator taps next, we send to the file server to remove the 
   *                  - current image, then when that is complete, we send the image to the command
   *                  - server. Finally, calling getNextImage to display another image if there is one
   * @param {type} - None      
   * @return {type} - None
   */
  nextImageClick() {  
    axios.post(`${FILE_SERVER}/confirm`, {
      valid: true
    }, {
      crossdomain: true
    }).then(async (res) => {
      if (res.data.confirm === 'image-removed'){
        this.sendFilesToServer(this.state.selectedFile, this.state.socketCommand).then((res) => {
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
   * getFilesFromCommandServer - Socket Listener to get files from command server then send them
   *                           - to the file server directly after
   * @param {type} - None      
   * @return {type} - None
   */
  async getFilesFromCommandServer(){
    this.state.socketCommand.on("img", data => {
      var imgBlob = this.b64toBlob(data, "image/dcs");
      this.sendFilesToServer(imgBlob, this.state.socketFS);
      // If we got an image and we are null, we know we can now fetch one
      // This is how it triggers to display a new file if none existed and a new one
      // was added
      if (this.state.selectedFile === null){
        this.getNextImage();
      }
    })
  }

  /**
   * sendFilesToServer - Socket IO to send a file to the server
   * @param {type} - file - which file we are sending
   * @param {type} - socket - what socket we are sending files on, command or file server
   * @return {type} - None
   */
  async sendFilesToServer(file, socket){
    socket.emit("fileFromClient", file);
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
   * b64toBlob - Converts binary64 encoding to a blob to display
   *
   * @param  {type} b64Data Binary string
   * @param  {type} contentType The MIMI type, image/dcs
   * @return {type}               blob
   */
  b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  };

  /**
   * Event that represents the selection of file from the file manager of the system
   */
  onFileChange = event => {
    this.setState({ selectedFile: event.target.files[0], validated: false });
    const files = event.target.files[0];
    this.onFileUpload(files)
  };


  /**
   * Callback function triggered when a file change event happens that leads to
   * the load and display of the data in a DICOS+TDR file
   */
  onFileUpload = (file) => {
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
    this.loadAndViewImage(imageId);
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
      threatsCount: image.data.uint16('x40101034'),
      algorithm: image.data.string('x40101029'),
      type: image.data.string('x00187004'),
      configuration: image.data.string('x00187005'),
      station: image.data.string('x00081010'),
      series: image.data.string('x0008103e'),
      study: image.data.string('x00081030'),
      time: today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
      date: mm + '/' + dd + '/' + yyyy
    });

    if (this.state.threatsCount === 0 || this.state.threatsCount === undefined) {
      console.log("No Potential Threat Objects detected");
      return;
    }
    // Threat Sequence information
    const threatSequence = image.data.elements.x40101011;
    if (threatSequence == null){
      console.log("No Threat Sequence");
      return;
    }

    var detectionList = new Array(this.state.threatsCount);
    for (var i = 0; i < this.state.threatsCount; i++) {
      const boundingBoxCoords = this.retrieveBoundingBoxData(threatSequence.items[i]);
      const objectClass = this.retrieveObjectClass(threatSequence.items[i]);
      const confidenceLevel = Utils.decimalToPercentage(this.retrieveConfidenceLevel(threatSequence.items[i]));

      detectionList[i] = new Detection(boundingBoxCoords, objectClass, confidenceLevel);
      this.setState({
        detections: detectionList
      });
    }
  }


  /**
   * retrieveBoundingBoxData - Method that parses a DICOS+TDR file to pull the coordinates of the bounding boxes to be rendered
   *
   * @param  {type} image DICOS+TDR image data
   * @return {type}       Float array with the coordenates of the several bounding boxes derived from the DICOS+TDR data.
   *                      Each bounding box is defined by the two end points of the diagonal, and each point is defined by its coordinates x and y.
   */
  retrieveBoundingBoxData(image) {
    console.log(image);
    const bBoxDataSet = image.dataSet.elements.x40101037.items[0].dataSet;
    const bBoxByteArraySize = bBoxDataSet.elements[B_BOX_TAG].length
    const bBoxBytesCount = bBoxByteArraySize / BYTES_PER_FLOAT;
    // NOTE: The z component is not necessary, so we get rid of the third component in every trio of values
    const bBoxComponentsCount = B_BOX_POINT_COUNT * bBoxBytesCount / 3;
    var bBoxCoords = new Array(bBoxComponentsCount);
    var bBoxIndex = 0;
    var componentCount = 0;

    for (var i = 0; i < bBoxBytesCount; i++,componentCount++) {
      if (componentCount === B_BOX_POINT_COUNT) {
        componentCount = -1;
        continue;
      }
      bBoxCoords[bBoxIndex] = bBoxDataSet.float(B_BOX_TAG, i);
      bBoxIndex++;
    }
    return bBoxCoords;
  }


  /**
   * retrieveObjectClass - Method that parses a DICOS+TDR file to pull the a string value that indicates the class of the potential threat object
   *
   * @param  {type} image DICOS+TDR image data
   * @return {type}       String value with the description of the potential threat object
   */
  retrieveObjectClass(image) {
    return image.dataSet.elements.x40101038.items[0].dataSet.string(OBJECT_CLASS_TAG);
  }


  /**
   * retrieveConfidenceLevel - Method that parses a DICOS+TDR file to pull the a float value that indicates the confidence level of the detection algorithm used
   *
   * @param  {type} image DICOS+TDR image data
   * @return {type}       Float value with the confidence level
   */
  retrieveConfidenceLevel(image) {
    return image.dataSet.elements.x40101038.items[0].dataSet.float(CONFIDENCE_LEVEL_TAG);
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
    // set the canvas context to the image coordinate system
    //cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, eventData.canvasContext);
    // NOTE: The coordinate system of the canvas is in image pixel space.  Drawing
    // to location 0,0 will be the top left of the image and rows,columns is the bottom
    // right.
    const context = eventData.canvasContext;
    this.renderDetections(this.state.detections, context);
    this.renderGeneralInfo();
  }


  /**
   * renderDetections - Method that renders the several annotations in a given DICOS+TDR file
   *
   * @param  {type} data    DICOS+TDR data
   * @param  {type} context Rendering context
   * @return {type}         None
   */
  renderDetections(data, context) {
    context.clearRect(0, 0, context.width, context.height);
    if (data === null || data.length === 0) {
      return;
    }
    for (var i = 0; i < data.length; i++){
      const detectionData = data[i];
      if (!detectionData || detectionData.boundingBox.length < B_BOX_COORDS) return;

      // We set the rendering properties
      const detectionColor = detectionData.selected? DETECTION_COLOR_SELECTED : DETECTION_COLOR;
      context.font = LABEL_FONT;
      context.strokeStyle = detectionColor;
      context.lineWidth = DETECTION_BORDER;
      const boundingBoxCoords = detectionData.boundingBox;
      const detectionLabel = Utils.formatDetectionLabel(detectionData.class, detectionData.confidence);
      const labelSize = Utils.getTextLabelSize(context, detectionLabel, LABEL_PADDING);

      const validated = this.state.validated;

      // Bounding box rendering
      if(validated === false) {
        context.strokeRect(boundingBoxCoords[0], boundingBoxCoords[1], Math.abs(boundingBoxCoords[2] - boundingBoxCoords[0]), Math.abs(boundingBoxCoords[3] - boundingBoxCoords[1]));
        // Label rendering
        context.fillStyle = detectionColor;
        context.fillRect(boundingBoxCoords[0], boundingBoxCoords[1] - labelSize["height"], labelSize["width"], labelSize["height"]);
        context.strokeRect(boundingBoxCoords[0], boundingBoxCoords[1] - labelSize["height"], labelSize["width"], labelSize["height"]);
        context.fillStyle = LABEL_TEXT_COLOR;
        context.fillText(detectionLabel, boundingBoxCoords[0] + LABEL_PADDING, boundingBoxCoords[1] - LABEL_PADDING);
      }
    }
  };


  /**
   * renderGeneralInfo - Updates DOM elements with general data pulled from the DICOS+TDR file
   *
   * @return {type}  None
   */
  renderGeneralInfo() {
    this.topLeftRef.current.textContent = "Algorithm: " + this.state.algorithm;
    this.topLeft2Ref.current.textContent = "Detector Type: " + this.state.type;
    this.topLeft3Ref.current.textContent = "Detector Configuration: " + this.state.configuration;
    this.topRightRef.current.textContent = "Station Name: " + this.state.station;
    this.topRight2Ref.current.textContent = "Date: " + this.state.date;
    this.topRight3Ref.current.textContent = "Time: " + this.state.time;
    this.bottomLeftRef.current.textContent = "Series: " + this.state.series;
    this.bottomLeft2Ref.current.textContent = "Study: " + this.state.study;
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

    // User is submitting feedback through confirm or reject buttons
    if(e.currentTarget.id === "confirm" || e.currentTarget.id === "reject"){
      if(e.currentTarget.id === "confirm"){
        this.setState({ selectedIndex: -1, validated: true }, () => {
          selectedIndex = this.state.selectedDetection;
        });
        console.log("user confirmed detection");
      }
      if(e.currentTarget.id === "reject"){
        this.setState({ selectedIndex: -1, validated: true }, () => {
          selectedIndex = this.state.selectedDetection;
        });
        console.log("user rejected detection");
      }
      detectionList[selectedIndex].selected = false
      this.setState({ displayButtons: false }, () => {
        this.renderButtons(e, clickedPos, selectedIndex);
      });
    }

    // Handle regular click events for selecting and deselecting detections
    else{
      const mousePos = cornerstone.canvasToPixel(e.currentTarget, {x:e.pageX, y:e.pageY});

      for (var i = 0; i < detectionList.length; i++) {
        if(Utils.pointInRect(mousePos, detectionList[i].boundingBox)){
          clickedPos = i;
          break;
        }
      }
      if(clickedPos === -1) {
        if (selectedIndex !== -1) detectionList[selectedIndex].selected = false;
        selectedIndex = -1;
        this.setState({ displayButtons: false }, () => {
          this.renderButtons(e, clickedPos, selectedIndex);
        });
      }
      else {
        if (clickedPos === selectedIndex){
          detectionList[clickedPos].selected = false;
          selectedIndex = -1;
          this.setState({ displayButtons: false }, () => {
            this.renderButtons(e, clickedPos, selectedIndex);
          });
        } else {
          if (selectedIndex !== -1) detectionList[selectedIndex].selected = false;
          detectionList[clickedPos].selected = true;
          selectedIndex = clickedPos;
          this.setState({ displayButtons: true }, () => {
            this.renderButtons(e, clickedPos, selectedIndex);
          });
        }
      }
    }
  }

  renderButtons(e, clickedPos, selectedIndex) {
    let className = "";

    if (this.state.detections === null || this.state.detections.length === 0){
      return;
    }
    var detectionList = this.state.detections;

    className = this.state.displayButtons ? "" : "hidden";
    let top = 0;
    let left = 0;
    if(className !== "hidden"){
      top = e.pageY;
      left = detectionList[clickedPos].boundingBox[3];
    }
    className = className + "feedback-buttons"

    this.setState({detections: detectionList, selectedDetection: selectedIndex});

    ReactDOM.render(React.createElement("button", { id:"confirm", onClick: this.onMouseClicked, className: className,
      style: {
        top: top,
        left: left,
        backgroundColor: "green",
      }
    }, "CONFIRM"), document.getElementById('feedback-confirm'));

    ReactDOM.render(React.createElement("button", { id:"reject", onClick: this.onMouseClicked ,className: className,
      style: {
        top: top,
        left: left,
        marginTop: "40px",
        backgroundColor: "red",
      }
    }, "REJECT"), document.getElementById('feedback-reject'));

    cornerstone.updateImage(this.state.imageViewport, true);
  }

  /**
   * onMouseClicked - Callback function invoked on mouse clicked. We handle the selection of detections.
   *
   * @param  {type} e Event data such as the mouse cursor position, mouse button clicked, etc.
   * @return {type}   None
   */
  onMouseClicked(e) {
    var className = "";
    if (this.state.detections === null || this.state.detections.length === 0){
      return;
    }
    var detectionList = this.state.detections;
    var selectedIndex = this.state.selectedDetection;

    const mousePos = cornerstone.canvasToPixel(e.currentTarget, {x:e.pageX, y:e.pageY});
    var clickedPos = -1;
    for (var i = 0; i < detectionList.length; i++) {
      if(Utils.pointInRect(mousePos, detectionList[i].boundingBox)){
        clickedPos = i;
        break;
      }
    }
    if(clickedPos === -1) {
      if (selectedIndex !== -1) detectionList[selectedIndex].selected = false;
      this.setState({displayButtons: false})
      selectedIndex = -1;
    }
    else {
      if (clickedPos === selectedIndex){
        detectionList[clickedPos].selected = false;
        this.setState({displayButtons: false})
        selectedIndex = -1;
      } else {
        if (selectedIndex !== -1) detectionList[selectedIndex].selected = false;
        detectionList[clickedPos].selected = true;
        this.setState({displayButtons: true})
        selectedIndex = clickedPos;
      }
    }

    className = this.state.displayButtons ? "" : "hidden";
    let top = 0;
    let left = 0;
    if(className !== "hidden"){
      top = e.pageY;
      left = detectionList[clickedPos].boundingBox[3];
    }
    className = className + "feedback-buttons"


    this.setState({detections: detectionList, selectedDetection: selectedIndex});

    ReactDOM.render(React.createElement("button", { className: className,
      style: {
        top: top,
        left: left,
        backgroundColor: "green",
      }
    }, "CONFIRM"), document.getElementById('feedback-confirm'));

    ReactDOM.render(React.createElement("button", { className: className,
      style: {
        top: top,
        left: left,
        marginTop: "40px",
        backgroundColor: "red",
      }
    }, "REJECT"), document.getElementById('feedback-reject'));

    cornerstone.updateImage(this.state.imageViewport, true);
  }

  render() {
    return (
      <div>
          <div>
            <input type="file" onChange={this.onFileChange} />
          </div>
      </div>
    );
  }

}

export default App;
