import * as constants from '../../../../Constants';
import './typedef';
import cloneDeep from 'lodash.clonedeep';
import DetectionUtil from './Detection';

/*
 * Utility functions for the `DetectionSet` object
 * Replaces DetectionSet class in order to conform with Redux
 * data requirements.
 * In most cases, the 'translations' of the old class methods now require the detectionSet
 * that is being operated on as a parameter and return a new detectionSet.
 * The `cloneDeep` package is used to make a deep copy, since JS uses shallow copies by default.
 */

export default class DetectionSetUtil {
    /**
     * Constructor function to create DetectionSet object
     * @param {object} params object of initial/default props
     * @param {string} algorithm algorithm name
     * @param {boolean} selected whether the detection set has a detection that is selected
     * @param {string | null} selectedViewport if a detection is selected, which viewport it is in
     * @param {Detection | null} selectedDetection selected detection, if it exists
     * @param {boolean} visible whether the detection set is visible on screen
     * @param {object} data object of arrays of detection data by viewport
     * @param {boolean} lowerOpacity lower opacity when other detection set is selected
     * @param {number} numTopDetections length of `data.top` array
     * @param {number} numSideDetections length of `data.side` array
     * @returns {DetectionSet} new DetectionSet object
     */
    static createDetectionSet({
        algorithm,
        selected = false,
        selectedViewport = null,
        selectedDetectionIndex = constants.selection.NO_SELECTION,
        selectedDetection = null,
        visible = true,
        data = {
            top: [],
            side: [],
        },
        lowerOpacity = false,
        numTopDetections = 0,
        numSideDetections = 0,
    }) {
        return {
            algorithm,
            selected,
            selectedViewport,
            selectedDetectionIndex,
            selectedDetection,
            visible,
            data,
            lowerOpacity,
            numTopDetections,
            numSideDetections,
        };
    }
    /**
     * Validate a currently selected detection from user feedback
     * @param {DetectionSet} initial DetectionSet
     * @param {boolean} feedback user feedback indicating if detection is correct
     * @returns {DetectionSet} updated DetectionSet
     */
    static validateSelectedDetection(detectionSet, feedback) {
        if (detectionSet.selectedDetection !== null) {
            const updatedDetectionSet = cloneDeep(detectionSet);
            updatedDetectionSet.feedback = feedback;

            const reset = this.clearSelection(updatedDetectionSet);
            return reset;
        }
    }

    /**
     * De-selects current selectedDetection
     * @param {DetectionSet} detectionSet current DetectionSet
     * @returns {DetectionSet} updated DetectionSet
     */
    static clearSelection(detectionSet) {
        if (detectionSet.selectedDetection !== null) {
            const updatedDetectionSet = cloneDeep(detectionSet);
            updatedDetectionSet.selected = false;
            updatedDetectionSet.selectedViewport = null;
            updatedDetectionSet.selectedDetectionIndex =
                constants.selection.NO_SELECTION;
            updatedDetectionSet.selectedDetection = null;
            updatedDetectionSet.lowerOpacity = false;
            return updatedDetectionSet;
        }
    }

    /**
     * Resets all selection-related properties on set and each Detection
     * @param {DetectionSet} detectionSet
     * @returns {DetectionSet} updated DetectionSet
     */
    static clearAll(detectionSet) {
        // Clear DetectionSet-level selection data
        const updatedDetectionSet = cloneDeep(detectionSet);
        updatedDetectionSet.selected = false;
        updatedDetectionSet.selectedDetection = null;
        updatedDetectionSet.lowerOpacity = false;
        updatedDetectionSet.selectedDetectionIndex =
            constants.selection.NO_SELECTION;

        // Clear Detection-level selection data for each view
        const updatedData = Object.entries(updatedDetectionSet.data).map(
            ([view, data]) => {
                const newView = {};
                newView[view] = data.map((detection) => {
                    return {
                        ...detection,
                        selected: false,
                        updatingDetection: false,
                    };
                });

                return newView;
            }
        );

        // Merge each view's data back in
        updatedData.forEach((view) => {
            const vw = Object.keys(view)[0];
            updatedDetectionSet.data[vw] = view[vw];
        });

        return updatedDetectionSet;
    }

