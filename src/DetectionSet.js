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

}
