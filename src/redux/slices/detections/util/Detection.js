import * as constants from '../../../../Constants';
import Utils from '../../../../Utils';
import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid';
import './typedef';

export default class DetectionUtil {
    /*
     * Utility functions for the `Detection` object.
     * Replaces Detection class in order to conform with Redux data requirements.
     */

    /**
     * Constructor function to create Detection object
     * @param {object} params
     * @param {Array<number>} params.boundingBox boundingBox xy coordinates of detection in format [x0, y0, x1, y1]
     * @param {?Array<Array<number>>} params.maskBitmap 2D array of bitmap data
     * @param {boolean} params.selected is detection selected by user
     * @param {boolean} params.visible is detection visible on screen
     * @param {string} params.className description of detection object
     * @param {number} params.confidence confidence of algorithm in identifying an object
     * @param {?boolean} params.validation has user finished validating detection
     * @param {boolean} params.isValidated has detection been validated by user
     * @param {string} params.algorithm name of algorithm used
     * @param {string} params.view the angle of the photo (ex. 'side', 'top')
     * @param {boolean} params.updatingDetection is detection being modified by the user
     * @returns {Detection} Detection object
     */
    static createDetection({
        boundingBox,
        maskBitmap = null,
        selected = false,
        visible = true,
        className,
        confidence,
        validation = null,
        isValidated,
        algorithm,
        view,
        updatingDetection = false,
    }) {
        const defaultDetectionIndex = -1;
        const color = randomColor({
            seed: className,
            hue: 'random',
            luminosity: 'bright',
        });
        return {
            boundingBox: boundingBox,
            maskBitmap: maskBitmap,
            selected: selected,
            visible: visible,
            class: className,
            confidence: confidence,
            validation: validation,
            algorithm: algorithm,
            view: view,
            color: color,
            uuid: uuidv4(),
            updatingDetection: updatingDetection,
            detectionIndex: defaultDetectionIndex,
        };
    }

    /**
     * Get color to render detection's bounding box
     * @param {Detection} detection
     * @returns {string} color in hex format
     */
    static getRenderColor(detection) {
        if (detection.selected) return constants.detectionStyle.SELECTED_COLOR;
        if (detection.validation !== null) {
            if (detection.validation) {
                return constants.detectionStyle.VALID_COLOR;
            }
            return constants.detectionStyle.INVALID_COLOR;
        }

        return detection.color;
    }

    /**
     * Validate a detection with user's feedback
     * @param {Detection} detection current detection object
     * @param {boolean} feedback is detection right or wrong
     * @return {Detection} new Detection object
     */
    static validate(detection, feedback) {
        return {
            ...detection,
            feedback: feedback,
            selected: false,
        };
    }

    /**
     * Mark a detection as selected by the user
     * @param {Detection} detection detection to be selected
     * @returns {Detection} updated Detection
     */
    static selectDetection(detection) {
        const updatedDetection = detection;
        updatedDetection.selected = true;
        updatedDetection.updatingDetection = true;

        return updatedDetection;
    }

    /**
     * Update a Detection's label
     * @param {Detection} detection
     * @param {string} newLabel
     * @returns {Detection} updated Detection
     */
    static updateDetectionLabel(detection, newLabel) {
        const updatedDetection = detection;
        detection.class = newLabel;
        detection.color = Utils.getRandomColor(newLabel);

        return updatedDetection;
    }

    /**
     * Update a Detection with an arbitrary number of properties.
     * Used for updating other Detection properties not covered in other methods.
     * @param {Detection} detection
     * @param {object} key-value pairs of properties to update. Will not add new properties.
     * @returns {?Detection} Detection if updated, null otherwise
     */
    static updateDetection(detection, props) {
        const updatedDetection = detection;
        let isUpdated = false;

        for (const key in props) {
            if (Object.prototype.hasOwnProperty.call(updatedDetection, key)) {
                if (!isUpdated) isUpdated = true;
                updatedDetection[key] = props[key];
            }
        }

        // Only return the Detection if it was updated
        if (isUpdated) {
            return updatedDetection;
        }

        // Props provided did not exist on Detection.
        // Handle error by checking for null return
        return null;
    }

    /**
     * Check if a Detection's properties have changed.
     * Useful for comparing properties before dispatching a Redux action
     * @param {Detection} detection
     * @param {object} props properties and values to check on the Detection
     * @returns {boolean} true if a Detection's property values are different than the supplied properties
     */
    static hasDetectionChanged(detection, props) {
        let hasChanged = false;

        for (const key in props) {
            // Only compare properties that actually exist on the Detection
            if (Object.prototype.hasOwnProperty.call(detection, key)) {
                // Special case for array compariso
                // Since everything in JS is an object, regular equality check does not work here
                if (Array.isArray(props[key])) {
                    // First, check lengths of array
                    if (props[key].length !== detection[key].length)
                        hasChanged = true;
                    // Lengths are the same, now check each value
                    else if (
                        !detection[key].every((val, i) => val === props[key][i])
                    ) {
                        hasChanged = true;
                    }
                } else if (detection[key] !== props[key]) hasChanged = true;
            }
        }

        return hasChanged;
    }
}
