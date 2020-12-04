import * as constants from "./Constants";
var randomColor = require("randomcolor");

/**
 * Class that represents a detected protential threat to be rendered
 */
export default class Detection {

  constructor(diagonalCoords, className, confidenceValue, isValidated) {
    this.boundingBox = diagonalCoords
    this.selected = false;
    this.visible = true;
    this.class = className;
    this.confidence = confidenceValue;
    this.validation = undefined;
    this.color = randomColor({seed: className});
  }

  /**
   * getRenderColor - Method that provides the color to be used to render the detection
   *
   * @return {type}  string value that represents the detection's color in hexadecimal format
   */
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


  /**
   * validate - Method used to validate a detection given the user feedback provided through the validation buttons
   *
   * @param  {type} feedback  boolean value that indicates whether the detection is right or wrong.
   * @return {type}           None
   */
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

  setVisibility(visibility) {
    // TODO. To be implemented
  }

}
