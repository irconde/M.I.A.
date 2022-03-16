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
     * Public method called to record event data from a cornerstonetoolstouchstart event.
     * @param {Dictionary}  position the x and y position of the touch event, in a dictionary of the form {x:value, y:value}.
     * @param {Integer} time the time stamp of the event.
     */
    touchStart(position, time) {
        this.startPosition = position;
        this.startTime = time;
    }

    /**
     * Public method called to check if a cornerstonetoolstouchend event corresponds to a tap given the distance from and time since the last touch start event.
     *
     * @param {Dictionary}  endPosition the x and y position of the touch event, in a dictionary of the form {x:value, y:value}.
     * @param {Integer?} endTime  the time stamp of the event.
     * @returns {boolean} True if the touch event corresponds to a tap; false otherwise.
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
