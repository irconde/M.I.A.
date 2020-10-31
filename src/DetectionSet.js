import Detection from "./Detection";
import * as constants from "./Constants";

/**
 * Class that represents a set of detections returned by an object detection algorithm
 */
export default class DetectionSet {

  constructor() {
    this.algorithm = "";
    this.visible = true;
    // TODO. Delete this
    this.detections = [];
    this.data = {};
    let viewport = constants.viewport.TOP;
    if (arguments.length > 0) {
      viewport = arguments[0];
    }
    if (!(viewport in this.data)) {
      this.data[viewport] = [];
    }
  }

  addDetection(detection, view) {
    let viewport = constants.viewport.TOP;
    if (view !== undefined) {
      viewport = view
    }
    this.data[viewport].push(detection);
    // TODO. Delete this
    this.detections.push(detection);
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

    // TODO. To be uncommented.
    /*
    for (const [key, detectionList] of Object.entries(this.data)) {
      for (let i = 0; i < detectionList.length; i++){
        if (detectionList[i].isValidated === false){
          result = false;
          break;
        }
      }
    }
    */
    for (let i = 0; i < this.detections.length; i++){
      if (this.detections[i].isValidated === false){
        result = false;
        break;
      }
    }
    return result;
  }
}
