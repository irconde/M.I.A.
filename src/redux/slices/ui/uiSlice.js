import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';

const initialState = {
    cornerstoneMode: constants.cornerstoneMode.SELECTION,
    isFABVisible: false,
    isDrawingBoundingBox: false,
    isDetectionContextVisible: false,
    displaySelectedBoundingBox: false,
    detectionContextPosition: {
        top: 0,
        left: 0,
    },
    editionMode: null,
    detectionLabelEditWidth: '0px',
    detectionLabelEditPosition: {
        top: 0,
        left: 0,
    },
    zoomLevelTop: constants.viewportStyle.ZOOM,
    zoomLevelSide: constants.viewportStyle.ZOOM,
    singleViewport: true,
    receiveTime: null,
    selectedFile: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        /**
         * updateCornerstoneMode
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {constants.cornerstoneMode} action.payload - Constant value for the cornerstone mode.
         */
        updateCornerstoneMode: (state, action) => {
            state.cornerstoneMode = action.payload;
        },
        /**
         * updateFABVisibility
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean to determine if we should display the FAB.
         */
        updateFABVisibility: (state, action) => {
            state.isFABVisible = action.payload;
        },
        /**
         * updateIsDrawingBoundingBox
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean value for if we are currently drawing a bounding box
         */
        updateIsDrawingBoundingBox: (state, action) => {
            state.isDrawingBoundingBox = action.payload;
        },
        /**
         * updateIsDetectionContextVisible
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean value for if we should display the detection context widget, for a selected detection.
         */
        updateIsDetectionContextVisible: (state, action) => {
            state.isDetectionContextVisible = action.payload;
        },
        /**
         * updateDisplaySelectedBoundingBox
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean value to determine if we need to display a selected bounding box, or a selected detection.
         */
        updateDisplaySelectedBoundingBox: (state, action) => {
            state.displaySelectedBoundingBox = action.payload;
        },
        /**
         * updateEditionMode
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {constants.editionMode} action.payload - Constant value for the edition mode.
         */
        updateEditionMode: (state, action) => {
            state.editionMode = action.payload;
        },
        /**
         * updateDetectionContextPosition
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action.payload - Object containing values for top and left position for the detection context position.
         */
        updateDetectionContextPosition: (state, action) => {
            const { top, left } = action.payload;
            state.detectionContextPosition.top = top;
            state.detectionContextPosition.left = left;
        },
        /**
         * emptyAreaClickUpdate - This resets UI elements related to selecting a detection.
         *                        It will set the FAB to be visible, reset the cornerstone mode to selection,
         *                        set display selected bounding box to false, the edition mode to null, the
         *                        detection context to not be visible and reset its position.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        emptyAreaClickUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.editionMode = null;
            state.isDetectionContextVisible = false;
            state.detectionContextPosition.top = 0;
            state.detectionContextPosition.left = 0;
        },
        /**
         * detectionSelectedUpdate - This sets UI elements related to selecting a detection. It will set the
         *                           FAB to not be visible, the cornerstone mode to edition, display the selected
         *                           bounding box to true, the edition mode to null and the detection context widget
         *                           to display.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        detectionSelectedUpdate: (state) => {
            state.isFABVisible = false;
            state.cornerstoneMode = constants.cornerstoneMode.EDITION;
            state.displaySelectedBoundingBox = true;
            state.isDetectionContextVisible = true;
            state.editionMode = null;
        },
        /**
         * algorithmSelectedUpdate - For when a user selects an algorithm from the side menu. Will set the UI elements
         *                           for FAB to not be visible, cornerstone mode to selection, displaying the selected bounding
         *                           box to false, and the detection context visibility.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        algorithmSelectedUpdate: (state) => {
            state.isFABVisible = false;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.isDetectionContextVisible = false;
        },
        /**
         * menuDetectionSelectedUpdate - For when a user selects a detection from the side menu. Will set the UI elements
         *                               for cornerstone mode to edition, display the selected bounding box and the detection
         *                               context widget to be visible.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        menuDetectionSelectedUpdate: (state) => {
            state.cornerstoneMode = constants.cornerstoneMode.EDITION;
            state.displaySelectedBoundingBox = true;
            state.isDetectionContextVisible = true;
        },
        /**
         * labelSelectedUpdate - For when a user selects an label from the detection context widget. Will set the UI elements
         *                       edition mode to be Label, the detection context to not be visible, the edit label width, and its position.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action.payload - Object containing the width of the label, and an top & left values for the position.
         */
        labelSelectedUpdate: (state, action) => {
            const { width, position } = action.payload;
            state.editionMode = constants.editionMode.LABEL;
            state.isDetectionContextVisible = false;
            state.detectionLabelEditWidth = width;
            state.detectionLabelEditPosition.top = position.top;
            state.detectionLabelEditPosition.left = position.left;
        },
        /**
         * TODO - James B. - Are we supposed to exit the edition of a detection when finishing labeling a detection?
         * labelCompleteUpdate - For when a user finishes selecting a label for a detection. Will set the UI elements
         *                       for FAB to be visible, the cornerstone mode to selection, displaying the selected
         *                       bounding box to false, the edition mode to null, the detection label edit widget
         *                       width and position to 0.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        labelCompleteUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.editionMode = null;
            state.detectionLabelEditWidth = 0;
            state.detectionLabelEditPosition.top = 0;
            state.detectionLabelEditPosition.left = 0;
        },
        /**
         * deleteDetectionUpdate - For when a user deletes a detection. Will set the UI elements for FAB to be visible,
         *                         the cornerstone mode to selection, to not display the selected bounding box, the
         *                         detection context to not be visible and drawing bounding box to false.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        deleteDetectionUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.isDetectionContextVisible = false;
            state.isDrawingBoundingBox = false;
        },
        /**
         * boundingBoxSelectedUpdate - For when a user enters annotation mode for a new detection. Sets the UI elements for
         *                             cornerstone mode to annotation and to display the selected bounding box.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        boundingBoxSelectedUpdate: (state) => {
            state.cornerstoneMode = constants.cornerstoneMode.ANNOTATION;
            state.displaySelectedBoundingBox = true;
        },
        /**
         * exitEditionModeUpdate - For when a user exits edition mode. Sets the UI elements for edition mode to null and
         *                         to not display the detection context widget.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        exitEditionModeUpdate: (state) => {
            state.editionMode = null;
            state.isDetectionContextVisible = false;
        },
        /**
         * updateZoomLevels - For when the UI recalculates the zoom level for the cornerstone viewports.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action.payload - Object containing the zoom levels for both top and side.
         */
        updateZoomLevels: (state, action) => {
            const { zoomLevelTop, zoomLevelSide } = action.payload;
            state.zoomLevelTop = zoomLevelTop;
            state.zoomLevelSide = zoomLevelSide;
        },
        /**
         * updateZoomLevelTop - Updates the top level zoom to the passed in number
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Number} action - Number containing the zoom level
         */
        updateZoomLevelTop: (state, action) => {
            state.zoomLevelTop = action.payload;
        },
        /**
         * updateZoomLevelSide - Updates the side level zoom to the passed in number
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Number} action - Number containing the zoom level
         */
        updateZoomLevelSide: (state, action) => {
            state.zoomLevelSide = action.payload;
        },
        /**
         * newFileReceivedUpdate - Occurs when the UI receives a new Ora DICOS file from the file server. Sets the UI elements
         *                         for single viewport, the received time, and that we have received a file flag.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action.payload - Object containing a boolean value for single viewport and the Date for the received time.
         */
        newFileReceivedUpdate: (state, action) => {
            const { singleViewport, receiveTime } = action.payload;
            state.singleViewport = singleViewport;
            state.receiveTime = receiveTime;
            state.selectedFile = true;
        },
        /**
         * newFileReceivedUpdate - Occurs when the UI receives a new Ora DICOS file from the file server. Sets the UI elements
         *                         for single viewport, the received time, and that we have received a file flag.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Boolean value for if we have received a file.
         */
        updateSelectedFile: (state, action) => {
            state.selectedFile = action.payload;
        },
        /**
         * onNoImageUpdate - Occurs when the UI does not have another file to process from the file server. Will set the UI
         *                   elements for the FAB to not be visible and the selected file to false.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        onNoImageUpdate: (state) => {
            state.isFABVisible = false;
            state.selectedFile = false;
        },
    },
});

/**
 * getIsFabVisible
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} Returns wether the FAB is Visible
 */
export const getIsFabVisible = (state) => state.ui.isFABVisible;
/**
 * getCornerstoneMode
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {constants.cornerstoneMode} Returns the current cornerstone mode
 */
export const getCornerstoneMode = (state) => state.ui.cornerstoneMode;
/**
 * getDisplaySelectedBoundingBox
 * @param {State} state Passed in via useSelector
 * @returns {Boolean} Wether we are displaying a selected bounding box
 */
export const getDisplaySelectedBoundingBox = (state) =>
    state.ui.displaySelectedBoundingBox;
/**
 * getEditionMode
 * @param {State} state Passed in via useSelector
 * @returns {constants.editionMode} The constant for the current edition mode.
 */
export const getEditionMode = (state) => state.ui.editionMode;
/**
 * getIsDetectionContextVisible
 * @param {State} state Passed in via useSelector
 * @returns {Boolean} Returns if we are displaying the detection context widget, if a detection is selected
 */
export const getIsDetectionContextVisible = (state) =>
    state.ui.isDetectionContextVisible;
/**
 * getDetectionContextPosition
 * @param {State} state Passed in via useSelector
 * @returns {Object} Object containing the position in terms of top, and left values
 */
export const getDetectionContextPosition = (state) =>
    state.ui.detectionContextPosition;
/**
 * getDetectionLabelEditWidth
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Number} Returns how large the detection label edition should be in width
 */
export const getDetectionLabelEditWidth = (state) =>
    state.ui.detectionLabelEditWidth;
/**
 * getDetectionLabelEditPosition
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Object} Returns an object with top and left values for the position of the edit label widget.
 */
export const getDetectionLabelEditPosition = (state) =>
    state.ui.detectionLabelEditPosition;
/**
 * getZoomLevelTop
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Number} The calculated zoom for cornerstone for the top(or left) view.
 */
export const getZoomLevelTop = (state) => state.ui.zoomLevelTop;
/**
 * getZoomLevelSide
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Number} The calculated zoom for cornerstone for the side(or right) view.
 */
export const getZoomLevelSide = (state) => state.ui.zoomLevelSide;
/**
 * getSingleViewport
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} Returns wether the UI should display a single viewport or multiple viewports
 */
export const getSingleViewport = (state) => state.ui.singleViewport;

// Exporting the Actions for the Reducers
export const {
    updateCornerstoneMode,
    updateFABVisibility,
    updateIsDrawingBoundingBox,
    updateIsDetectionContextVisible,
    updateDisplaySelectedBoundingBox,
    updateEditionMode,
    emptyAreaClickUpdate,
    detectionSelectedUpdate,
    algorithmSelectedUpdate,
    labelSelectedUpdate,
    labelCompleteUpdate,
    deleteDetectionUpdate,
    boundingBoxSelectedUpdate,
    exitEditionModeUpdate,
    menuDetectionSelectedUpdate,
    updateDetectionContextPosition,
    updateZoomLevels,
    updateZoomLevelTop,
    updateZoomLevelSide,
    newFileReceivedUpdate,
    updateSelectedFile,
    onNoImageUpdate,
} = uiSlice.actions;

// Export the reducer for the store
export default uiSlice.reducer;
