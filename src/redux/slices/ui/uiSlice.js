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
        labelSelectedUpdate: (state) => {
            // TODO payload with the width/position
            state.editionMode = constants.editionMode.LABEL;
            state.isDetectionContextVisible = false;
        },
        labelCompleteUpdate: (state) => {
            state.isFABVisible = true;
            state.cornerstoneMode = constants.cornerstoneMode.SELECTION;
            state.displaySelectedBoundingBox = false;
            state.editionMode = null;
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
    },
});

export const getIsFabVisible = (state) => state.ui.isFABVisible;
export const getCornerstoneMode = (state) => state.ui.cornerstoneMode;
export const getDisplaySelectedBoundingBox = (state) =>
    state.ui.displaySelectedBoundingBox;
export const getEditionMode = (state) => state.ui.editionMode;
export const getIsDetectionContextVisible = (state) =>
    state.ui.isDetectionContextVisible;

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
} = uiSlice.actions;

export default uiSlice.reducer;
