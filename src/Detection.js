/**
 * Class that emcompases any secondary method to support the primary features of the client
 */
export default class Detection {
  constructor() {
    this.height = 0;
    this.width = 0;
    this.x = 0;
    this.y = 0;
    this.seletected = false;
    this.class = "";
    this.confidence = 0;
  }
}
