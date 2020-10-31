import * as constants from './Constants';
/**
 * Class that provides information on the selected detection
 */
export default class Selection {

  constructor() {
    this.detectionSetIndex = constants.selection.NO_SELECTION;
    this.detectionIndex = constants.selection.NO_SELECTION;
    this.availableAlgorithms = [];
  }

  addAlgorithm(algorithm) {
    this.availableAlgorithms.push(algorithm);
  }

  getAlgorithm() {
    return this.availableAlgorithms[this.detectionSetIndex];
  }

  set(detectionSetIndex, detectionIndex) {
    this.detectionSetIndex = detectionSetIndex;
    if (detectionIndex !== undefined) {
      this.detectionIndex = detectionIndex;
    } else {
      this.detectionIndex = constants.selection.NO_SELECTION;
    }
  }

  clearDetection() {
    this.detectionIndex = constants.selection.NO_SELECTION;
  }

  setDetection(index) {
    this.detectionIndex = index;
  }

  clear() {
    this.detectionSetIndex = constants.selection.FIRST_ELEMENT;
    this.detectionIndex = constants.selection.NO_SELECTION;
  }

}
