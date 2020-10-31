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
    this.detectionIndex = detectionIndex;
  }

  clear() {
    this.detectionSetIndex = constants.selection.NO_SELECTION;
    this.detectionIndex = constants.selection.NO_SELECTION;
  }

}
