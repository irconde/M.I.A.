import Detection from "./Detection.js";

/**
 * Class that represents a set of detections returned by an object detection algorithm
 */
export default class DetectionSet {

  constructor() {
    this.algorithm = "";
    this.visible = true;
    this.detections = [];
  }

  addDetection(detection) {
    this.detections.push(detection);
  }

  setVisibility(visibility) {
    this.visible = visibility;
  }

  setAlgorithmName(algorithm) {
    this.algorithm = algorithm;
  }

  /**
   * isDetectionsValidated() - Returns true if all of the detections in all this set have been validated
   * 
   * @return {type}  None
   * @returns {type} boolean
   */
  isDetectionsValidated(){
    let result = true;
    for (let i = 0; i < this.detections.length; i++){
      if (this.detections[i].isValidated === false){
        result = false;
        break;
      }
    }
    return result;
  }
}
