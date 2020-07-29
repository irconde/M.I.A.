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

let loaded = false;

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
    const element = document.getElementById('dicomImage');
    element.addEventListener('click', handleClick);

    cornerstone.enable(element);

    const start = new Date().getTime();
    cornerstone.loadImage(imageId).then(function(image) {
      const viewport = cornerstone.getDefaultViewportForImage(element, image);
      // document.getElementById('toggleModalityLUT').checked = (viewport.modalityLUT !== undefined);
      // document.getElementById('toggleVOILUT').checked = (viewport.voiLUT !== undefined);
      cornerstone.displayImage(element, image, viewport);
      if(loaded === false) {
        loaded = true;
        // var toolTypes = ['RectangleRoi'];
        //
        // // Try pasting this block into the allImageTools example:
        // var toolDataString = '{"angle":{"data":[{"visible":true,"handles":{"start":{"x":92.40628941112809,"y":109.38908238107877,"highlight":true,"active":false},"end":{"x":112.40628941112809,"y":99.64666043201174,"highlight":true,"active":false,"eactive":false},"start2":{"x":92.40628941112809,"y":109.38908238107877,"highlight":true,"active":false},"end2":{"x":112.40628941112809,"y":119.38908238107877,"highlight":true,"active":false}}}]},"length":{"data":[{"visible":true,"handles":{"start":{"x":30.63388210486889,"y":77.14351868515968,"highlight":true,"active":false},"end":{"x":57.46755322260141,"y":154.21895700205096,"highlight":true,"active":false,"eactive":false}}}]}}';
        //
        // // --- To put the tool data back ---
        // var allToolData = JSON.parse(toolDataString);
        // for (var toolType in allToolData) {
        //   if (allToolData.hasOwnProperty(toolType)) {
        //     for (var i = 0; i < allToolData[toolType].data.length; i++) {
        //       var toolData = allToolData[toolType].data[i];
        //       cornerstoneTools.addToolState(element, toolType, toolData);
        //     }
        //   }
        // }
        // // Update the canvas
        // cornerstone.updateImage(element);
        setTools();
      }

      function setTools(){
        // IMAGE PAN
        const PanTool = cornerstoneTools.PanTool;
        cornerstoneTools.addTool(PanTool);
        cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });

        // ZOOM
        // Add our tool, and set it's mode
        const Zoom = cornerstoneTools.ZoomMouseWheelTool;
        cornerstoneTools.addTool(Zoom);
        cornerstoneTools.setToolActive("ZoomMouseWheel", {});

        const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
        cornerstoneTools.addTool(ZoomTouchPinchTool);
        cornerstoneTools.setToolActive('ZoomTouchPinch', {});

        // RECTANGLE ROI
        const RectangleRoiTool = cornerstoneTools.RectangleRoiTool;
        cornerstoneTools.addTool(RectangleRoiTool);
        cornerstoneTools.setToolActive('RectangleRoi', { mouseButtonMask: 2 });
      }

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

      // var pixelData = new Uint8Array(image.data.byteArray.buffer,
      //     image.data.elements.x40101011.items[0].dataSet.elements.x40101037.items[0].dataSet.elements.x4010101d.dataOffset,
      //     image.data.elements.x40101011.items[0].dataSet.elements.x40101037.items[0].dataSet.elements.x4010101d.length);
      //
      // console.log(pixelData);
      // get the pixel data element (contains the offset and length of the data)
      var pixelDataElement = image.data.elements.x40101011.items[0].dataSet.elements.x40101037.items[0].dataSet.elements.x4010101d;

      // create a typed array on the pixel data (this example assumes 16 bit unsigned data)
      var pixelData = new Uint8Array(image.data.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);



      // setup handlers before we display the image
      function onImageRendered(e) {
        const eventData = e.detail;

        // set the canvas context to the image coordinate system
        cornerstone.setToPixelCoordinateSystem(eventData.enabledElement, eventData.canvasContext);

        // NOTE: The coordinate system of the canvas is in image pixel space.  Drawing
        // to location 0,0 will be the top left of the image and rows,columns is the bottom
        // right.
        const context = eventData.canvasContext;
        context.beginPath();
        context.strokeStyle = '#4ceb34';
        context.lineWidth = .5;
        context.rect(190, 410, 110, 110);
        context.stroke();
        context.fillStyle = "#4ceb34";
        context.font = "10px Arial";
        context.fillText(detectAlgo, 190, 405);

        document.getElementById('topleft').textContent = "Algorithm: " + detectAlgo;
        document.getElementById('topleft2').textContent = "Detector Type: " + detectType;
        document.getElementById('topleft3').textContent = "Detector Configuration: " + detectConfig;
        document.getElementById('topright').textContent = "Station Name: " + station;
        document.getElementById('topright2').textContent = "Date: " + seriesDate;
        document.getElementById('topright3').textContent = "Time: " + seriesTime;
        document.getElementById('bottomleft').textContent = "Series: " + series;
        document.getElementById('bottomright').textContent = "Zoom:" + eventData.viewport.scale.toFixed(2);
        document.getElementById('bottomleft2').textContent = "Study: " + study;

      }

      element.addEventListener('cornerstoneimagerendered', onImageRendered);

    }, function(err) {
      alert(err);
    });
  }

  // File content to be displayed after
  // file upload is complete
  fileData = () => {

    if (this.state.selectedFile) {
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(this.state.selectedFile);
      this.loadAndViewImage(imageId);
      return (
          <div>
            <h2>File Details:</h2>
            <p>File Name: {this.state.selectedFile.name}</p>
            <p>File Type: {this.state.selectedFile.type}</p>
            {/*<p>*/}
            {/*  Last Modified:{" "}*/}
            {/*  {this.state.selectedFile.lastModifiedDate.toDateString()}*/}
            {/*</p>*/}
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

  const buttons = React.createElement(Buttons, {}, {});
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

export default App;
