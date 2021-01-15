import * as constants from './Constants';
/**
 * Class that provides information on the selected algorithm
 */
export default class Selection {

  constructor() {
    this.currentAlgorithm = constants.selection.NO_SELECTION;
    this.availableAlgorithms = [];
  }

  /**
   * selectDetection - Selects the detection from the available algorithms based on the passed in parameters.
   *
   * @param {String}  - Name of the Algorithm that contains the detection to be selected
   * @param {Number} - Index of the detection
   * @param {constants.viewport} - Constant string dictating if the detection is in the top or side view
   * @return {Boolean} -  Returns the selected detections selected value - true
   */
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

  /**
   * getAlgorithmCount - Returns the length of the available algorithms
   * @param {type} - None
   * @returns {Number} - Length of our available algorithms
   */
  getAlgorithmCount() {
    return this.availableAlgorithms.length;
  }

  /**
   * addAlgorithm - Adds the passed in algorithm into the available algorithms array at the index of the algorithm's name.
   *                We set the current algorithm to the first algorithm to be added.
   * 
   * @param {Detection} algorithm 
   */
  addAlgorithm(algorithm) {
    if (this.availableAlgorithms.length === 0) this.currentAlgorithm = algorithm.algorithm;
    this.availableAlgorithms[algorithm.algorithm] = algorithm;
  }

  /**
   * getAlgorithm - Returns the current algorithm name if it exists, otherwise returns false.
   */
  getAlgorithm() {   
    if (this.availableAlgorithms[this.currentAlgorithm] === undefined) {
      return false;
    } else {
      return this.availableAlgorithms[this.currentAlgorithm].algorithm;
    }
  }

  /**
   * setCurrentAlgorithm - Sets our place holder currentAlgorithm to the passed in string value.
   * 
   * @param {String} currentAlgorithm to be set
   */
  setCurrentAlgorithm(currentAlgorithm) {
    this.currentAlgorithm = currentAlgorithm;
  }
}
