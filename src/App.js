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
var firstTime = true;
var boundingBoxData;

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

function retrieveBoundingBoxData(image) {
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

function renderDetections(data, context) {
  for (var i = 0; i < data.length; i += B_BOX_COORDS) {
    context.beginPath();
    context.strokeStyle = '#4ceb34';
    context.lineWidth = 1;
    // rect expected parameters (x, y, width, height)
    context.rect(data[i], data[i+1], Math.abs(data[i+2] - data[i]), Math.abs(data[i+3] - data[i+1]));
    context.stroke();
    // TODO. We need to pass as another paarameter of the function a list with the corresponding labels
    /*
    context.fillStyle = "#4ceb34";
    context.font = "10px Arial";
    context.fillText("Label01", data[i], data[i+1]);
    */
  }
}

// setup handlers before we display the image
function onImageRendered(e) {
  console.log("onImageRendered");
  const eventData = e.detail;

  // set the canvas context to the image coordinate system
  //cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, eventData.canvasContext);
  // NOTE: The coordinate system of the canvas is in image pixel space.  Drawing
  // to location 0,0 will be the top left of the image and rows,columns is the bottom
  // right.
  const context = eventData.canvasContext;
  renderDetections(boundingBoxData, context);
}

const element = document.getElementById('dicomImage');
element.addEventListener('cornerstoneimagerendered', onImageRendered);
element.addEventListener('click', handleClick);
cornerstone.enable(element);
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


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // Initially, no file is selected
      selectedFile: null,
      viewport: cornerstone.getDefaultViewport(null, undefined),
      x: 0,
      y: 0
    };
    this.onFileChange = this.onFileChange.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.loadAndViewImage = this.loadAndViewImage.bind(this);
  }

  // On file select (from the pop up)
  onFileChange = event => {
    // Update the state
    this.setState({ selectedFile: event.target.files[0] });
    const files = event.target.files[0];
    this.onFileUpload(files)
  };

    // On file upload (click the upload button)
    onFileUpload = (file) => {
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      this.loadAndViewImage(imageId);

    };

  loadAndViewImage(imageId) {
    cornerstone.loadImage(imageId).then(function(image) {

      const viewport = cornerstone.getDefaultViewportForImage(element, image);
      // document.getElementById('toggleModalityLUT').checked = (viewport.modalityLUT !== undefined);
      // document.getElementById('toggleVOILUT').checked = (viewport.voiLUT !== undefined);
      cornerstone.displayImage(element, image, viewport);

      const detectAlgo = image.data.string('x40101029');
      const detectType = image.data.string('x00187004');
      const detectConfig = image.data.string('x00187005');
      const station = image.data.string('x00081010');
      const series = image.data.string('x0008103e');
      const study = image.data.string('x00081030');

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      var seriesTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var seriesDate = mm + '/' + dd + '/' + yyyy;

      boundingBoxData = retrieveBoundingBoxData(image);

    }, function(err) {
      alert(err);
    });
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
