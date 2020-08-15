
/**
 * Class that emcompases any secondary method to support the primary features of the client
 */
export default class Utils {

  /**
   * @static decimalToPercentage - Method that converts a decimal value into a percentage
   *
   * @param  {type} num Float value <= 1.0 with common decimal format
   * @return {type}     int value that represents the percentage value equivalent to the given input float value
   */
  static decimalToPercentage(num) {
    return Math.floor(num * 100);
  }

  /**
   * @static formatDetectionLabel - Method that creates a string to be used as
   * detection label, providing information regarding both the type of threat and the associated confidence level
   *
   * @param  {type} objectClass     string value that indicates the threat type
   * @param  {type} confidenceLevel int valye that indicates the confidence level in the form of a percentage
   * @return {type}                 resulting string to be used as detection label
   */
  static formatDetectionLabel(objectClass, confidenceLevel) {
    return objectClass + " · " + confidenceLevel + "%";
  }

  /**
   * @static getTextLabelSize - Method that provides the size of a label containing the given string
   *
   * @param  {type} context   2d canvas context
   * @param  {type} labelText string value to be displayed inside the label
   * @param  {type} padding   blank space surrounding the text within the label
   * @return {type}           dictionary with two components: width and height   
   */
  static getTextLabelSize(context, labelText, padding) {
    const textSize = context.measureText(labelText);
    // Aproximation to estimate the text height
    const lineHeight = context.measureText('M').width
    return {'width': textSize.width + 2 * padding, 'height': lineHeight + 2 * padding};
  }

}
