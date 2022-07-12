import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../utils/Constants';
import randomColor from 'randomcolor';
import Utils from '../../../utils/Utils';
import { Cookies } from 'react-cookie';
import * as Ensemble from '../../../utils/Ensemble';

// interface Detection {
//     // Unique Identifier
//     uuid: string;
//     // Algorithm name - "Tiled 2.0", "OTAP" etc
//     algorithm: string;
//     // Apple, Orange, Banana, etc
//     className: string;
//     // A percentage value representing how confident that we have labeled the detection
//     // class name appropriately, IE we labeled it an Apple and we believe it to be an Apple by 86%
//     confidence: string;
//     // Wether the detection is selected and we can edit the detection
//     selected: boolean;
//     // If the detection is rendered in the Apps viewports
//     visible: boolean;
//     // What color to display the bounding box
//     color: string;
//     // Dictating what viewport the detection resides in, TOP or SIDE eg.
//     view: string;
//     // An array inside an array representing the polygon mask if there is one
//     polygonMask: number[[]];
//     // An array inside an array representing the binary mask if there is one
//     binaryMask: number[[]];
//     // The coordinates of the detection which are generally [x-start, y-start, x-end, y-end]
//     boundingBox: number[];
//     // Wether the detection is considered to valid. If a detection is not deleted before sending
//     // the file back to the image/command server, then is is considered to be validated.
//     validation: boolean;
//     // Will be white if the detection is visible and gray if not visible
//     textColor: string;
// }

const myCookie = new Cookies();
const cookieData = myCookie.get('detections');
let missMatchedClassNames = [];
const storeCookieData = (classNames) => {
    myCookie.set('detections', classNames, {
        path: '/',
        maxAge: constants.COOKIE.TIME, // Current time is 3 hours
    });
};

if (cookieData !== undefined) {
    missMatchedClassNames = cookieData;
} else {
    storeCookieData(missMatchedClassNames);
}

const initialState = {
    detections: [],
    summarizedDetections: [],
    // Selection data
    /** @type string */
    selectedAlgorithm: '',
    /** @type Detection */
    selectedDetection: null,

    // As commented above
    /** @type Interface_Detection */
    detectionLabels: [],
    detectionChanged: false,
    missMatchedClassNames,
    bLists: [],
};

