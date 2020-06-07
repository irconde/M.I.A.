import React from 'react';
import {Component} from 'react';
import './App.css';
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import dicomParser from 'dicom-parser';
import * as cornerstoneMath from "cornerstone-math";
import Hammer from "hammerjs";
import * as cornerstoneWADOimageLoader from "cornerstone-wado-image-loader";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWADOimageLoader.external.cornerstone = cornerstone;
cornerstoneWADOimageLoader.external.dicomParser = dicomParser;

let loaded = false;

class App extends Component {

  state = {
    // Initially, no file is selected
    selectedFile: null
  };

  // On file select (from the pop up)
  onFileChange = event => {

    // Update the state
    this.setState({ selectedFile: event.target.files[0] });
    const files = event.target.files[0];
    this.onFileUpload(files)
  };

  // On file upload (click the upload button)
  onFileUpload = (file) => {

    const imageId = cornerstoneWADOimageLoader.wadouri.fileManager.add(file);
    console.log(imageId);
    this.loadAndViewImage(imageId);
  };

  loadAndViewImage(imageId) {
    cornerstoneTools.init();

    const element = document.getElementById('dicomImage');
    cornerstone.enable(element);

    const start = new Date().getTime();
    cornerstone.loadImage(imageId).then(function(image) {
      console.log(image);
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

      // function getTransferSyntax() {
      //   const value = image.data.string('x00020010');
      //   return value + ' [' + uids[value] + ']';
      // }
      //
      // function getSopClass() {
      //   const value = image.data.string('x00080016');
      //   return value + ' [' + uids[value] + ']';
      // }

      function getPixelRepresentation() {
        const value = image.data.uint16('x00280103');
        if(value === undefined) {
          return;
        }
        return value + (value === 0 ? ' (unsigned)' : ' (signed)');
      }

      function getPlanarConfiguration() {
        const value = image.data.uint16('x00280006');
        if(value === undefined) {
          return;
        }
        return value + (value === 0 ? ' (pixel)' : ' (plane)');
      }

      // document.getElementById('transferSyntax').textContent = getTransferSyntax();
      // document.getElementById('sopClass').textContent = getSopClass();
      // document.getElementById('samplesPerPixel').textContent = image.data.uint16('x00280002');
      // document.getElementById('photometricInterpretation').textContent = image.data.string('x00280004');
      // document.getElementById('numberOfFrames').textContent = image.data.string('x00280008');
      // document.getElementById('planarConfiguration').textContent = getPlanarConfiguration();
      // document.getElementById('rows').textContent = image.data.uint16('x00280010');
      // document.getElementById('columns').textContent = image.data.uint16('x00280011');
      // document.getElementById('pixelSpacing').textContent = image.data.string('x00280030');
      // document.getElementById('bitsAllocated').textContent = image.data.uint16('x00280100');
      // document.getElementById('bitsStored').textContent = image.data.uint16('x00280101');
      // document.getElementById('highBit').textContent = image.data.uint16('x00280102');
      // document.getElementById('pixelRepresentation').textContent = getPixelRepresentation();
      // document.getElementById('windowCenter').textContent = image.data.string('x00281050');
      // document.getElementById('windowWidth').textContent = image.data.string('x00281051');
      // document.getElementById('rescaleIntercept').textContent = image.data.string('x00281052');
      // document.getElementById('rescaleSlope').textContent = image.data.string('x00281053');
      // document.getElementById('basicOffsetTable').textContent = image.data.elements.x7fe00010 && image.data.elements.x7fe00010.basicOffsetTable ? image.data.elements.x7fe00010.basicOffsetTable.length : '';
      // document.getElementById('fragments').textContent = image.data.elements.x7fe00010 && image.data.elements.x7fe00010.fragments ? image.data.elements.x7fe00010.fragments.length : '';
      // document.getElementById('minStoredPixelValue').textContent = image.minPixelValue;
      // document.getElementById('maxStoredPixelValue').textContent = image.maxPixelValue;
      // const end = new Date().getTime();
      // const time = end - start;
      // document.getElementById('totalTime').textContent = time + "ms";
      // document.getElementById('loadTime').textContent = image.loadTimeInMS + "ms";
      // document.getElementById('decodeTime').textContent = image.decodeTimeInMS + "ms";
    }, function(err) {
      alert(err);
    });
  }


  // File content to be displayed after
  // file upload is complete
  fileData = () => {

    if (this.state.selectedFile) {
      const imageId = cornerstoneWADOimageLoader.wadouri.fileManager.add(this.state.selectedFile);
      this.loadAndViewImage(imageId);
      console.log(imageId);
      return (
          <div>
            <h2>File Details:</h2>
            <p>File Name: {this.state.selectedFile.name}</p>
            <p>File Type: {this.state.selectedFile.type}</p>
            <p>
              Last Modified:{" "}
              {this.state.selectedFile.lastModifiedDate.toDateString()}
            </p>
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
