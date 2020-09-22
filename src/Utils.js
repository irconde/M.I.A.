import JSZip from "jszip";

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


  /**
   * @static pointInRect - Method that indicates whether a given point is inside a rectangle or not
   *
   * @param  {type} point 2D point with two coordinates, x and y
   * @param  {type} rect  rectangle defined as a floar array of size 4. Includes the coordinates of the two end-points of the rectangle diagonal
   * @return {type}       boolean value: true if teh point is inside the rectangle; false otherwise
   */
  static pointInRect(point, rect) {
    return point.x >= rect[0] && point.x <= rect[2] && point.y >= rect[1] && point.y <= rect[3];
  }

  /**
   * b64toBlob - Converts binary64 encoding to a blob to display
   *
   * @param  {type} b64Data Binary string
   * @param  {type} contentType The MIMI type, image/dcs
   * @return {type}               blob
   */
  static b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  };

  /**
   * base64ToArrayBuffer - Converts the base 64 to an arraybuffer
   *
   * @param {type} base64 Binary 64 string to convert to ArrayBuffer
   * @return {type} ArrayBuffer
   */
  static base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * base64ToOpenRaster - Takes in a base64 encoded string and returns an object
   *                      that contains the OpenRaster data.
   * 
   * @param {type} base64 - What string we are converting
   * 
   * @returns {type} object
   */
  static base64ToOpenRaster(base64){
    const myZip = new JSZip();
    const dataPathRegExp = /^data{1,}\//;
    const myOra = {
      layers: []
    }
    myZip.loadAsync(base64, { base64: true }).then((res) => {
      res.forEach((path, file) => {
        if (this.validateRegExp(path, dataPathRegExp)){
          myZip.file(path).async("uint8array").then((res) => {
            myOra.layers.push(new Blob(res, { type: 'image/dcs' }));
          })  
        }
      })
      console.log(myOra);
    });   
  }

  /**
   * validateRegExp - Takes in the string(path) we are going to test the regular expression(regExp) with
   * 
   * @param {type} path - What we are testing on
   * @param {type} regExp - The regular expression
   * 
   * @return {type} true/false
   */
  static validateRegExp(path, regExp){
    if(regExp.test(path)){
      return true;
    } else {
      return false;
    }
  }

}
