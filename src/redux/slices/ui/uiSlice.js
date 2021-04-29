import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';

const initialState = {
    cornerstoneMode: constants.cornerstoneMode.SELECTION,
    isFABVisible: false,
    isDrawingBoundingBox: false,
    isDetectionContextVisible: false,
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
    },
});

export const getIsFabVisible = (state) => state.ui.isFABVisible;
export const getCornerstoneMode = (state) => state.ui.cornerstoneMode;

export const {
    updateCornerstoneMode,
    updateFABVisibility,
    updateIsDrawingBoundingBox,
    updateIsDetectionContextVisible,
    updateDetectionLabels,
} = uiSlice.actions;

export default uiSlice.reducer;
