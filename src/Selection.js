import * as constants from './Constants';
/**
 * Class that provides information on the selected algorithm
 */
export default class Selection {
    constructor() {
        this.currentAlgorithm = constants.selection.NO_SELECTION;
        this.availableAlgorithms = [];
        this.algorithmNames = [];
    }

    /**
     * selectDetection - Selects the detection from the available algorithms based on the passed in parameters.
     *
     * @param {String}  - Name of the Algorithm that contains the detection to be selected
     * @param {Number} - Index of the detection
     * @param {constants.viewport} - Constant string dictating if the detection is in the top or side view
     * @return {Boolean} -  Returns the selected detections selected value - true
     */
    selectDetection(algorithm, detectionIndex, view) {
        if (view === constants.viewport.TOP) {
            this.availableAlgorithms[algorithm].data.top[
                detectionIndex
            ].selected = true;
            this.availableAlgorithms[algorithm].selectedViewport =
                constants.viewport.TOP;
            this.availableAlgorithms[
                algorithm
            ].selectedDetection = this.availableAlgorithms[algorithm].data.top[
                detectionIndex
            ];
            this.availableAlgorithms[
                algorithm
            ].selectedDetectionIndex = detectionIndex;
            this.currentAlgorithm = this.algorithmNames.findIndex((alg) => {
                return (alg.algorithm = algorithm);
            });
            return this.availableAlgorithms[algorithm].data.top[detectionIndex]
                .selected;
        } else if (view === constants.viewport.SIDE) {
            this.availableAlgorithms[algorithm].data.side[
                detectionIndex
            ].selected = true;
            this.availableAlgorithms[algorithm].selectedViewport =
                constants.viewport.SIDE;
            this.availableAlgorithms[
                algorithm
            ].selectedDetection = this.availableAlgorithms[algorithm].data.side[
                detectionIndex
            ];
            this.availableAlgorithms[
                algorithm
            ].selectedDetectionIndex = detectionIndex;
            this.currentAlgorithm = this.algorithmNames.findIndex((alg) => {
                return (alg.algorithm = algorithm);
            });
            return this.availableAlgorithms[algorithm].data.side[detectionIndex]
                .selected;
        }
    }

    /**
     * getAlgorithmCount - Returns the length of the available algorithms
     * @param {type} - None
     * @returns {Number} - Length of our available algorithms
     */
    getAlgorithmCount() {
        return this.algorithmNames.length;
    }

    /**
     * addAlgorithm - Adds the passed in algorithm into the available algorithms array at the index of the algorithm's name.
     *                We set the current algorithm to the first algorithm to be added.
     *
     * @param {Detection} algorithm
     */
    addAlgorithm(algorithm) {
        this.availableAlgorithms[algorithm.algorithm] = algorithm;
        this.algorithmNames.push({
            algorithm: algorithm.algorithm,
        });
        this.currentAlgorithm = this.algorithmNames.length - 1;
    }

    /**
     * selectPriorAlgorithm - Is a function that will set our index to the prior algorithm if we are not
     *                        already at the start. It will return true if we moved a position and false
     *                        if we are at the start and therefore can go no further.
     * @param {type} none
     * @returns {Boolean} Our boolean value indicating if we moved a position our not.
     */
    selectPriorAlgorithm() {
        if (this.currentAlgorithm > 0) {
            this.currentAlgorithm--;
            return true;
        } else {
            return false;
        }
    }

    /**
     * selectNextAlgorithm - Is a function that will set our index to the next algorithm if we are not
     *                        already at the end. It will return true if we moved a position and false
     *                        if we are at the end and therefore can go no further.
     * @param {type} none
     * @returns {Boolean} Our boolean value indicating if we moved a position our not.
     */
    selectNextAlgorithm() {
        if (this.currentAlgorithm < this.algorithmNames.length - 1) {
            this.currentAlgorithm++;
            return true;
        } else {
            return false;
        }
    }

    /**
     * resetAlgorithmPositionToEnd - Function that will set our current position to the highest index in our
     *                               algorithmNames variable.
     *
     * @param {type} none
     * @returns {null} null
     */
    resetAlgorithmPositionToEnd() {
        this.currentAlgorithm = this.algorithmNames.length - 1;
    }

    /**
     * resetAlgorithmPositionToStart - Function that will set our current position to 0 or the beginning of our
     *                                 available algorithms.
     *
     * @param {type} none
     * @returns {null} null
     */
    resetAlgorithmPositionToStart() {
        this.currentAlgorithm = 0;
    }

    /**
     * getAlgorithm - Returns the current algorithm name if it exists, otherwise returns false.
     *
     * @param {type} None
     * @returns {Boolean || String}
     */
    getAlgorithm() {
        if (this.currentAlgorithm === -1) return;
        if (
            this.availableAlgorithms[
                this.algorithmNames[this.currentAlgorithm].algorithm
            ] === undefined
        ) {
            return false;
        } else {
            return this.availableAlgorithms[
                this.algorithmNames[this.currentAlgorithm].algorithm
            ].algorithm;
        }
    }

    /**
     * setCurrentAlgorithm - Sets our place holder currentAlgorithm to the passed in string value.
     *
     * @param {String} currentAlgorithm to be set
     */
    setCurrentAlgorithm(currentAlgorithm) {
        this.currentAlgorithm = currentAlgorithm;
    }

    getDetectionsFromView(viewport) {
        const combinedDetections = [];
        for (const [key, detectionSet] of Object.entries(
            this.availableAlgorithms
        )) {
            if (viewport === constants.viewport.TOP) {
                if (detectionSet.data.top !== undefined) {
                    detectionSet.data.top.forEach((detection) => {
                        combinedDetections.push(detection);
                    });
                }
            } else if (viewport === constants.viewport.SIDE) {
                if (detectionSet.data.side !== undefined) {
                    detectionSet.data.side.forEach((detection) => {
                        combinedDetections.push(detection);
                    });
                }
            }
        }
        return combinedDetections;
    }
}
