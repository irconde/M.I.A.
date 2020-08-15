/**
 * Class that represents a detected protential threat to be rendered
 */
export default class Detection {
  constructor(diagonalCoords, className, confidenceValue) {
    this.boundingBox = diagonalCoords
    this.seletected = false;
    this.class = className;
    this.confidence = confidenceValue;
  }
}
