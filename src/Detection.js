/**
 * Class that represents a detected protential threat to be rendered
 */
export default class Detection {

  constructor(diagonalCoords, className, confidenceValue, isValidated) {
    this.boundingBox = diagonalCoords
    this.seletected = false;
    this.class = className;
    this.confidence = confidenceValue;
    this.validation = undefined;
  }

  setSelected(selected) {
    this.selected = selected;
  }

  isSelected() {
    return this.selected;
  }

  validate(feedback) {
    this.validation = feedback;
    this.selected = false;
  }

  isValidated() {
    return (this.validation !== undefined);
  }

  getValidation() {
    return this.validation;
  }

}
