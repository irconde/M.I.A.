import * as constants from './Constants';
import Detection from './Detection';

/**
 * Class that represents a set of detections returned by an object detection algorithm
 */
export default class DetectionSet {
    constructor() {
        this.algorithm = '';
        this.selected = false;
        this.selectedViewport = 0;
        this.selectedDetectionIndex = constants.selection.NO_SELECTION;
        this.selectedDetection = undefined;
        this.visible = true;
        this.data = {
            top: [],
            side: [],
        };
        this.lowerOpacity = false;
        this.numTopDetections = 0;
        this.numSideDetections = 0;
    }

    /**
     * getData - Method that provides the list of detections associated with a given view
     *
     * @param  {type} viewport  string value that indicates the viewport where the detections will be rendered
     * @return {type}           Array of Detection objects
     */
    getData(viewport) {
        return this.data[viewport];
    }

    /**
     * getDataFromSelectedDetection - Method that provides all the data regarding
     * a the currently selected detection
     *
     * @return {type}  Detection object
     */
    getDataFromSelectedDetection() {
        return this.selectedDetection;
    }

    /**
     * validateSelectedDetection - Method used to validate a currently selected
     * detection given the user feedback provided through the validation buttons
     *
     * @param  {type} feedback  boolean value that indicates whether the detection is right or wrong
     * @return {type}           None
     */
    validateSelectedDetection(feedback) {
        if (this.selectedDetection !== undefined) {
            this.selectedDetection.validate(feedback);
            this.clearSelection();
        }
    }

    /**
     * clearSelection - Method that resets selection. Deselects the currently selected detection
     *
     * @return {type}  None
     */
    clearSelection() {
        if (this.selectedDetection != undefined)
            this.selectedDetection.setSelected(false);
        this.selected = false;
        this.selectedViewport = undefined;
        this.selectedDetectionIndex = constants.selection.NO_SELECTION;
        this.selectedDetection = undefined;
        this.lowerOpacity = false;
    }

    /**
     * clearAll - Method that resets selection.
     *
     * @return {type}  None
     */
    clearAll() {
        this.selected = false;
        this.selectedViewport = undefined;
        this.selectedDetection = undefined;
        this.lowerOpacity = false;
        this.selectedDetectionIndex = constants.selection.NO_SELECTION;
        for (let [key, detectionList] of Object.entries(this.data)) {
            for (let detection of detectionList) {
                detection.setSelected(false);
                detection.updatingDetection = false;
            }
        }
    }

    /**
     * addDetection - Method that adds a given Detection object to the internal dataset (array of Detection objects).
     *
     * @param  {type} detection  Detection object to be added to the associated array of detections.
     * @param  {type} view  string value that indicates the viewport where the detection is rendered
     * @return {type} None
     */
    addDetection(detection, view) {
        let viewport = constants.viewport.TOP;
        if (view !== undefined) {
            viewport = view;
        }
        if (
            this.data[viewport] === undefined &&
            this.algorithm === constants.OPERATOR
        ) {
            this.data[viewport] = [];
        }
        this.data[viewport].push(detection);
        if (viewport === constants.viewport.TOP) {
            detection.detectionIndex = this.numTopDetections;
            this.numTopDetections = this.data[viewport].length;
        } else if (viewport === constants.viewport.SIDE) {
            detection.detectionIndex = this.numSideDetections;
            this.numSideDetections = this.data[viewport].length;
        }
    }

    /**
     * Delete detection from DetectionSet and update detection counts
     * @param {Detection} detection detection to be deleted
     * @returns {none} None
     */
    deleteDetection(detection) {
        const viewport = detection.view;
        const uuid = detection.uuid;

        const filterOut = this.data[viewport].filter((detec) => {
            detec.uuid !== uuid;
        });
        this.data[viewport] = filterOut;

        if (viewport === constants.viewport.TOP) {
            this.numTopDetections = this.data[viewport].length;
        } else {
            this.numSideDetections = this.data[viewport].length;
        }
    }

    /**
     * Determine if each view in a DetectionSet is empty of detections
     * @returns {Boolean} true if all views contain no detections, false otherwise
     *
     */
    isEmpty() {
        let result = true;
        const allData = this.data;
        Object.keys(allData).forEach((view) => {
            if (allData[view] && allData[view].length > 0) {
                // detections exist, the DetectionSet is not empty
                result = false;
            }
        });
        return result;
    }

    setVisibility(visibility) {
        // TODO. To be implemented
    }

    setAlgorithmName(algorithm) {
        this.algorithm = algorithm;
    }

    /**
     * setDetectionVisibility - Is a function that will turn all the visible parameter of its held
     *                          detections to the passed in boolean value.
     *
     * @param {Boolean} bool
     */
    setDetectionVisibility(bool) {
        if (this.data.top !== undefined) {
            for (let i = 0; i < this.data.top.length; i++) {
                this.data.top[i].visible = bool;
            }
        }
        if (this.data.side !== undefined) {
            for (let i = 0; i < this.data.side.length; i++) {
                this.data.side[i].visible = bool;
            }
        }
    }

    /**
     * selectAlgorithm - Is a function that will set all of it's held detection selected value
     *                   to the passed in boolean value.
     *
     * @param {Boolean} bool
     */
    selectAlgorithm(bool) {
        if (this.data.top !== undefined && this.data.top.length > 0) {
            for (let i = 0; i < this.data.top.length; i++) {
                this.data.top[i].selected = bool;
                this.data.top[i].updatingDetection = false;
            }
        }
        if (this.data.side !== undefined && this.data.top.length > 0) {
            for (let i = 0; i < this.data.side.length; i++) {
                this.data.side[i].selected = bool;
                this.data.top[i].updatingDetection = false;
            }
        }
        this.selectedDetection = undefined;
    }

    /**
     * isValidated() - Returns true if all of the detections in all this set have been validated
     *
     * @return {boolean} result
     */
    isValidated() {
        let result = true;
        for (const [key, detectionList] of Object.entries(this.data)) {
            for (let i = 0; i < detectionList.length; i++) {
                if (detectionList[i].isValidated() === false) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    }
}
