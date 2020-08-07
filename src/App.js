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

const BYTES_PER_FLOAT = 4;
const B_BOX_TAG = 'x4010101d';
const B_BOX_LENGTH = 6;
const B_BOX_COORDS = 4;
const B_BOX_POINT_COUNT = 2;

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init();
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
      selectedFile: null,
      boundingBoxData: null,
      algorithm: null,
      type: null,
      configuration: null,
      station: null,
      series: null,
      study: null,
      date: null,
      time: null,
      imageViewport: document.getElementById('dicomImage'),
      viewport: cornerstone.getDefaultViewport(null, undefined)
    };

    this.onFileChange = this.onFileChange.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onImageRendered = this.onImageRendered.bind(this);
    this.loadAndViewImage = this.loadAndViewImage.bind(this);
    this.state.imageViewport.addEventListener('cornerstoneimagerendered', this.onImageRendered);
    this.state.imageViewport.addEventListener('click', handleClick);
    this.setupConerstoneJS(this.state.imageViewport);
  }


  /**
   * setupConerstoneJS - CornerstoneJS Tools are initialized
   *
   * @param  {type} imageViewport DOM element where the x-ray image is rendered
   * @return {type}               None
   */
  setupConerstoneJS(imageViewport) {
    cornerstone.enable(imageViewport);
    const start = new Date().getTime();
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
   * Event that represents the selection of file from the file manager of the system
   */
  onFileChange = event => {
    this.setState({ selectedFile: event.target.files[0] });
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
    this.state.boundingBoxData = this.retrieveBoundingBoxData(image);
    this.state.algorithm = image.data.string('x40101029');
    this.state.type = image.data.string('x00187004');
    this.state.configuration = image.data.string('x00187005');
    this.state.station = image.data.string('x00081010');
    this.state.series = image.data.string('x0008103e');
    this.state.study = image.data.string('x00081030');
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    this.state.time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    this.state.date = mm + '/' + dd + '/' + yyyy;
  }


  /**
   * retrieveBoundingBoxData - Method that parses a DICOS+TDR file to pull the coordinates of the bounding boxes to be rendered
   *
   * @param  {type} image DICOS+TDR image data
   * @return {type}       Float array with the coordenates of the several bounding boxes derived from the DICOS+TDR data.
   *                      Each bounding box is defined by the two end points of the diagonal, and each point is defined by its coordinates x and y.
   */
  retrieveBoundingBoxData(image) {
    const bBoxDataSet = image.data.elements.x40101011.items[0].dataSet.elements.x40101037.items[0].dataSet;
    const bBoxByteArraySize = bBoxDataSet.elements[B_BOX_TAG].length
    const bBoxBytesCount = bBoxByteArraySize / BYTES_PER_FLOAT;
    // NOTE: The z component is not necessary, so we get rid of the third component in every trio of values
    const bBoxComponentsCount = B_BOX_POINT_COUNT * bBoxBytesCount / 3;
    var bBoxCoords = new Array(bBoxComponentsCount);
    var bBoxIndex = 0;
    var componentCount = 0;

    for (var i = 0; i < bBoxBytesCount; i++,componentCount++) {
      if (componentCount == B_BOX_POINT_COUNT) {
        componentCount = -1;
        continue;
      }
      bBoxCoords[bBoxIndex] = bBoxDataSet.float(B_BOX_TAG, i);
      bBoxIndex++;
    }
    return bBoxCoords;
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
    this.renderDetections(this.state.boundingBoxData, context);
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
    if (!data) return;
    for (var i = 0; i < data.length; i += B_BOX_COORDS) {
      context.beginPath();
      context.strokeStyle = '#4ceb34';
      context.lineWidth = 1;
      // rect expected parameters (x, y, width, height)
      context.rect(data[i], data[i+1], Math.abs(data[i+2] - data[i]), Math.abs(data[i+3] - data[i+1]));
      context.stroke();
      // TODO. We need to pass as another parameter of the function a list with the corresponding labels
      context.fillStyle = "#4ceb34";
      context.font = "10px Arial";
      context.fillText(this.state.algorithm, data[i], data[i+1]);
    }
  };


  /**
   * renderGeneralInfo - Updates DOM elements with general data pulled from the DICOS+TDR file
   *
   * @return {type}  None
   */
  renderGeneralInfo() {
    document.getElementById('topleft').textContent = "Algorithm: " + this.state.algorithm;
    document.getElementById('topleft2').textContent = "Detector Type: " + this.state.type;
    document.getElementById('topleft3').textContent = "Detector Configuration: " + this.state.configuration;
    document.getElementById('topright').textContent = "Station Name: " + this.state.station;
    document.getElementById('topright2').textContent = "Date: " + this.state.date;
    document.getElementById('topright3').textContent = "Time: " + this.state.time;
    document.getElementById('bottomleft').textContent = "Series: " + this.state.series;
    document.getElementById('bottomleft2').textContent = "Study: " + this.state.study;
  }


  // File content to be displayed after
  // file upload is complete
  fileData = () => {
    if (this.state.selectedFile) {
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(this.state.selectedFile);
      // TODO. Review this and delete if if it's not necessary. This line makes
      // the "loadAndViewImage" method to execute three times. That's why I commented it
      // this.loadAndViewImage(imageId);
      return (
          <div>
            <h2>File Details:</h2>
            <p>File Name: {this.state.selectedFile.name}</p>
            <p>File Type: {this.state.selectedFile.type}</p>
          </div>
      );
    } else {
      return (
          <div>
            {/*<br />*/}
            {/*<h4>Choose before Pressing the Upload button</h4>*/}
          </div>
      );
    }
  };

  render() {

    return (
        <div>
          <div>
            <input type="file" onChange={this.onFileChange} />
          </div>
          {this.fileData()}
        </div>
    );
  }
}

