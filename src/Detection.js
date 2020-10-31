import * as constants from "./Constants";
/**
 * Class that represents a detected protential threat to be rendered
 */
export default class Detection {

  constructor(diagonalCoords, className, confidenceValue, isValidated) {
    this.boundingBox = diagonalCoords
    this.selected = false;
    this.class = className;
    this.confidence = confidenceValue;
    this.validation = undefined;
    this.color = constants.detectionStyle.NORMAL_COLOR;
  }

  getRenderColor() {
    if (this.selected) return constants.detectionStyle.SELECTED_COLOR;
    if (this.validation !== undefined) {
      if (this.validation === true){
        return constants.detectionStyle.VALID_COLOR;
      }
      return constants.detectionStyle.INVALID_COLOR;
    }
    return this.color;
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