const detectionsSlice = createSlice({
    name: 'detections',
    initialState,
    reducers: {
        /**
         * Reset detection store to default values
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        resetDetections: (state) => {
            state.selectedAlgorithm = '';
            state.selectedDetection = null;
            state.detections = [];
            state.detectionChanged = false;
            state.bLists = [];
            state.summarizedDetections = [];
        },

        /**
         * Adds detection object to store
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} algorithm - Destructured from action.payload -- algorithm's name
         * @param {string} className - Destructured from action.payload -- name of detection's class
         * @param {number} confidence - Destructured from action.payload -- confidence of detection
         * @param {constants.viewport} view - Destructured from action.payload -- Viewport of selected detection
         * @param {Array<number>} binaryMask - Destructured from action.payload -- Array of binary mask map
         * @param {Array<number>} polygonMask - Destructured from action.payload -- Array of polygon mask coordinates
         * @param {Array<number>} boundingBox - Destructured from action.payload -- Array of bounding box coordinates
         * @param {string} uuid - Destructured from action.payload -- String of uuid for detection
         */
        addDetection: (state, action) => {
            const {
                algorithm,
                className,
                confidence,
                view,
                binaryMask,
                polygonMask,
                boundingBox,
                uuid,
                detectionFromFile,
            } = action.payload;
            state.detections.push({
                algorithm,
                className: className.toLowerCase(),
                confidence,
                view,
                binaryMask,
                polygonMask,
                boundingBox,
                selected: false,
                visible: true,
                uuid,
                color: randomColor({
                    seed: className,
                    hue: 'random',
                    luminosity: 'bright',
                }),
                validation: null,
                textColor: 'white',
            });
            state.detections[state.detections.length - 1].detectionType =
                Utils.getDetectionType(
                    state.detections[state.detections.length - 1]
                );
            const foundIndex = state.missMatchedClassNames.findIndex(
                (el) => el.className === className
            );
            if (foundIndex !== -1) {
                state.detections[state.detections.length - 1].color =
                    state.missMatchedClassNames[foundIndex].color;
            }
            if (state.detectionLabels.indexOf(className) === -1) {
                state.detectionLabels.push(className);
            }
            if (!detectionFromFile) {
                state.detectionChanged = true;
            }
            /*                  Begin Ensemble                    */
            /*                  bList sorting                    */
            const bListRef = {
                uuid: state.detections[state.detections.length - 1].uuid,
                confidence:
                    state.detections[state.detections.length - 1].confidence,
            };
            if (state.bLists.length === 0) {
                state.bLists[0] = {
                    view,
                    className,
                    items: [bListRef],
                };
            } else {
                const index = state.bLists.findIndex(
                    (value) =>
                        value.view === view && value.className === className
                );
                if (index !== -1) {
                    state.bLists[index].items.push(bListRef);
                    state.bLists[index].items.sort((a, b) => {
                        if (a.confidence < b.confidence) return 1;
                        else return -1;
                    });
                } else {
                    state.bLists.push({
                        view,
                        className,
                        items: [bListRef],
                    });
                }
            }
            /*                  End bList sorting                    */
            /*                  WBF Calculation                    */
            state.summarizedDetections = [];
            state.bLists.forEach((list) => {
                const bListDetections = [];
                list.items.forEach((item) => {
                    const detection = state.detections.find(
                        (det) => det.uuid === item.uuid
                    );
                    try {
                        bListDetections.push({
                            view: detection.view,
                            className: detection.className.toLowerCase(),
                            algorithm: detection.algorithm.toLowerCase(),
                            boundingBox: JSON.parse(
                                JSON.stringify(detection.boundingBox)
                            ),
                            confidence: detection.confidence,
                            color: detection.color,
                            visible: true,
                            selected: false,
                        });
                    } catch (e) {
                        console.log(e);
                    }
                });
                const { lList, fList } =
                    Ensemble.calculateLFLists(bListDetections);
                for (let i = 0; i < fList.length; i++) {
                    const { x1, x2, y1, y2, fusedConfidence } =
                        Ensemble.calculateFusedBox(lList, i);
                    fList[i].algorithm = 'Summarized - WBF';
                    fList[i].boundingBox = [x1, y1, x2, y2];
                    fList[i].confidence =
                        fusedConfidence >= 100 ? 100 : fusedConfidence;
                    fList[i].polygonMask = [];
                    fList[i].binaryMask = [[], [], []];
                    state.summarizedDetections.push(fList[i]);
                }
            });
            /*                  End WBF Calculation                    */
            /*                  End Ensemble                    */
        },
        /**
         * Clears selection data for all detections
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        clearAllSelection: (state) => {
            state.detections.forEach((det) => {
                det.selected = false;
                if (det.visible) {
                    det.textColor = 'white';
                }
            });
            state.selectedDetection = null;
            state.selectedAlgorithm = '';
        },

        /**
         * Select a DetectionSet object
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} algorithm - Destructured from action.payload -- algorithm's name
         */
        selectDetectionSet: (state, action) => {
            state.selectedDetection = null;
            state.selectedAlgorithm = action.payload;
            state.detections.forEach((det) => {
                if (det.algorithm === action.payload) {
                    det.selected = true;
                } else {
                    det.selected = false;
                }
            });
        },

        /**
         * Selects a detection
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} uuid - Destructured from action.payload -- unique identifier for detection
         */
        selectDetection: (state, action) => {
            state.selectedAlgorithm = '';
            state.detections.forEach((det) => {
                if (det.uuid === action.payload) {
                    det.selected = true;
                    state.selectedDetection = det;
                } else {
                    det.selected = false;
                }
            });
        },

        /**
         * Update properties on a detection
         * Used for any action that is not selecting or deleting a detection
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} uuid - Destructured from action.payload -- uuid of detection to update
         * @param {Detection} update - Destructured from action.payload -- contains any properties to update on the Detection
         */
        updateDetection: (state, action) => {
            const { uuid, update } = action.payload;
            let detection = state.detections.find((det) => det.uuid === uuid);
            if (detection !== undefined) {
                for (let key in update) detection[key] = update[key];
                if (state.selectedDetection) {
                    if (state.selectedDetection.uuid === detection.uuid) {
                        state.selectedDetection = detection;
                        state.detectionChanged = true;
                    }
                }
            }
            /*                  Begin Ensemble                    */
            /*                  WBF Calculation                    */
            state.summarizedDetections = [];
            state.bLists.forEach((list) => {
                const bListDetections = [];
                list.items.forEach((item) => {
                    const detection = state.detections.find(
                        (det) => det.uuid === item.uuid
                    );
                    try {
                        bListDetections.push({
                            view: detection.view,
                            className: detection.className.toLowerCase(),
                            algorithm: detection.algorithm.toLowerCase(),
                            boundingBox: JSON.parse(
                                JSON.stringify(detection.boundingBox)
                            ),
                            confidence: detection.confidence,
                            color: detection.color,
                            visible: true,
                            selected: false,
                        });
                    } catch (e) {
                        console.log(e);
                    }
                });
                const { lList, fList } =
                    Ensemble.calculateLFLists(bListDetections);
                for (let i = 0; i < fList.length; i++) {
                    const { x1, x2, y1, y2, fusedConfidence } =
                        Ensemble.calculateFusedBox(lList, i);
                    fList[i].algorithm = 'Summarized - WBF';
                    fList[i].boundingBox = [x1, y1, x2, y2];
                    fList[i].confidence =
                        fusedConfidence >= 100 ? 100 : fusedConfidence;
                    fList[i].polygonMask = [];
                    fList[i].binaryMask = [[], [], []];
                    state.summarizedDetections.push(fList[i]);
                }
            });
            /*                  End WBF Calculation                    */
            /*                  End Ensemble                    */
        },

        /**
         * Updates a Detection's class label.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} uuid - Destructured from action.payload -- uuid for detection being updated
         * @param {string} className - Destructured from action.payload -- new label className for detection being updated
         */
        editDetectionLabel: (state, action) => {
            const { uuid, className } = action.payload;
            const newClassName = className.toLowerCase();
            let oldClassName = '';
            let detection = state.detections.find((det) => det.uuid === uuid);
            if (detection) {
                oldClassName = detection.className.toLowerCase();
                detection.className = newClassName;
                const detColor = randomColor({
                    seed: className,
                    hue: 'random',
                    luminosity: 'bright',
                });
                detection.color = detColor;
                if (state.selectedDetection?.uuid === detection.uuid) {
                    state.selectedDetection.className = newClassName;
                    state.selectedDetection.color = detColor;
                }
                state.detectionChanged = true;
                if (state.detectionLabels.indexOf(className) === -1) {
                    state.detectionLabels.push(className);
                }
                state.missMatchedClassNames.forEach((missMatched) => {
                    state.detections.forEach((det) => {
                        if (
                            missMatched.className.toLowerCase() ===
                            det.className
                        ) {
                            det.color = missMatched.color;
                            if (
                                state.selectedDetection?.uuid === detection.uuid
                            ) {
                                state.selectedDetection.color =
                                    missMatched.color;
                            }
                        }
                    });
                });
                /*                  Begin Ensemble                    */
                /*                  bList sorting                    */
                const oldIndex = state.bLists.findIndex(
                    (list) =>
                        list.view === detection.view &&
                        list.className.toLowerCase() === oldClassName
                );
                if (oldIndex !== -1) {
                    state.bLists[oldIndex].items = state.bLists[
                        oldIndex
                    ].items.filter((det) => det.uuid !== uuid);
                    if (state.bLists[oldIndex].items.length === 0) {
                        state.bLists.splice(oldIndex, 1);
                    }
                }
                let newIndex = state.bLists.findIndex(
                    (list) =>
                        list.view === detection.view &&
                        list.className.toLowerCase() === newClassName
                );
                if (newIndex !== -1) {
                    state.bLists[newIndex].items.push({
                        uuid,
                        confidence: detection.confidence,
                    });
                } else {
                    state.bLists.push({
                        view: detection.view,
                        className: newClassName,
                        items: [
                            {
                                uuid,
                                confidence: detection.confidence,
                            },
                        ],
                    });
                    newIndex = state.bLists.length - 1;
                }
                if (state.bLists[newIndex].items.length > 1) {
                    state.bLists[newIndex].items.sort((a, b) => {
                        if (a.confidence < b.confidence) return 1;
                        else return -1;
                    });
                }
                /*                  End bList sorting                    */
                /*                  WBF Calculation                    */
                state.summarizedDetections = [];
                state.bLists.forEach((list) => {
                    const bListDetections = [];
                    list.items.forEach((item) => {
                        const detection = state.detections.find(
                            (det) => det.uuid === item.uuid
                        );
                        try {
                            bListDetections.push({
                                view: detection.view,
                                className: detection.className.toLowerCase(),
                                algorithm: detection.algorithm.toLowerCase(),
                                boundingBox: JSON.parse(
                                    JSON.stringify(detection.boundingBox)
                                ),
                                confidence: detection.confidence,
                                color: detection.color,
                                visible: true,
                                selected: false,
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    });
                    const { lList, fList } =
                        Ensemble.calculateLFLists(bListDetections);
                    for (let i = 0; i < fList.length; i++) {
                        const { x1, x2, y1, y2, fusedConfidence } =
                            Ensemble.calculateFusedBox(lList, i);
                        fList[i].algorithm = 'Summarized - WBF';
                        fList[i].boundingBox = [x1, y1, x2, y2];
                        fList[i].confidence =
                            fusedConfidence >= 100 ? 100 : fusedConfidence;
                        fList[i].polygonMask = [];
                        fList[i].binaryMask = [[], [], []];
                        state.summarizedDetections.push(fList[i]);
                    }
                });
                /*                  End WBF Calculation                    */
                /*                  End Ensemble                    */
            }
        },

        /**
         * Deletes a detection.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} uuid - Destructured from action.payload -- uuid for detection being deleted
         */
        deleteDetection: (state, action) => {
            const foundDetIndex = state.detections.findIndex(
                (det) => det.uuid === action.payload
            );
            if (foundDetIndex !== -1) {
                const detectionToDelete = state.detections[foundDetIndex];
                state.detections.splice(foundDetIndex, 1);
                state.detectionChanged = true;
                /*                  Begin Ensemble                    */
                /*                  bList sorting                    */
                const bListIndex = state.bLists.findIndex(
                    (list) =>
                        list.view === detectionToDelete.view &&
                        list.className === detectionToDelete.className
                );
                if (bListIndex !== -1) {
                    state.bLists[bListIndex].items = state.bLists[
                        bListIndex
                    ].items.filter((det) => det.uuid !== action.payload);
                    if (state.bLists[bListIndex].items.length === 0) {
                        state.bLists.splice(bListIndex, 1);
                    }
                }
                /*                  End bList sorting                    */
                /*                  WBF Calculation                    */
                state.summarizedDetections = [];
                state.bLists.forEach((list) => {
                    const bListDetections = [];
                    list.items.forEach((item) => {
                        const detection = state.detections.find(
                            (det) => det.uuid === item.uuid
                        );
                        try {
                            bListDetections.push({
                                view: detection.view,
                                className: detection.className.toLowerCase(),
                                algorithm: detection.algorithm.toLowerCase(),
                                boundingBox: JSON.parse(
                                    JSON.stringify(detection.boundingBox)
                                ),
                                confidence: detection.confidence,
                                color: detection.color,
                                visible: true,
                                selected: false,
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    });
                    const { lList, fList } =
                        Ensemble.calculateLFLists(bListDetections);
                    for (let i = 0; i < fList.length; i++) {
                        const { x1, x2, y1, y2, fusedConfidence } =
                            Ensemble.calculateFusedBox(lList, i);
                        fList[i].algorithm = 'Summarized - WBF';
                        fList[i].boundingBox = [x1, y1, x2, y2];
                        fList[i].confidence =
                            fusedConfidence >= 100 ? 100 : fusedConfidence;
                        fList[i].polygonMask = [];
                        fList[i].binaryMask = [[], [], []];
                        state.summarizedDetections.push(fList[i]);
                    }
                });
                /*                  End WBF Calculation                    */
                /*                  End Ensemble                    */
            }
        },

        /**
         * Marks all DetectionSets as validated by the user
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        validateDetections: (state) => {
            state.detections.forEach((det) => {
                det.validation = true;
                det.textColor = constants.detectionStyle.VALID_COLOR;
            });
        },
        /**
         * Marks all DetectionSets as invalidated, for if the app errors and cannot send the file
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        invalidateDetections: (state) => {
            state.detections.forEach((det) => {
                det.validation = false;
                det.textColor = 'white';
            });
        },
        /**
         * Update visibility on a DetectionSet
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} algorithm - Destructured from action.payload -- Name of algorithm for DetectionSet
         * @param {boolean} isVisible - Destructured from action.payload -- whether the DetectionSet is visible or not
         */
        updateDetectionSetVisibility: (state, action) => {
            const { algorithm, isVisible } = action.payload;
            state.detections.forEach((det) => {
                if (det.algorithm === algorithm) {
                    det.visible = isVisible;
                    if (isVisible === false) {
                        det.selected = false;
                        if (state.selectedAlgorithm === algorithm) {
                            state.selectedAlgorithm = '';
                        }
                    }
                }
                if (det.visible) {
                    det.textColor = 'white';
                } else {
                    det.textColor = 'gray';
                }
            });
        },

        /**
         * Update visibility on a Detection
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} uuid - Destructured from action.payload -- uuid of detection
         * @param {boolean} isVisible - Destructured from action.payload -- whether the DetectionSet is visible or not
         */
        updateDetectionVisibility: (state, action) => {
            state.detections.forEach((det) => {
                if (det.uuid === action.payload) {
                    det.visible = !det.visible;
                    if (det.visible === false) {
                        det.selected = false;
                        det.textColor = 'gray';
                    } else {
                        det.textColor = 'white';
                    }
                }
            });
        },

        /**
         * For when a color is picked, it tests if that color is in the array of miss matched class names. If it isn't, its name and corresponding color are added.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} className - Destructured from action.payload -- class name of the detection
         * @param {string} color - Destructured from action.payload -- new color
         */
        addMissMatchedClassName: (state, action) => {
            const { className, color } = action.payload;
            const foundIndex = state.missMatchedClassNames.findIndex(
                (el) => el.className === className
            );
            if (foundIndex === -1) {
                state.missMatchedClassNames.push({ className, color });
            } else {
                state.missMatchedClassNames[foundIndex].color = color;
            }
            storeCookieData(state.missMatchedClassNames);
            state.missMatchedClassNames.forEach((missMatched) => {
                state.detections.forEach((det) => {
                    if (missMatched.className === det.className) {
                        det.color = missMatched.color;
                    }
                });
            });
            if (state.selectedDetection.className === className) {
                state.selectedDetection.color = color;
            }
        },
        /**
         * For when the color picker is closed, it will update all existing detections with the same name as the color selected from the color picker
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        updateMissMatchedClassName: (state) => {
            state.missMatchedClassNames.forEach((missMatched) => {
                state.detections.forEach((det) => {
                    if (missMatched.className === det.className) {
                        det.color = missMatched.color;
                    }
                });
            });
        },
    },
});

// Selectors Functions
// These functions do not modify the Redux store in any way, just gets data

/**
 * Gets all unique class names from each Detection in each DetectionSet.
 * Used to populate the label list component for editing Detection labels
 * @param {Object.<string, DetectionSet>} state - Redux Detections state
 * @returns {Array<string>} - array of all unique detection class names
 */
export const getDetectionLabels = (state) => state.detections.detectionLabels;

/**
 * Get all Detections for the top view, given a set of detections
 *
 * @param {Object.<string, DetectionSet>} state - Redux Detections state
 * @returns {Array<Detection>} - Detection objects found in the top viewport
 */
export const getTopDetections = (detections) => {
    const topDetections = [];
    if (detections !== undefined) {
        detections.forEach((det) => {
            if (det.view === constants.viewport.TOP) {
                topDetections.push(det);
            }
        });
    }
    return topDetections;
};

/**
 * Get all Detections for the side view, given a set of detections
 *
 * @param {Object.<string, DetectionSet>} state - Redux Detections state
 * @returns {Array<Detection>} - Detection objects found in the side viewport
 */
export const getSideDetections = (detections) => {
    const sideDetections = [];
    if (detections !== undefined) {
        detections.forEach((det) => {
            if (det.view === constants.viewport.SIDE) {
                sideDetections.push(det);
            }
        });
    }
    return sideDetections;
};

/**
 * Determines if the bounding box coordinates have changed from the passed in values to the stored ones
 *
 * @param {Array<Detection>} detections - Array of detection objects
 * @param {string} uuid - uuid identifier of detection you want to check
 * @param {Array<number>} boundingBox - Bounding box coordinates of detection object
 * @returns {boolean} - True if detection coordinates have changed. False otherwise
 */
export const hasDetectionCoordinatesChanged = (
    detections,
    uuid,
    boundingBox,
    polygonMask
) => {
    const detection = detections.find((det) => det.uuid === uuid);
    if (detection) {
        let result = false;
        for (let i = 0; i < detection.boundingBox.length; i++) {
            if (detection.boundingBox[i] !== boundingBox[i]) {
                result = true;
                break;
            }
        }
        for (let j = 0; j < detection.polygonMask.length; j++) {
            if (
                detection.polygonMask[j].x !== polygonMask[j].x &&
                detection.polygonMask[j].y !== polygonMask[j].y
            ) {
                result = true;
                break;
            }
        }
        return result;
    }
};

/**
 * Sorts and organizes the detections into arrays based on algorithm name
 * Returns the array of detections by algorithm in an array.
 *
 * @param {Store} state - Passed in via useSelector/mapDispatchToProps
 * @returns {Array<Array<Detection>>} - Array containing arrays of each algorithm
 */
export const getDetectionsByAlgorithm = (state) => {
    const sorted = state.detections.detections.slice().sort((a, b) => {
        if (a.algorithm < b.algorithm) {
            return -1;
        }
        if (a.algorithm > b.algorithm) {
            return 1;
        }
        return 0;
    });
    const response = [];
    let prepared = [];
    let priorAlgorithm = sorted.length > 0 ? sorted[0].algorithm : '';
    sorted.forEach((det) => {
        const currentAlgorithm = det.algorithm;
        if (priorAlgorithm === currentAlgorithm) {
            prepared.push(det);
        } else {
            response.push(prepared);
            prepared = [];
            prepared.push(det);
        }
        priorAlgorithm = currentAlgorithm;
    });
    if (prepared.length > 0) response.push(prepared);
    return response;
};

/**
 * Returns the currently selected detection
 *
 * @param {Store} state - Passed in via useSelector/mapDispatchToProps
 * @returns {Detection} - The currently selected detection
 */
export const getSelectedDetection = (state) =>
    state.detections.selectedDetection;

/**
 * Returns the selected detection's color hex code, if none selected, returns empty string
 *
 * @param {Store} state - Passed in via useSelector/mapDispatchToProps
 * @returns {string} - The hex color of the detection
 */
export const getSelectedDetectionColor = (state) => {
    if (state.detections.selectedDetection !== null) {
        return state.detections.selectedDetection.color;
    } else {
        return '';
    }
};

/**
 * Returns the viewport for the current detection
 *
 * @param {Object} state - Passed in via useSelector/mapDispatchToProps
 * @returns {constants.viewport} - Viewport of selected detection
 */
export const getSelectedDetectionViewport = (state) => {
    if (state.detections.selectedDetection) {
        return state.detections.selectedDetection.view;
    }
};

/**
 * Returns the selected detection class name label
 *
 * @param {Object} state - Passed in via useSelector/mapDispatchToProps
 * @returns {string} - Classname of selected detection
 */
export const getSelectedDetectionClassName = (state) => {
    if (state.detections.selectedDetection) {
        return state.detections.selectedDetection.className;
    }
};

/**
 * Will calculate and return the selected detection's width and height
 * @param {Object} state - Passed in via useSelector/mapDispatchToProps
 * @returns {{width: number, height: number}} - Width and height of selected detection
 */
export const getSelectedDetectionWidthAndHeight = (state) => {
    if (state.detections.selectedDetection) {
        const width = Math.abs(
            state.detections.selectedDetection.boundingBox[2] -
                state.detections.selectedDetection.boundingBox[0]
        );
        const height = Math.abs(
            state.detections.selectedDetection.boundingBox[3] -
                state.detections.selectedDetection.boundingBox[1]
        );
        return {
            width,
            height,
        };
    } else return null;
};

/**
 * Returns selected algorithm
 *
 * @param {Store} state - Passed in via useSelector/mapDispatchToProps
 * @returns {string} - The currently selected algorithm
 */
export const getSelectedAlgorithm = (state) =>
    state.detections.selectedAlgorithm;

// Helper Functions

/**
 * Get color of detection for bounding box rendering
 *
 * @param {Detection} detection - Detection object
 * @param {string} uuid - unique id of detection object
 * @returns {string} - color in string form
 */
const getDetectionColor = (detection, uuid) => {
    if (detection.selected) return constants.detectionStyle.SELECTED_COLOR;
    if (detection.uuid !== uuid && uuid !== undefined) {
        const rgb = Utils.hexToRgb(detection.color);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
    }
    if (detection.validation !== null) {
        if (detection.validation) {
            return constants.detectionStyle.VALID_COLOR;
        }
        return constants.detectionStyle.INVALID_COLOR;
    }
    return detection.color;
};

/**
 * Returns if any of the detections has changed
 *
 * @param {Object} state - Passed in via useSelector/mapDispatchToProps
 * @returns {Boolean} - True if any detections have changed. False otherwise
 */
export const getDetectionChanged = (state) => state.detections.detectionChanged;

/**
 * Returns the detection type for the currently selected detection
 *
 * @param {Object} state - Passed in via useSelector/mapDispatchToProps
 * @returns {constants.detectionType} - Detection type of selected detection
 */
export const getSelectedDetectionType = (state) => {
    if (state.detections.selectedDetection) {
        return state.detections.selectedDetection.detectionType;
    }
};

export const {
    resetDetections,
    addDetection,
    clearAllSelection,
    selectDetection,
    selectDetectionSet,
    updateDetection,
    editDetectionLabel,
    deleteDetection,
    validateDetections,
    updateDetectionSetVisibility,
    updateDetectionVisibility,
    addMissMatchedClassName,
    updateMissMatchedClassName,
    invalidateDetections,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
