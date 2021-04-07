import * as constants from '../../../../Constants';
import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid';
import './typedef';

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
export function createDetection({
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
export function getRenderColor(detection) {
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
export function validate(detection, feedback) {
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
export function selectDetection(detection) {
    const updatedDetection = detection;
    updatedDetection.selected = true;

    return updatedDetection;
}
