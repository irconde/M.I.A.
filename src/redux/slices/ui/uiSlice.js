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
         * Sets whether the Electron process is generating thumbnails or not
         * @param {State} state
         * @param {{payload: Boolean}} action
         */
        setGeneratingThumbnails: (state, action) => {
            state.generatingThumbnails = action.payload;
        },
        /**
         * Toggles the visibility of the side menu
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {{cornerstone: CornerstoneObject, desktopMode: Boolean}} action.payload - Contains cornerstone object and whether in desktop mode
         */
        toggleCollapsedSideMenu: (state, action) => {
            const { cornerstone, desktopMode } = action.payload;
            state.collapsedSideMenu = !state.collapsedSideMenu;
            Utils.calculateViewportDimensions(
                cornerstone,
                state.singleViewport,
                state.collapsedSideMenu,
                desktopMode ? state.collapsedLazyMenu : true,
                desktopMode
            );
        },
        /**
         * Sets the visibility of the side menu
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {{cornerstone: CornerstoneObject, desktopMode: Boolean, newState: Boolean}} action.payload - Contains cornerstone object, whether in desktop mode, and whether sidemenu is should be open
         */
        setCollapsedSideMenu: (state, action) => {
            const { cornerstone, desktopMode, collapsedSideMenu } =
                action.payload;
            state.collapsedSideMenu = collapsedSideMenu;
            Utils.calculateViewportDimensions(
                cornerstone,
                state.singleViewport,
                state.collapsedSideMenu,
                desktopMode ? state.collapsedLazyMenu : true,
                desktopMode
            );
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
         * @param {string} action.payload - String value of new input label
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
         * @param {{top: number, left: number}} detectionLabelEditPosition - Destructured from action.payload -- Updated position for detection edit label.
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
         * @param {{top: number, left: number}} detectionLabelEditPosition - Destructured from action.payload -- position of detection edit label
         */
        updateEditLabelPosition: (state, action) => {
            const { detectionLabelEditWidth, detectionLabelEditPosition } =
                action.payload;
            state.detectionLabelEditWidth = detectionLabelEditWidth;
            state.detectionLabelEditPosition = detectionLabelEditPosition;
        },

        /**
         * Sets the UI elements for edition mode to null and to not display the detection context widget.
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
         * @param {boolean} action.payload - Boolean to determine if we should display the FAB.
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
         * Sets the UI elements edition mode to be Label, the detection context to not be visible, the edit label width, and its position.
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
         * @param {boolean} action.payload - Boolean value for if we should display the detection context widget, for a selected detection.
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
         * Updates the zoom level for the cornerstone viewports.
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
         * @param {number} action - Number containing the zoom level
         */
        updateZoomLevelTop: (state, action) => {
            state.zoomLevelTop = action.payload;
        },
        /**
         * Updates the side level zoom to the passed in number
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {number} action - Number containing the zoom level
         */
        updateZoomLevelSide: (state, action) => {
            state.zoomLevelSide = action.payload;
        },
        /**
         * Updates new detection edit label width/position and new context menu position in response to onDragEnd event
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {number} detectionLabelEditWidth - Destructured from action.payload -- Width of detection edit label
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
         * Updates the UI when the UI receives a new Ora DICOS file from the file server
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
         * Resets UI elements involved in selecting a detection.
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
         * Resets UI elements when the user mouse leaves the window and there are no files in the queue.
         *
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
         * Updates the UI when a detection is updated.
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
         * Updates the UI when a detection is deleted.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        deleteDetectionUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.isDetectionContextVisible = false;
        },
        /**
         * Updates the configuration information for specific detections
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} detectorType - Destructured from action.payload -- Detector type of detection
         * @param {string} detectorConfigType - Destructured from action.payload -- Detector config type of detection
         * @param {string} seriesType - Destructured from action.payload -- Series type of detection
         * @param {string} studyType - Destructured from action.payload -- Study type of detection
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
         * Sets boolean value determining whether display the settings component.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {boolean} action.payload - Boolean value determining whether display the settings component.
         */
        setDisplaySettings: (state, action) => {
            state.displaySettings = action.payload;
        },
        /**
         * Set boolean value determining whether display the settings modal window.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {boolean} action.payload - Boolean value determining whether display the settings modal window.
         */
        toggleSettingsVisibility: (state, action) => {
            state.isSettingsVisible = action.payload;
        },
        /**
         * Sets the receive time. Used to set time of recieval of newly obtained files.
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {string} action.payload - String result from Date.now()
         */
        setReceiveTime: (state, action) => {
            state.receiveTime = action.payload;
        },
        /**
         * Toggles the color picker's visibility
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        colorPickerToggle: (state) => {
            state.colorPickerVisible = !state.colorPickerVisible;
        },
        /**
         * Determines whether the App is working with a local file or remote file
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {boolean} action.payload - True if we have a local file open, false if not, whether remote or not.
         */
        setLocalFileOpen: (state, action) => {
            state.localFileOpen = action.payload;
        },
        /**
         * Sets the current file format (Supported types: MS COCO, DICOS-TDR)
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {constants.SETTINGS.ANNOTATIONS} action.payload - Format of currently processed file
         */
        setCurrentFileFormat: (state, action) => {
            state.currentFileFormat = action.payload;
        },
        /**
         * Enables scrolling temporarily (1000ms)
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        updateRecentScroll: (state, action) => {
            state.recentScroll = action.payload;
        },
    },
});

/**
 * Provides the current detection label
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - Current detection label
 */
export const getInputLabel = (state) => state.ui.inputLabel;
/**
 * Indicated whether the FAB is visible
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True when FAB is visible; False otherwise
 */
export const getIsFabVisible = (state) => state.ui.isFABVisible;
/**
 * Indicates whether the display settings component is visible
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True when the display settings component is visible; false otherwise
 */
export const getDisplaySettings = (state) => state.ui.displaySettings;
/**
 * Provides the current cornerstone mode
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {constants.cornerstoneMode} - Current cornerstone mode
 */
export const getCornerstoneMode = (state) => state.ui.cornerstoneMode;
/**
 * Indicates the current edition mode.
 *
 * @param {State} state - Passed in via useSelector
 * @returns {constants.editionMode} - Current edition mode.
 */
export const getEditionMode = (state) => state.ui.editionMode;
/**
 * Indicates whether the detection context widget when a detection is selected is being displayed
 *
 * @param {State} state - Passed in via useSelector
 * @returns {boolean} - Value displaying the detection context widget, if a detection is selected
 */
export const getIsDetectionContextVisible = (state) =>
    state.ui.isDetectionContextVisible;
/**
 * Provides the location of detection context menu
 *
 * @param {State} state - Passed in via useSelector
 * @returns {{top: number, left: number}} - Object containing the position in terms of top, and left values
 */
export const getDetectionContextPosition = (state) =>
    state.ui.detectionContextPosition;
/**
 * Provides the length of the text box for editing the detection label
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {number} - Number of characters in the text box for editing the detection label
 */
export const getDetectionLabelEditWidth = (state) =>
    state.ui.detectionLabelEditWidth;
/**
 * Indicates the font string used for the text box for editing the detection label
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - Font string of the detection label edition
 */
export const getDetectionLabelEditFont = (state) =>
    state.ui.detectionLabelEditFont;
/**
 * Provides the viewport of the text box for editing the detection label
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - Viewport that holds the text box for editing the detection label
 */
export const getDetectionLabelEditViewport = (state) =>
    state.ui.detectionLabelEditViewport;
/**
 * Provides the location of the edit label widget.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {{top: number, left: number}} - Top and left values for the location of the edit label widget.
 */
export const getDetectionLabelEditPosition = (state) =>
    state.ui.detectionLabelEditPosition;
/**
 * Provides the calculated zoom for the top view.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {number} - The calculated zoom for the top view.
 */
export const getZoomLevelTop = (state) => state.ui.zoomLevelTop;

/**
 * Provides the calculated zoom for the side view.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {number} - The calculated zoom for the side view.
 */
export const getZoomLevelSide = (state) => state.ui.zoomLevelSide;

/**
 * Provides the calculated zoom for the top and the side views.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {{zoomLevelTop: number, zoomLevelSide: number}} - The calculated zoom for cornerstone for the top and side views.
 */
export const getZoomLevels = (state) => {
    return {
        zoomLevelTop: state.ui.zoomLevelTop,
        zoomLevelSide: state.ui.zoomLevelSide,
    };
};

/**
 * Indicates the detector type.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - Detector type
 */
export const getDetectorType = (state) => state.ui.detectorType;

/**
 * Indicates the detector config type.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - Detector config type
 */
export const getDetectorConfigType = (state) => state.ui.detectorConfigType;

/**
 * Indicates the series type.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - Series type
 */
export const getSeriesType = (state) => state.ui.seriesType;

/**
 * Indicates the study type.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - Study type
 */
export const getStudyType = (state) => state.ui.studyType;

/**
 * Indicates whether settings are visible.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - True when settings are visible; false otherwise
 */
export const getSettingsVisibility = (state) => state.ui.isSettingsVisible;

/**
 * Provides the configuration info.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {{detectorType: string, detectorConfigType: string, seriesType: string, studyType: string}} - Configuration info
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
 * Indicates whether the UI should display a single viewport
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True if the UI should display a single viewport; false otherwise
 */
export const getSingleViewport = (state) => state.ui.singleViewport;

/**
 * Indicates whether the UI should display the edit label widget
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True if the UI should display the edit label widget; false otherwise
 */
export const getIsEditLabelWidgetVisible = (state) =>
    state.ui.isEditLabelWidgetVisible;

/**
 * Provides detection context info
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {{zoomSide: number, zoomTop: number, viewport: constants.viewport, position: {x: number, y: number}, width: number, font: string, isVisible: boolean}} -  Context info - Items from the uiSlice in an object
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
 * Indicates whether the right side menu is collapsed
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True if the right side menu is collapsed; false otherwise
 */
export const getCollapsedSideMenu = (state) => state.ui.collapsedSideMenu;

/**
 * Indicates whether the left side menu is collapsed
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True if the left side menu is collapsed; false otherwise
 */
export const getCollapsedLazyMenu = (state) => state.ui.collapsedLazyMenu;

/**
 * Returns the receiveTime date object. Ocassionally used to determine if there is file to be processed (returns null if no file).
 *
 * @param {State} state Passed in via useSelector/mapStateToProps
 * @returns {Date} The receiveTime date object
 */
export const getReceivedTime = (state) => state.ui.receiveTime;

/**
 * Indicates whether the color picker is visible
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True if the color picker is visible; false otherwise
 */
export const getColorPickerVisible = (state) => state.ui.colorPickerVisible;

/**
 * Provides the number of files in queue
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {number} - Number of files in queue
 */
export const getNumberOfFiles = (state) => state.ui.numberOfFiles;

/**
 * Returns the localFileOpen boolean. True if there is currently a local file open, rather than a remote connection file.
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - The localFileOpen boolean
 */
export const getLocalFileOpen = (state) => state.ui.localFileOpen;

/**
 * Indicates the current file format
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {string} - The current file format
 */
export const getCurrentFileFormat = (state) => state.ui.currentFileFormat;

/**
 * Indicates whether the scroll wheel has been fired recently
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True if scroll wheel has been fired recently; false otherwise
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
    setCollapsedSideMenu,
} = uiSlice.actions;

// Export the reducer for the store
export default uiSlice.reducer;
