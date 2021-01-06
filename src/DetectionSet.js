import * as constants from "./Constants";

/**
 * Class that represents a set of detections returned by an object detection algorithm
 */
export default class DetectionSet {

  constructor() {
    this.algorithm = "";
    this.selected = false;
    this.selectedViewport = 0;
    this.selectedDetection = constants.selection.NO_SELECTION;
    this.visible = true;
    this.data = {};
    this.anotherSelected = false;
    let viewport = constants.viewport.TOP;
    if (arguments.length > 0) {
      viewport = arguments[0];
    }
    if (!(viewport in this.data)) {
      this.data[viewport] = [];
    }
  }

  /**
   * getData - Method that provides the list of detections associated with a given view
   *
   * @param  {type} viewport  string value that indicates the viewport where the detections will be rendered
   * @return {type}           Array of Detection objects
   */
  getData(viewport) {
    if (viewport !== undefined) {
      return this.data[viewport];
    }
    return this.data[constants.viewport.TOP];
  }

  /**
   * getDataFromSelectedDetection - Method that provides all the data regarding
   * a the currently selected detection
   *
   * @return {type}  Detection object
   */
  getDataFromSelectedDetection() {
    let view = this.selectedViewport;
    if (this.selectedViewport === undefined) {
      view = constants.viewport.TOP;
    }
    if (this.selectedDetection !== constants.selection.NO_SELECTION) {
      return this.data[view][this.selectedDetection];
    } else {
      return undefined;
    }
  }

  /**
   * validateSelectedDetection - Method used to validate a currently selected
   * detection given the user feedback provided through the validation buttons
   *
   * @param  {type} feedback  boolean value that indicates whether the detection is right or wrong
   * @return {type}           None
   */
  validateSelectedDetection(feedback) {
    let view = this.selectedViewport;
    if (view === undefined || view === 0) {
      view = constants.viewport.TOP;
    }
    if (this.selectedDetection === -1) {
      return;
    }
    this.data[view][this.selectedDetection].validate(feedback);
    this.clearSelection();
    
  }

  /**
   * clearSelection - Method that resets selection. Deselects the currently selected detection
   *
   * @return {type}  None
   */
  clearSelection() {
    if (this.selectedDetection !== constants.selection.NO_SELECTION) {
      this.getData(this.selectedViewport)[this.selectedDetection].setSelected(false);
    }
    this.selectedViewport = undefined;
    this.selectedDetection = constants.selection.NO_SELECTION;
  }

  /**
   * selectDetection - Method that selects a detection that is referenced by detectionIndex and rendered in the given viewport.
   *
   * @param  {type} detectionIndex  int value that indicates the index of the detection to be selected (the position of the detection in the associated array of detections)
   * @param  {type} viewport  string value that indicates the viewport where the detection is rendered
   * @return {type}  boolean value that indicates whether there's any detection selected or not
   */
  selectDetection(detectionIndex, viewport){
    let view = constants.viewport.TOP;
    if (viewport !== undefined) {
      view = viewport;
    }
    if (this.selectedDetection !== constants.selection.NO_SELECTION) {
      this.data[view][this.selectedDetection].setSelected(false);
    }
    if (this.selectedViewport === viewport  && this.selectedDetection === detectionIndex) {
      this.selectedViewport = undefined;
      this.selectedDetection = constants.selection.NO_SELECTION;
      return false;
    } else {
      this.data[view][detectionIndex].setSelected(true);
      this.selectedDetection = detectionIndex;
      this.selectedViewport = viewport;
      return true;
    }
  }

  /**
   * addDetection - Method that adds a given Detection object to the internal dataset (array of Detection objects).
   *
   * @param  {type} detection  Detection object to be added to the associated array of detections.
   * @param  {type} view  string value that indicates the viewport where the detection is rendered
   * @return {type} None
   */
  addDetection(detection, view) {
    let viewport = constants.viewport.TOP;
    if (view !== undefined) {
      viewport = view
    }
    this.data[viewport].push(detection);
  }

  setVisibility(visibility) {
    // TODO. To be implemented
  }

  setAlgorithmName(algorithm) {
    this.algorithm = algorithm;
  }

  selectAlgorithm(bool) {
    if (this.data.top !== undefined) {
      for (let i = 0; i < this.data.top.length; i++) {
        this.data.top[i].selected = bool;
      }
    }
    if (this.data.side !== undefined) {
      for (let i = 0; i < this.data.side.length; i++) {
        this.data.side[i].selected = bool;
      }
    }
  }

  /**
   * isValidated() - Returns true if all of the detections in all this set have been validated
   *
   * @return {type} boolean
   */
  isValidated() {
    let result = true;
    for (const [key, detectionList] of Object.entries(this.data)) {
      for (let i = 0; i < detectionList.length; i++){
        if (detectionList[i].isValidated() === false){
          result = false;
          break;
        }
      }
    }
    return result;
  }
}
