import React from 'react';
import {Component} from 'react';
import './App.css';
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import dicomParser from 'dicom-parser';
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
    cornerstone.enable(element);

    cornerstone.loadImage(imageId).then(function(image) {
      const viewport = cornerstone.getDefaultViewportForImage(element, image);
      // document.getElementById('toggleModalityLUT').checked = (viewport.modalityLUT !== undefined);
      // document.getElementById('toggleVOILUT').checked = (viewport.voiLUT !== undefined);
      cornerstone.displayImage(element, image, viewport);
      if(loaded === false) {
        // cornerstoneTools.mouseInput.enable(element);
        // cornerstoneTools.mouseWheelInput.enable(element);
        // cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
        // cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
        // cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
        // cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
        //
        // cornerstoneTools.imageStats.enable(element);
        loaded = true;
      }

      function setTools(){
        // IMAGE PAN
        const PanTool = cornerstoneTools.PanTool;
        cornerstoneTools.addTool(PanTool)
        cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 })

        // ZOOM
        // Add our tool, and set it's mode
        const Zoom = cornerstoneTools.ZoomTool;
        cornerstoneTools.addTool(Zoom)
        cornerstoneTools.setToolActive("ZoomMouseWheel", {});

        const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
        cornerstoneTools.addTool(ZoomTouchPinchTool)
        cornerstoneTools.setToolActive('ZoomTouchPinch', {})

        // RECTANGLE ROI
        const RectangleRoiTool = cornerstoneTools.RectangleRoiTool;
        cornerstoneTools.addTool(RectangleRoiTool)
        cornerstoneTools.setToolActive('RectangleRoi', { mouseButtonMask: 2 })
      }
      setTools();

      // function getTransferSyntax() {
      //   const value = image.data.string('x00020010');
      //   return value + ' [' + uids[value] + ']';
      // }
      //
      // function getSopClass() {
      //   const value = image.data.string('x00080016');
      //   return value + ' [' + uids[value] + ']';
      // }

      function getStudyDescription() {
        const value = image.data.string('x00081030');
        if(value === undefined) {
          return;
        }
        return value + (value === 0 ? ' (unsigned)' : ' (signed)');
      }

      function getInstitutionName() {
        const value = image.data.string('x00080080');
        if(value === undefined) {
          return;
        }
        return value + (value === 0 ? ' (unsigned)' : ' (signed)');
      }

      function getInstitutionLocation() {
        const value = image.data.string('x00080081');
        if(value === undefined) {
          return;
        }
        return value + (value === 0 ? ' (unsigned)' : ' (signed)');
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

      console.log(image.data.elements.x40101011.items[0].dataSet.elements.x40101037.items[0].dataSet.elements.x4010101d);
      var pixelData = new Uint8Array(image.data.byteArray.buffer,
          image.data.elements.x40101011.items[0].dataSet.elements.x40101037.items[0].dataSet.elements.x4010101d.dataOffset,
          image.data.elements.x40101011.items[0].dataSet.elements.x40101037.items[0].dataSet.elements.x4010101d.length);

      console.log(pixelData);
      console.log(detectAlgo);
      console.log(getStudyDescription());
      console.log(getInstitutionName());
      console.log(getInstitutionLocation());


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

export default App;
