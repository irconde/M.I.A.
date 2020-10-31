import * as constants from "./Constants";

/**
 * Class that represents a set of detections returned by an object detection algorithm
 */
export default class DetectionSet {

  constructor() {
    this.algorithm = "";
    this.selected = false;
    this.viewportSelected = undefined;
    this.detectionSelected = constants.selection.NO_SELECTION;
    this.visible = true;
    this.data = {};
    let viewport = constants.viewport.TOP;
    if (arguments.length > 0) {
      viewport = arguments[0];
    }
    if (!(viewport in this.data)) {
      this.data[viewport] = [];
    }
  }

  getData(viewport) {
    if (viewport !== undefined) {
      return this.data[viewport];
    }
    return this.data[constants.viewport.TOP];
  }

  getDataFromSelectedDetection() {
    let view = this.viewportSelected;
    if (this.viewportSelected === undefined) {
      view = constants.viewport.TOP;
    }
    if (this.detectionSelected !== constants.selection.NO_SELECTION) {
      return this.data[view][this.detectionSelected];
    } else {
      return undefined;
    }
  }

  validateSelectedDetection(feedback) {
    let view = this.viewportSelected;
    if (this.viewportSelected === undefined) {
      view = constants.viewport.TOP;
    }
    this.data[view][this.detectionSelected].validate(feedback);
    this.clearSelection();
  }

  clearSelection() {
    if (this.detectionSelected !== constants.selection.NO_SELECTION) {
      this.getData(this.viewportSelected)[this.detectionSelected].setSelected(false);
    }
    this.viewportSelected = undefined;
    this.detectionSelected = constants.selection.NO_SELECTION;
  }

  selectDetection(detectionIndex, viewport){
    let view = constants.viewport.TOP;
    if (viewport !== undefined) {
      view = viewport;
    }
    if (this.detectionSelected !== constants.selection.NO_SELECTION) {
      this.data[view][this.detectionSelected].setSelected(false);
    }
    if (this.viewportSelected === viewport  && this.detectionSelected === detectionIndex) {
      this.viewportSelected = undefined;
      this.detectionSelected = constants.selection.NO_SELECTION;
      return false;
    } else {
      this.data[view][detectionIndex].setSelected(true);
      this.detectionSelected = detectionIndex;
      this.viewportSelected = viewport;
      return true;
    }
  }

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

  /**
   * isValidated() - Returns true if all of the detections in all this set have been validated
   *
   * @return {type}  None
   * @returns {type} boolean
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
