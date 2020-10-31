import * as constants from './Constants';
/**
 * Class that provides information on the selected detection
 */
export default class Selection {

  constructor() {
    this.detectionSetIndex = constants.selection.NO_SELECTION;
    this.availableAlgorithms = [];
  }

  getAlgorithmCount() {
    return this.availableAlgorithms.length;
  }

  addAlgorithm(algorithm) {
    this.availableAlgorithms.push(algorithm);
  }

  getAlgorithm() {
    return this.availableAlgorithms[this.detectionSetIndex];
  }

  getAlgorithmForPos(index) {
    return this.availableAlgorithms[index];
  }

  set(detectionSetIndex) {
    this.detectionSetIndex = detectionSetIndex;
  }

  clear() {
    this.detectionSetIndex = constants.selection.FIRST_ELEMENT;
  }

}
