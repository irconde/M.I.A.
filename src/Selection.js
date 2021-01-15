import * as constants from './Constants';
/**
 * Class that provides information on the selected algorithm
 */
export default class Selection {

  constructor() {
    this.currentAlgorithm = constants.selection.NO_SELECTION;
    this.availableAlgorithms = [];
  }

  selectDetection(algorithm, detectionIndex, view) {
    if (view === constants.viewport.TOP) {
      this.availableAlgorithms[algorithm].data.top[detectionIndex].selected = true;
      this.availableAlgorithms[algorithm].selectedViewport = constants.viewport.TOP;
      this.availableAlgorithms[algorithm].selectedDetection = this.availableAlgorithms[algorithm].data.top[detectionIndex];
      this.availableAlgorithms[algorithm].selectedDetectionIndex = detectionIndex;
      return this.availableAlgorithms[algorithm].data.top[detectionIndex].selected;
    } else if (view === constants.viewport.SIDE) {
      this.availableAlgorithms[algorithm].data.side[detectionIndex].selected = true;
      this.availableAlgorithms[algorithm].selectedViewport = constants.viewport.SIDE;
      this.availableAlgorithms[algorithm].selectedDetection = this.availableAlgorithms[algorithm].data.side[detectionIndex];
      this.availableAlgorithms[algorithm].selectedDetectionIndex = detectionIndex;
      return this.availableAlgorithms[algorithm].data.side[detectionIndex].selected;
    }
  }

  getAlgorithmCount() {
    return this.availableAlgorithms.length;
  }

  addAlgorithm(algorithm) {
    if (this.availableAlgorithms.length === 0) this.currentAlgorithm = algorithm.algorithm;
    this.availableAlgorithms[algorithm.algorithm] = algorithm;
  }

  getAlgorithm() {   
    try {
      return this.availableAlgorithms[this.currentAlgorithm].algorithm;
    } catch (e) {
      return false;
    }
  }

  getAlgorithmForPos(index) {
    return this.availableAlgorithms[index];
  }

  set(currentAlgorithm) {
    this.currentAlgorithm = currentAlgorithm;
  }

  clear() {
    this.currentAlgorithm = "";
    this.availableAlgorithms = [];
  }

}
