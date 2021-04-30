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
    detectionLabels: [],
    detectionLabelEditWidth: '0px',
    detectionLabelEditPosition: {
        top: 0,
        left: 0,
    },
    zoomLevelTop: constants.viewportStyle.ZOOM,
    zoomLevelSide: constants.viewportStyle.ZOOM,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        updateCornerstoneMode: (state, action) => {
            state.cornerstoneMode = action.payload;
        },
        updateFABVisibility: (state, action) => {
            state.isFABVisible = action.payload;
        },
        updateIsDrawingBoundingBox: (state, action) => {
            state.isDrawingBoundingBox = action.payload;
        },
        updateIsDetectionContextVisible: (state, action) => {
            state.isDetectionContextVisible = action.payload;
        },
        updateDetectionLabels: (state, action) => {
            state.detectionLabels = action.payload;
        },
        updateDisplaySelectedBoundingBox: (state, action) => {
            state.displaySelectedBoundingBox = action.payload;
        },
        updateEditionMode: (state, action) => {
            state.editionMode = action.payload;
        },
        updateDetectionContextPosition: (state, action) => {
            const { top, left } = action.payload;
            state.detectionContextPosition.top = top;
            state.detectionContextPosition.left = left;
        },
        emptyAreaClickUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.editionMode = null;
            state.isDetectionContextVisible = false;
            state.detectionContextPosition.top = 0;
            state.detectionContextPosition.left = 0;
        },
        detectionSelectedUpdate: (state) => {
            state.isFABVisible = false;
            state.cornerstoneMode = constants.cornerstoneMode.EDITION;
            state.displaySelectedBoundingBox = true;
            state.isDetectionContextVisible = true;
            state.editionMode = null;
        },
        algorithmSelectedUpdate: (state) => {
            state.isFABVisible = false;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.isDetectionContextVisible = false;
        },
        menuDetectionSelectedUpdate: (state) => {
            state.cornerstoneMode = constants.cornerstoneMode.EDITION;
            state.displaySelectedBoundingBox = true;
            state.isDetectionContextVisible = true;
        },
        labelSelectedUpdate: (state, action) => {
            const { width, position } = action.payload;
            state.editionMode = constants.editionMode.LABEL;
            state.isDetectionContextVisible = false;
            state.detectionLabelEditWidth = width;
            state.detectionLabelEditPosition.top = position.top;
            state.detectionLabelEditPosition.left = position.left;
        },
        labelCompleteUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.editionMode = null;
            state.detectionLabelEditWidth = 0;
            state.detectionLabelEditPosition.top = 0;
            state.detectionLabelEditPosition.left = 0;
        },
        deleteDetectionUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.isDetectionContextVisible = false;
            state.isDrawingBoundingBox = false;
        },
        boundingBoxSelectedUpdate: (state) => {
            state.cornerstoneMode = constants.cornerstoneMode.ANNOTATION;
            state.displaySelectedBoundingBox = true;
        },
        resetSelectedDetectionsUpdate: (state) => {
            state.editionMode = null;
            state.isDetectionContextVisible = false;
        },
        updateZoomLevels: (state, action) => {
            const { zoomLevelTop, zoomLevelSide } = action.payload;
            state.zoomLevelTop = zoomLevelTop;
            state.zoomLevelSide = zoomLevelSide;
        },
        updateZoomLevelTop: (state, action) => {
            state.zoomLevelTop = action.payload;
        },
        updateZoomLevelSide: (state, action) => {
            state.zoomLevelSide = action.payload;
        },
    },
});

export const getIsFabVisible = (state) => state.ui.isFABVisible;
export const getCornerstoneMode = (state) => state.ui.cornerstoneMode;
export const getDisplaySelectedBoundingBox = (state) =>
    state.ui.displaySelectedBoundingBox;
export const getEditionMode = (state) => state.ui.editionMode;
export const getIsDetectionContextVisible = (state) =>
    state.ui.isDetectionContextVisible;
export const getDetectionContextPosition = (state) =>
    state.ui.detectionContextPosition;
export const getDetectionLabelEditWidth = (state) =>
    state.ui.detectionLabelEditWidth;
export const getDetectionLabelEditPosition = (state) =>
    state.ui.detectionLabelEditPosition;
export const getZoomLevelTop = (state) => state.ui.zoomLevelTop;
export const getZoomLevelSide = (state) => state.ui.zoomLevelSide;

export const {
    updateCornerstoneMode,
    updateFABVisibility,
    updateIsDrawingBoundingBox,
    updateIsDetectionContextVisible,
    updateDetectionLabels,
    updateDisplaySelectedBoundingBox,
    updateEditionMode,
    emptyAreaClickUpdate,
    detectionSelectedUpdate,
    algorithmSelectedUpdate,
    labelSelectedUpdate,
    labelCompleteUpdate,
    deleteDetectionUpdate,
    boundingBoxSelectedUpdate,
    resetSelectedDetectionsUpdate,
    menuDetectionSelectedUpdate,
    updateDetectionContextPosition,
    updateZoomLevels,
    updateZoomLevelTop,
    updateZoomLevelSide,
} = uiSlice.actions;

export default uiSlice.reducer;
