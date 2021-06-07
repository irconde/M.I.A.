import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';

const initialState = {
    editionMode: constants.editionMode.NO_TOOL,
    cornerstoneMode: constants.cornerstoneMode.SELECTION,
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
    singleViewport: true,
    receiveTime: null,
    selectedFile: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        /**
         * updateEditionMode
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {constants.editionMode} action.payload - Constant value for the edition mode.
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
                    state.detectionLabelEditPosition = detectionLabelEditPosition;
            }
        },
        /**
         * exitEditionModeUpdate - For when a user exits edition mode. Sets the UI elements for edition mode to null and
         *                         to not display the detection context widget.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        exitEditionModeUpdate: (state) => {
            state.isDetectionContextVisible = false;
            state.isEditLabelWidgetVisible = false;
        },
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
         * onLabelEditionEnd
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action.payload - Object containing values to update the state of the Label edition widget
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
         * labelSelectedUpdate - For when a user selects an label from the detection context widget. Will set the UI elements
         *                       edition mode to be Label, the detection context to not be visible, the edit label width, and its position.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action.payload - Object containing the width of the label, and an top & left values for the position.
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
         * resetSelectedDetectionBoxesUpdate
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
         * resetSelectedDetectionBoxesElseUpdate
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        resetSelectedDetectionBoxesElseUpdate: (state) => {
            (state.isDetectionContextVisible = false),
                (state.editionMode = constants.editionMode.NO_TOOL);
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
         * onDragEndUpdate
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        onDragEndUpdate: (state) => {
            (state.cornerstoneMode = constants.cornerstoneMode.SELECTION),
                (state.editionMode = constants.editionMode.NO_TOOL),
                (state.isFABVisible = true),
                (state.isDetectionContextVisible = false),
                (state.detectionContextPosition = {
                    top: 0,
                    left: 0,
                });
        },
        /**
         * onDragEndUpdate
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
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
         * hideContextMenuUpdate
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        hideContextMenuUpdate: (state) => {
            (state.isDetectionContextVisible = false),
                (state.cornerstoneMode = constants.cornerstoneMode.SELECTION);
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
         * emptyAreaClickUpdate - This resets UI elements related to selecting a detection.
         *                        It will set the FAB to be visible, reset the cornerstone mode to selection,
         *                        set display selected bounding box to false, the edition mode to null, the
         *                        detection context to not be visible and reset its position.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        emptyAreaClickUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.editionMode = constants.editionMode.NO_TOOL;
            state.isDetectionContextVisible = false;
            state.isEditLabelWidgetVisible = false;
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
            state.isDetectionContextVisible = true;
            state.editionMode = constants.editionMode.NO_TOOL;
        },
        /**
         * resetSelectedDetectionBoxesUpdate
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
         * deleteDetectionUpdate - For when a user deletes a detection. Will set the UI elements for FAB to be visible,
         *                         the cornerstone mode to selection, to not display the selected bounding box, the
         *                         detection context to not be visible and drawing bounding box to false.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        deleteDetectionUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.isDetectionContextVisible = false;
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
 * getDetectionLabelEditFont
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} Returns the font string of the detection label edition
 */
export const getDetectionLabelEditFont = (state) =>
    state.ui.detectionLabelEditFont;
/**
 * getDetectionLabelEditViewport
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {String} Returns the viewport of the detection label edition
 */
export const getDetectionLabelEditViewport = (state) =>
    state.ui.detectionLabelEditViewport;
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
/**
 * getIsEditLabelWidgetVisible
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Boolean} Returns wether the UI should display the edit label widget
 */
export const getIsEditLabelWidgetVisible = (state) =>
    state.ui.isEditLabelWidgetVisible;

// Exporting the Actions for the Reducers
export const {
    updateCornerstoneMode,
    updateFABVisibility,
    updateIsDetectionContextVisible,
    updateEditionMode,
    emptyAreaClickUpdate,
    detectionSelectedUpdate,
    labelSelectedUpdate,
    deleteDetectionUpdate,
    exitEditionModeUpdate,
    menuDetectionSelectedUpdate,
    updateDetectionContextPosition,
    updateZoomLevels,
    updateZoomLevelTop,
    updateZoomLevelSide,
    newFileReceivedUpdate,
    updateSelectedFile,
    onNoImageUpdate,
    hideContextMenuUpdate,
    onDragEndUpdate,
    onDragEndWidgetUpdate,
    resetSelectedDetectionBoxesUpdate,
    resetSelectedDetectionBoxesElseUpdate,
    onLabelEditionEnd,
} = uiSlice.actions;

// Export the reducer for the store
export default uiSlice.reducer;
