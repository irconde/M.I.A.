/**
 * Class that provides information on the selected detection
 */
export default class Selection {

  static get NO_SELECTION() { return -1; }

  constructor() {
    this.detectionSetIndex = Selection.NO_SELECTION;
    this.detectionIndex = Selection.NO_SELECTION;
  }

  set(detectionSetIndex, detectionIndex) {
    this.detectionSetIndex = detectionSetIndex;
    this.detectionIndex = detectionIndex;
  }

  clear() {
    this.detectionSetIndex = Selection.NO_SELECTION;
    this.detectionIndex = Selection.NO_SELECTION;
  }

}
