import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../utils/Constants';
import Utils from '../../../utils/Utils';

const initialState = {
    editionMode: constants.editionMode.NO_TOOL,
    cornerstoneMode: constants.cornerstoneMode.SELECTION,
    annotationMode: constants.annotationMode.NO_TOOL,
    isEditLabelWidgetVisible: false,
    isFABVisible: false,
    isDetectionContextVisible: false,
    detectionContextPosition: {
        top: 0,
        left: 0,
    },
    detectionLabelEditWidth: '0px',
    detectionLabelEditFont: constants.detectionStyle.LABEL_FONT,
    detectionLabelEditViewport: constants.viewport.SIDE,
    detectionLabelEditPosition: {
        top: 0,
        left: 0,
    },
    zoomLevelTop: constants.viewportStyle.ZOOM,
    zoomLevelSide: constants.viewportStyle.ZOOM,
    singleViewport: false,
    receiveTime: null,
    detectorType: '',
    detectorConfigType: '',
    seriesType: '',
    studyType: '',
    displaySettings: false,
    isSettingsVisible: false,
    inputLabel: '',
    collapsedSideMenu: false,
    collapsedLazyMenu: false,
    colorPickerVisible: false,
    numberOfFiles: 0,
    localFileOpen: false,
    recentScroll: false,
    currentFileFormat: constants.SETTINGS.ANNOTATIONS.TDR,
    generatingThumbnails: true,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        /**
         * Sets wether the Electron process is generating thumbnails or not
         * @param {State} state
         * @param {{payload: Boolean}} action
         */
        setGeneratingThumbnails: (state, action) => {
            state.generatingThumbnails = action.payload;
        },
        /**
         * Toggles the visibility of the side menu
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {CornerstoneObject?} action.payload - Can contain cornerstone object if local file is currently open
         */
        toggleCollapsedSideMenu: (state, action) => {
            state.collapsedSideMenu = !state.collapsedSideMenu;
            if (state.localFileOpen) {
                Utils.calculateViewportDimensions(
                    action.payload,
                    state.singleViewport,
                    state.collapsedSideMenu,
                    state.collapsedLazyMenu,
                    true
                );
            } else {
                Utils.calculateViewportDimensions(
                    action.payload,
                    state.singleViewport,
                    state.collapsedSideMenu
                );
            }
        },

        /**
         * Toggles the visibility of the lazy menu
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {CornerstoneObject} action.payload - Cornerstone object
         */
        toggleCollapsedLazyMenu: (state, action) => {
            state.collapsedLazyMenu = !state.collapsedLazyMenu;
            Utils.calculateViewportDimensions(
                action.payload,
                state.singleViewport,
                state.collapsedSideMenu,
                state.collapsedLazyMenu,
                true
            );
        },

        /**
         * Sets the input label to action.payload
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action.payload - String value of new input label
         */
        setInputLabel: (state, action) => {
            state.inputLabel = action.payload;
        },

        /**
         * Updates edition mode to new mode
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {constants.editionMode} editionMode - Destructured from action.payload -- Constant value for the edition mode.
         * @param {boolean} isEditLabelWidgetVisible - Destructured from action.payload -- Updated visibility for detection edit label.
         * @param {number} detectionLabelEditWidth - Destructured from action.payload -- Updated width for detection edit label.
         * @param {top: number, left: number} detectionLabelEditPosition - Destructured from action.payload -- Updated position for detection edit label.
         */
        updateEditionMode: (state, action) => {
            const {
                editionMode,
                isEditLabelWidgetVisible,
                detectionLabelEditWidth,
                detectionLabelEditPosition,
            } = action.payload;
            state.editionMode = editionMode;
            state.isEditLabelWidgetVisible = isEditLabelWidgetVisible;
            switch (editionMode) {
                case constants.editionMode.LABEL:
                    state.detectionLabelEditWidth = detectionLabelEditWidth;
                    state.detectionLabelEditPosition =
                        detectionLabelEditPosition;
                    state.colorPickerVisible = false;
                    break;
                case constants.editionMode.BOUNDING:
                case constants.editionMode.NO_TOOL:
                case constants.editionMode.MOVE:
                case constants.editionMode.POLYGON:
                    state.colorPickerVisible = false;
                    state.colorChanged = false;
                    break;
                case constants.editionMode.COLOR:
                    state.colorPickerVisible = true;
            }
        },
        /**
         * Updates the label position, namely for resize events
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {number} detectionLabelEditWidth - Destructured from action.payload -- width of detection edit label
         * @param {top: number, left: number} detectionLabelEditPosition - Destructured from action.payload -- position of detection edit label
         */
        updateEditLabelPosition: (state, action) => {
            const { detectionLabelEditWidth, detectionLabelEditPosition } =
                action.payload;
            state.detectionLabelEditWidth = detectionLabelEditWidth;
            state.detectionLabelEditPosition = detectionLabelEditPosition;
        },

        /**
         * For when a user exits edition mode. Sets the UI elements for edition mode to null and to not display the detection context widget.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        exitEditionModeUpdate: (state) => {
            state.isDetectionContextVisible = false;
            state.isEditLabelWidgetVisible = false;
            state.colorPickerVisible = false;
        },

        /**
         * Updates cornerstone/annotation mode
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {constants.cornerstoneMode} cornerstoneMode - Constant value for the cornerstone mode.
         * @param {constants.annotationMode} annotationMode - Constant value for the annotation mode.
         */
        updateCornerstoneMode: (state, action) => {
            const { cornerstoneMode, annotationMode } = action.payload;
            state.cornerstoneMode = cornerstoneMode;
            state.annotationMode = annotationMode;
        },

        /**
         * Updates visibility of FAB
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean to determine if we should display the FAB.
         */
        updateFABVisibility: (state, action) => {
            state.isFABVisible = action.payload;
        },

        /**
         * Updates the state of the Label edition widget
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {constants.editionMode} editionMode - Destructured from action.payload -- Constant value for the edition mode.
         * @param {number} detectionLabelEditWidth - Destructured from action.payload -- width of detection edit label
         * @param {boolean} isEditLabelWidgetVisible - Destructured from action.payload -- Boolean determining the visibility of the Label edition widget
         */
        onLabelEditionEnd: (state, action) => {
            const {
                editionMode,
                detectionLabelEditWidth,
                isEditLabelWidgetVisible,
            } = action.payload;
            state.editionMode = editionMode;
            state.detectionLabelEditWidth = detectionLabelEditWidth;
            state.isEditLabelWidgetVisible = isEditLabelWidgetVisible;
        },

        /**
         * For when a user selects an label from the detection context widget. Will set the UI elements edition mode to be Label, the detection context to not be visible, the edit label width, and its position.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {number} width - Destructured from action.payload -- Width of label
         * @param {{x: number, y: number}} position - Destructured from action.payload -- position of detection label
         * @param {string} font - Destructured from action.payload -- string containing value of label
         * @param {constants.viewport} viewport - Destructured from action.payload -- Constant value for the which viewport.
         */
        labelSelectedUpdate: (state, action) => {
            const { width, position, font, viewport } = action.payload;
            state.detectionLabelEditWidth = width;
            state.detectionLabelEditFont = font;
            state.detectionLabelEditViewport = viewport;
            state.detectionLabelEditPosition.top = position.top;
            state.detectionLabelEditPosition.left = position.left;
        },

        /**
         * Resets selected detection boxes, cornerstone mode, and edition mode.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        resetSelectedDetectionBoxesUpdate: (state) => {
            (state.cornerstoneMode = constants.cornerstoneMode.SELECTION),
                (state.editionMode = constants.editionMode.NO_TOOL),
                (state.isDetectionContextVisible = false),
                (state.detectionContextPosition = {
                    top: 0,
                    left: 0,
                });
        },

        /**
         * Resets selected detection boxes and edition mode.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        resetSelectedDetectionBoxesElseUpdate: (state) => {
            (state.isDetectionContextVisible = false),
                (state.editionMode = constants.editionMode.NO_TOOL),
                (state.detectionContextPosition = {
                    top: 0,
                    left: 0,
                });
        },

        /**
         * Updates detection context widget based on passed in boolean
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean value for if we should display the detection context widget, for a selected detection.
         */
        updateIsDetectionContextVisible: (state, action) => {
            state.isDetectionContextVisible = action.payload;
        },
        /**
         * Updates detection context widget position based on passed in position object
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {{top: number, left: number}} action.payload - Object containing values for top and left position for the detection context position.
         */
        updateDetectionContextPosition: (state, action) => {
            const { top, left } = action.payload;
            state.detectionContextPosition.top = top;
            state.detectionContextPosition.left = left;
        },

        /**
         * For when the UI recalculates the zoom level for the cornerstone viewports.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {number} zoomLevelTop - Destructured from action.payload -- Zoom level of top viewport
         * @param {number} zoomLevelSide - Destructured from action.payload -- Zoom level of side viewport
         */
        updateZoomLevels: (state, action) => {
            const { zoomLevelTop, zoomLevelSide } = action.payload;
            state.zoomLevelTop = zoomLevelTop;
            state.zoomLevelSide = zoomLevelSide;
        },
        /**
         * Updates the top level zoom to the passed in number
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Number} action - Number containing the zoom level
         */
        updateZoomLevelTop: (state, action) => {
            state.zoomLevelTop = action.payload;
        },
        /**
         * Updates the side level zoom to the passed in number
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Number} action - Number containing the zoom level
         */
        updateZoomLevelSide: (state, action) => {
            state.zoomLevelSide = action.payload;
        },
        /**
         * Update function for onDragEnd function, updating new detection edit label width/position and new context menu position
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Number} detectionLabelEditWidth - Destructured from action.payload -- Width of detection edit label
         * @param {{top: number, left: number}} detectionLabelEditPosition - Destructured from action.payload -- Postion object of detetion edit label position
         * @param {{x: number, y: number}} contextMenuPos - Destructured from action.payload -- Position object determining position of context menu
         */
        onDragEndWidgetUpdate: (state, action) => {
            const {
                detectionLabelEditWidth,
                detectionLabelEditPosition,
                contextMenuPos,
            } = action.payload;
            (state.isDetectionContextVisible = true),
                (state.detectionLabelEditWidth = detectionLabelEditWidth),
                (state.detectionLabelEditPosition = detectionLabelEditPosition),
                (state.isEditLabelWidgetVisible =
                    state.editionMode === constants.editionMode.LABEL),
                (state.detectionContextPosition = {
                    top: contextMenuPos.y,
                    left: contextMenuPos.x,
                });
        },

        /**
         * Updates cornerstone mode to default and makes context menu invisible
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        hideContextMenuUpdate: (state) => {
            (state.isDetectionContextVisible = false),
                (state.cornerstoneMode = constants.cornerstoneMode.SELECTION);
        },

        /**
         * Occurs when the UI receives a new Ora DICOS file from the file server. Sets the UI elements for single viewport, the received time, and that we have received a file flag.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {boolean} singleViewport - Destructured from action.payload -- boolean value for single viewport, true if single viewport
         * @param {Date} receiveTime - Destructured from action.payload -- the Date for the received time
         */
        newFileReceivedUpdate: (state, action) => {
            const { singleViewport, receiveTime } = action.payload;
            state.singleViewport = singleViewport;
            state.receiveTime = receiveTime;
            state.isFABVisible = true;
        },
        /**
         * This resets UI elements related to selecting a detection.
         * It will set the FAB to be visible, reset the cornerstone mode to selection,
         * set display selected bounding box to false, the edition mode to null, the
         * detection context to not be visible and reset its position.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        emptyAreaClickUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.editionMode = constants.editionMode.NO_TOOL;
            state.colorPickerVisible = false;
            state.isDetectionContextVisible = false;
            state.isEditLabelWidgetVisible = false;
            state.detectionContextPosition.top = 0;
            state.detectionContextPosition.left = 0;
        },
        /**
         * This resets UI elements related to when the user mouse leaves the window and there are now files in the queue.
         * It will set the FAB to NOT be visible, reset the cornerstone mode to selection,
         * set display selected bounding box to false, the edition mode to null, the
         * detection context to not be visible and reset its position.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        onMouseLeaveNoFilesUpdate: (state) => {
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.editionMode = constants.editionMode.NO_TOOL;
            state.isDetectionContextVisible = false;
            state.isEditLabelWidgetVisible = false;
            state.detectionContextPosition.top = 0;
            state.detectionContextPosition.left = 0;
        },
        /**
         * This sets UI elements related to selecting a detection. It will set the
         * FAB to not be visible, the cornerstone mode to edition, display the selected
         * bounding box to true, the edition mode to null and the detection context widget
         * to display.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        detectionSelectedUpdate: (state) => {
            state.isFABVisible = false;
            state.cornerstoneMode = constants.cornerstoneMode.EDITION;
            state.isDetectionContextVisible = true;
            state.editionMode = constants.editionMode.NO_TOOL;
        },
        /**
         * Resets detection menu value.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        menuDetectionSelectedUpdate: (state) => {
            (state.cornerstoneMode = constants.cornerstoneMode.SELECTION),
                (state.editionMode = constants.editionMode.NO_TOOL),
                (state.isDetectionContextVisible = false),
                (state.detectionContextPosition = {
                    top: 0,
                    left: 0,
                });
            state.isFABVisible = true;
        },
        /**
         * For when a user deletes a detection. Will set the UI elements for FAB to be visible,
         * the cornerstone mode to selection, to not display the selected bounding box, the
         * detection context to not be visible and drawing bounding box to false.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        deleteDetectionUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.isDetectionContextVisible = false;
        },
        /**
         * selectConfigInfoUpdate
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {State} detectorType - Destructured from action.payload -- Detector type of detection
         * @param {State} detectorConfigType - Destructured from action.payload -- Detector config type of detection
         * @param {State} seriesType - Destructured from action.payload -- Series type of detection
         * @param {State} studyType - Destructured from action.payload -- Study type of detection
         */
        selectConfigInfoUpdate: (state, action) => {
            const { detectorType, detectorConfigType, seriesType, studyType } =
                action.payload;
            state.detectorType = detectorType;
            state.detectorConfigType = detectorConfigType;
            state.seriesType = seriesType;
            state.studyType = studyType;
        },
        /**
         * Set boolean value determining whether or not to display the settings component.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean value determining whether or not to display the settings component.
         */
        setDisplaySettings: (state, action) => {
            state.displaySettings = action.payload;
        },
        /**
         * Set boolean value determining whether or not to display the settings modal window.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean value determining whether or not to display the settings modal window.
         */
        toggleSettingsVisibility: (state, action) => {
            state.isSettingsVisible = action.payload;
        },
        /**
         * For when a color is picked in the color picker
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action.payload - String result from Date.now()
         */
        setReceiveTime: (state, action) => {
            state.receiveTime = action.payload;
        },
        /**
         * Toggles the color picker visible boolean
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        colorPickerToggle: (state) => {
            state.colorPickerVisible = !state.colorPickerVisible;
        },
        /**
         * Determines wether the App is working with a local file or remote file
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - True if we have a local file open, false if not, wether remote or not.
         */
        setLocalFileOpen: (state, action) => {
            state.localFileOpen = action.payload;
        },
        /**
         * Determines wether the App is working with a local file or remote file
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action.payload - Format of currently processed file
         */
        setCurrentFileFormat: (state, action) => {
            state.currentFileFormat = action.payload;
        },
        /**
         * Update scroll flag to reset to true before waiting 1000ms and resetting to false
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        updateRecentScroll: (state, action) => {
            state.recentScroll = action.payload;
        },
    },
});

/**
 * Returns the current input value
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} Returns the current input value
 */
export const getInputLabel = (state) => state.ui.inputLabel;
/**
 * Returns whether the FAB is visible
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} Returns whether the FAB is visible
 */
export const getIsFabVisible = (state) => state.ui.isFABVisible;
/**
 * Returns whether the display settings component is visible
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} Returns whether the display settings component is visible
 */
export const getDisplaySettings = (state) => state.ui.displaySettings;
/**
 * Returns the current cornerstone mode
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {constants.cornerstoneMode} Returns the current cornerstone mode
 */
export const getCornerstoneMode = (state) => state.ui.cornerstoneMode;
/**
 * Returns the constant for the current edition mode.
 *
 * @param {State} state Passed in via useSelector
 * @returns {constants.editionMode} The constant for the current edition mode.
 */
export const getEditionMode = (state) => state.ui.editionMode;
/**
 * Returns if we are displaying the detection context widget, if a detection is selected
 *
 * @param {State} state Passed in via useSelector
 * @returns {Boolean} Returns if we are displaying the detection context widget, if a detection is selected
 */
export const getIsDetectionContextVisible = (state) =>
    state.ui.isDetectionContextVisible;
/**
 * Returns object containing the position in terms of top, and left values of detection context menu
 *
 * @param {State} state Passed in via useSelector
 * @returns {{top: number, left: number}} Object containing the position in terms of top, and left values
 */
export const getDetectionContextPosition = (state) =>
    state.ui.detectionContextPosition;
/**
 * Returns how large the detection label edition should be in width
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Number} Returns how large the detection label edition should be in width
 */
export const getDetectionLabelEditWidth = (state) =>
    state.ui.detectionLabelEditWidth;
/**
 * Returns the font string of the detection label edition
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} Returns the font string of the detection label edition
 */
export const getDetectionLabelEditFont = (state) =>
    state.ui.detectionLabelEditFont;
/**
 * Returns the viewport of the detection label edition
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} Returns the viewport of the detection label edition
 */
export const getDetectionLabelEditViewport = (state) =>
    state.ui.detectionLabelEditViewport;
/**
 * Returns an object with top and left values for the position of the edit label widget.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Object} Returns an object with top and left values for the position of the edit label widget.
 */
export const getDetectionLabelEditPosition = (state) =>
    state.ui.detectionLabelEditPosition;
/**
 * Returns the calculated zoom for cornerstone for the top(or left) view.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Number} The calculated zoom for cornerstone for the top(or left) view.
 */
export const getZoomLevelTop = (state) => state.ui.zoomLevelTop;

/**
 * Returns the calculated zoom for cornerstone for the side(or right) view.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Number} The calculated zoom for cornerstone for the side(or right) view.
 */
export const getZoomLevelSide = (state) => state.ui.zoomLevelSide;

/**
 * Returns the calculated zoom for cornerstone for both views.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {{zoomLevelTop: number, zoomLevelSide: number}} The calculated zoom for cornerstone for the side(or right) view.
 */
export const getZoomLevels = (state) => {
    return {
        zoomLevelTop: state.ui.zoomLevelTop,
        zoomLevelSide: state.ui.zoomLevelSide,
    };
};

/**
 * Returns the detector type string.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} The detector type string.
 */
export const getDetectorType = (state) => state.ui.detectorType;

/**
 * Returns the detector config type string.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} The detector config type string.
 */
export const getDetectorConfigType = (state) => state.ui.detectorConfigType;

/**
 * Returns the series type string.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} The series type string.
 */
export const getSeriesType = (state) => state.ui.seriesType;

/**
 * Returns the study type string.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} The study type string.
 */
export const getStudyType = (state) => state.ui.studyType;

/**
 * Returns the boolean whether settings is visible.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} The boolean whether settings is visible.
 */
export const getSettingsVisibility = (state) => state.ui.isSettingsVisible;

/**
 * Returns an object containing the configuration info.
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {{detectorType: string, detectorConfigType: string, seriesType: string, studyType: string}} An object containing the configuration info.
 */
export const getConfigInfo = (state) => {
    const configInfo = {
        detectorType: state.ui.detectorType,
        detectorConfigType: state.ui.detectorConfigType,
        seriesType: state.ui.seriesType,
        studyType: state.ui.studyType,
    };
    return configInfo;
};

/**
 * Returns whether the UI should display a single viewport or multiple viewports
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} Returns whether the UI should display a single viewport or multiple viewports
 */
export const getSingleViewport = (state) => state.ui.singleViewport;

/**
 * Returns whether the UI should display the edit label widget
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} Returns whether the UI should display the edit label widget
 */
export const getIsEditLabelWidgetVisible = (state) =>
    state.ui.isEditLabelWidgetVisible;

/**
 * Returns several items from the uiSlice in an object that are
 * zoomSide, zoomTop, detectionLabelEditViewport, detectionLabelEditPosition
 * detectionLabelEditWidth, detectionLabelEditFont, and isEditLabelWidgetVisible
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {{zoomSide: number, zoomTop: number, viewport: constants.viewport, position: {x: number, y: number}, width: number, font: string, isVisible: boolean}} Returns several items from the uiSlice in an object
 */
export const getDetectionContextInfo = (state) => {
    return {
        zoomSide: state.ui.zoomLevelSide,
        zoomTop: state.ui.zoomLevelTop,
        viewport: state.ui.detectionLabelEditViewport,
        position: state.ui.detectionLabelEditPosition,
        width: state.ui.detectionLabelEditWidth,
        font: state.ui.detectionLabelEditFont,
        isVisible: state.ui.isEditLabelWidgetVisible,
    };
};

/**
 * Returns the collapsedSideMenu boolean
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} The collapsedSideMenu boolean
 */
export const getCollapsedSideMenu = (state) => state.ui.collapsedSideMenu;

/**
 * Returns the collapsedLazyMenu boolean
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} The collapsedLazyMenu boolean
 */
export const getCollapsedLazyMenu = (state) => state.ui.collapsedLazyMenu;

/**
 * Returns the receiveTime date object
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Date} The receiveTime date object
 */
export const getReceivedTime = (state) => state.ui.receiveTime;

/**
 * Returns the colorPickerVisible boolean
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} The colorPickerVisible boolean
 */
export const getColorPickerVisible = (state) => state.ui.colorPickerVisible;

/**
 * Returns the number of files in queue
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {number} The number of files in queue
 */
export const getNumberOfFiles = (state) => state.ui.numberOfFiles;

/**
 * Returns the localFileOpen boolean
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} The localFileOpen boolean
 */
export const getLocalFileOpen = (state) => state.ui.localFileOpen;

/**
 * Returns the current file format
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {string} The current file format
 */
export const getCurrentFileFormat = (state) => state.ui.currentFileFormat;

/**
 * Returns whether the scroll wheel has been fired recently
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} The recentScroll boolean determining if scroll wheel has been fired recently
 */
export const getRecentScroll = (state) => state.ui.recentScroll;
export const getGeneratingThumbnails = (state) => state.ui.generatingThumbnails;

// Exporting the Actions for the Reducers
export const {
    updateCornerstoneMode,
    updateFABVisibility,
    updateIsDetectionContextVisible,
    updateEditionMode,
    emptyAreaClickUpdate,
    onMouseLeaveNoFilesUpdate,
    detectionSelectedUpdate,
    labelSelectedUpdate,
    deleteDetectionUpdate,
    exitEditionModeUpdate,
    menuDetectionSelectedUpdate,
    updateDetectionContextPosition,
    updateZoomLevels,
    updateZoomLevelTop,
    updateZoomLevelSide,
    selectConfigInfoUpdate,
    newFileReceivedUpdate,
    hideContextMenuUpdate,
    onDragEndWidgetUpdate,
    resetSelectedDetectionBoxesUpdate,
    resetSelectedDetectionBoxesElseUpdate,
    onLabelEditionEnd,
    toggleSettingsVisibility,
    setInputLabel,
    toggleCollapsedSideMenu,
    toggleCollapsedLazyMenu,
    setReceiveTime,
    colorPickerToggle,
    setLocalFileOpen,
    setCurrentFileFormat,
    updateEditLabelPosition,
    updateRecentScroll,
    setGeneratingThumbnails,
} = uiSlice.actions;

// Export the reducer for the store
export default uiSlice.reducer;
