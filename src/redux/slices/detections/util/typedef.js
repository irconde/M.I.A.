// JSDoc type annotations to provide class-like Intellisense for the plain objects

/**
 * @typedef {object} Detection
 * @property {Array<number>} boundingBox boundingBox xy coordinates of detection in format [x0, y0, x1, y1]
 * @property {Array<Array<number>>} maskBitmap 2D array of bitmap data
 * @property {boolean} selected is detection selected by user
 * @property {boolean} visible is detection visible on screen
 * @property {string} class description of detection object
 * @property {number} confidence confidence of algorithm in identifying an object
 * @property {boolean | undefined} validation has user finished validating detection
 * @property {boolean} isValidated has detection been validated by user
 * @property {string} algorithm name of algorithm used
 * @property {string} view the angle of the photo (ex. 'side', 'top')
 * @property {string} color hex color of detection's bounding box
 * @property {string} uuid unique identifier
 * @property {boolean} updatingDetection is detection being modified by the user
 * @property {number} detectionIndex index of detection in the containing DetectionSet data array
 */

/**
 * @typedef {object} DetectionSet
 * @property {string} algorithm name of algorithm used
 * @property {boolean} selected detection selected by user, or set selected by user from sidebar
 * @property {string | undefined} selectedViewport if selected, which viewport the detection resides in
 * @property {number} selectedDetectionIndex index of selected detection
 * @property {Detection | undefined} selectedDetection the detection selected by the user
 * @property {boolean} visible is detection set visible on screen
 * @property {object} data Object of arrays of detections by viewport
 * @property {boolean} lowerOpacity true when a detection in another detection set is selected
 * @property {number} numTopDetections length of `data.top`
 * @property {number} numSideDetections length of `data.side`
 */
