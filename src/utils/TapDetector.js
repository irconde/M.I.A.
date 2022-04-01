/**
 * Class implementing functionality to distinguish taps from other types of touch inputs.
 */
import Utils from './Utils';

const maximumTapDistance = 2.0; // Distance in pixels
const maximumTapTime = 250; // Time in milliseconds

export default class TapDetector {
    constructor() {
        this.startPosition = { x: 0, y: 0 };
        this.startTime = 0;
    }

    /**
     * Records data from a cornerstonetoolstouchstart event.
     * @param {{x:integer, y:integer}} position - Touch event location
     * @param {integer} time - Touch event time stamp
     */
    touchStart(position, time) {
        this.startPosition = position;
        this.startTime = time;
    }

    /**
     * Checks whether a cornerstonetoolstouchend event corresponds to a tap event based on the distance from and time since the last touch start event.
     *
     * @param {{x:integer, y:integer}} endPosition - Touch event location
     * @param {integer} endTime - Touch event time stamp
     * @returns {boolean} - True if the touch event corresponds to a tap; false otherwise.
     */
    checkTouchEnd(endPosition, endTime) {
        let distance = Utils.getDistanceBetween(
            this.startPosition,
            endPosition
        );
        let deltaTime = endTime - this.startTime;

        return distance <= maximumTapDistance && deltaTime <= maximumTapTime;
    }
}