function handleClick(e) {
  var left = e.screenX + 'px';
  var top =  e.screenY + 'px';
  console.log(left);
  console.log(top);
  console.log("click event worked!");

  const buttons = React.createElement(Buttons, {style: {left: left, top: top}}, {});
  // RENDERING THIS INTO THE PARENT ELEMENT('viewerContainer') BRINGS THE BUTTONS UP, BUT MAKES EVERYTHING ELSE DISAPPEAR
  ReactDOM.render(buttons, document.getElementById('feedback-buttons'));
}

var buttonConfirm = {
  margin: '10px 10px 10px 0',
  backgroundColor: 'green',
  color: 'white',
  borderRadius: '30px',
  borderSize: '1pt',
  height: '30px',
  width: '100px',
  fontWeight: 'bold',
  position: 'absolute',
  zIndex:'9'
};

var buttonReject = {
  margin: '10px 10px 10px 0',
  backgroundColor: 'red',
  color: 'white',
  borderRadius: '30px',
  borderSize: '1pt',
  height: '30px',
  width: '100px',
  fontWeight: 'bold',
  position: 'absolute',
  zIndex:'9'
};

class Buttons extends React.Component {
  render(){
    return ([
        <button
            className="btn btn-default" key={'confirm'} style={buttonConfirm}>CONFIRM</button>,
          <button
              className="btn btn-default" key={'reject'} style={buttonReject}>REJECT</button>
            ]
    );
  }
}

class Detections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confidence: 0.0,
      validity: false,
      coordinates: [
        {
          title: "Top left coordinates",
          x: 0,
          y: 0
        },
        {
          title: "Bottom left coordinates",
          x: 0,
          y: 0
        },
        {
          title: "Top right coordinates",
          x: 0,
          y: 0
        },
        {
          title: "Bottom right coordinates",
          x: 0,
          y: 0
        }
      ]
    };
  }

  render() {
    return([

        ]);
  }
}

export default App;