    /**
     * Adds a new detection to a detectionSet
     * @param {DetectionSet} detectionSet existing detectionSet
     * @param {Detection} detection new detection to be added
     * @returns {DetectionSet} updated detectionSet
     */
    static addDetectionToSet(detectionSet, detection) {
        const viewport = detection.view;
        const algo = detection.algorithm;
        const updatedDetectionSet = cloneDeep(detectionSet);

        // Initialize `OPERATOR` view for user-added detections
        if (
            !updatedDetectionSet.data[viewport] &&
            algo === constants.OPERATOR
        ) {
            updatedDetectionSet.data[viewport] = [];
        }
        // Add detection to its view's data array
        updatedDetectionSet.data[viewport] = [
            ...updatedDetectionSet.data[viewport],
            detection,
        ];

        // Update detection counts for each view
        if (viewport === constants.viewport.TOP) {
            updatedDetectionSet.numTopDetections =
                updatedDetectionSet.data[viewport].length;
        } else {
            updatedDetectionSet.numSideDetections =
                updatedDetectionSet.data[viewport].length;
        }

        return updatedDetectionSet;
    }

    /**
     * Delete detection from detectionSet and update detection counts
     * @param {DetectionSet} detectionSet detectionSet that contains detection
     * @param {string} view view where Detection is rendered
     * @param {string} uuid identifier for Detection
     * @returns {DetectionSet} updated DetectionSet
     */
    static deleteDetectionFromSet(detectionSet, view, uuid) {
        const updatedDetectionSet = cloneDeep(detectionSet);

        // Remove detection by filtering by its uuid
        const filterOut = updatedDetectionSet.data[view].filter((detec) => {
            detec.uuid !== uuid;
        });
        updatedDetectionSet.data[view] = filterOut;

        // Update detection counts
        if (view === constants.viewport.TOP) {
            updatedDetectionSet.numTopDetections =
                updatedDetectionSet.data[view].length;
        } else {
            updatedDetectionSet.numSideDetections =
                updatedDetectionSet.data[view].length;
        }

        return updatedDetectionSet;
    }

    /**
     * Determine if each view in a DetectionSet is empty of detections
     * @returns {boolean} true if all views contain no detections, false otherwise
     */
    static isEmpty(detectionSet) {
        let result = true;
        const allData = detectionSet.data;
        Object.keys(allData).forEach((view) => {
            if (allData[view] && allData[view].length > 0) {
                // detections exist, the DetectionSet is not empty
                result = false;
            }
        });
        return result;
    }

    /**
     * Determine if all detections in a DetectionSet have been validated
     * @param {DetectionSet} detectionSet DetectionSet to query
     * @returns {boolean} true if all detections have been validated, false otherwise
     */
    static isValidated(detectionSet) {
        let result = true;

        Object.values(detectionSet.data).forEach((view) => {
            view.forEach((detection) => {
                if (!detection.validation) {
                    result = false;
                }
            });
        });

        return result;
    }

    /**
     * Mark a detection in a set as selected by the user
     * @param {DetectionSet} detectionSet detectionSet that contains the selected detection
     * @param {string} view viewport where detection is rendered
     * @param {string} uuid unique identifier of detection
     * @returns {?DetectionSet} updated DetectionSet, or null in case of error
     */
    static selectDetectionInSet(detectionSet, view, uuid) {
        const copy = cloneDeep(detectionSet);
        const updatedDetectionSet = this.clearAll(copy);
        const updatedDetectionIndex = updatedDetectionSet.data[view].findIndex(
            (detection) => detection.uuid === uuid
        );

        // View, uuid are valid and detection exists
        if (updatedDetectionIndex !== -1) {
            const selectedDetection = DetectionUtil.selectDetection(
                updatedDetectionSet.data[view][updatedDetectionIndex]
            );
            updatedDetectionSet.selectedViewport = selectedDetection.view;
            updatedDetectionSet.selectedDetectionIndex = updatedDetectionIndex;
            updatedDetectionSet.selectedDetection = selectedDetection;
            updatedDetectionSet.data[view][
                updatedDetectionIndex
            ] = selectedDetection;

            return updatedDetectionSet;
        }

        // There was an invalid parameter, no detection found
        return null;
    }

    /**
     * Mark a DetectionSet as selected by the user.
     * Marks all detections in set as selected as well.
     * @param {DetectionSet} detectionSet
     * @returns {DetectionSet} updated DetectionSet
     */
    static selectDetectionSet(detectionSet) {
        const updatedDetectionSet = cloneDeep(detectionSet);
        updatedDetectionSet.selected = true;

        for (const detectionList of Object.values(updatedDetectionSet.data)) {
            detectionList.forEach((detection) => {
                detection = DetectionUtil.selectDetection(detection);
            });
        }
        return updatedDetectionSet;
    }

    /**
     * Gets all unique class names from a DetectionSet
     * @param {DetectionSet} detectionSet to query
     * @returns {Array<string>} array of unique class names
     */
    static getClassNames(detectionSet) {
        let classNames = [];
        for (const detectionList of Object.values(detectionSet.data)) {
            detectionList.forEach((detection) => {
                if (
                    !classNames.find(
                        (existingClass) => existingClass === detection.class
                    )
                ) {
                    classNames.push(detection.class);
                }
            });
        }

        return classNames;
    }

    /**
     * Sets all non-selected Detections in a DetectionSet as secondary for rendering the boundingBoxes
     * @param {DetectionSet} detectionSet
     * @returns {DetectionSet} Updated DetectionSet
     */
    static setLowerOpacity(detectionSet) {
        const updatedDetectionSet = cloneDeep(detectionSet);
        const selectedDetectionUuid = updatedDetectionSet.selectedDetection
            ? updatedDetectionSet.selectedDetection.uuid
            : null;
        updatedDetectionSet.lowerOpacity = true;
        for (const detectionList of Object.values(detectionSet.data)) {
            detectionList.forEach((detection) => {
                if (detection.uuid !== selectedDetectionUuid) {
                    detection.lowerOpacity = true;
                }
            });
        }

        return updatedDetectionSet;
    }

    /**
     * Update the label for a Detection in a DetectionSet
     * @param {DetectionSet} detectionSet
     * @param {string} uuid uuid for Detection to update
     * @param {string} view viewport where Detection is rendered
     * @param {string} newLabel
     * @returns {DetectionSet} updated DetectionSet
     */
    static updateDetectionLabelInSet(detectionSet, uuid, view, newLabel) {
        const updatedDetectionSet = cloneDeep(detectionSet);

        const ind = updatedDetectionSet.data[view].findIndex(
            (detection) => detection.uuid === uuid
        );

        if (ind !== -1) {
            const updatedDetection = DetectionUtil.updateDetectionLabel(
                updatedDetectionSet.data[view][ind],
                newLabel
            );
            updatedDetectionSet.data[view][ind] = updatedDetection;
            return updatedDetectionSet;
        }
    }

    /**
     * Mark all Detections in DetectionSet as validated
     * @param {DetectionSet} detectionSet
     * @returns {DetectionSet} detectionSet
     */
    static validateAllDetections(detectionSet) {
        const updatedDetectionSet = cloneDeep(detectionSet);
        for (const detectionList of Object.values(updatedDetectionSet.data)) {
            detectionList.forEach((detection) => {
                detection = DetectionUtil.updateDetection(detection, {
                    validation: true,
                });
            });
        }
        return updatedDetectionSet;
    }

    /**
     * Modify a DetectionSet in a way not covered by other Util methods
     * @param {DetectionSet} detectionSet
     * @param {object} props key/value pairs to update on DetectionSet
     * @returns {?DetectionSet} updated DetectionSet or null if any properties in `props` object did not exist on DetectionSet
     */
    static updateDetectionSet(detectionSet, props) {
        let allPropsExist = true;
        const updatedDetectionSet = cloneDeep(detectionSet);

        // Loop over props and update DetectionSet if key exists
        for (const key in props) {
            if (
                Object.prototype.hasOwnProperty.call(updatedDetectionSet, key)
            ) {
                updatedDetectionSet[key] = props[key];
            } else {
                allPropsExist = false;
            }
        }

        if (allPropsExist) {
            return updatedDetectionSet;
        }

        // At least one property in props did not exist on the DetectionSet
        return null;
    }
}
