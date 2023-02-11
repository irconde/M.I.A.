import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../utils/enums/Constants';

const initialState = {
    annotationContextPosition: {
        top: 0,
        left: 0,
    },
    annotationContextVisible: false,
    cornerstoneMode: constants.cornerstoneMode.SELECTION,
    annotationMode: constants.annotationMode.NO_TOOL,
    editionMode: constants.editionMode.NO_TOOL,
    colorPickerVisible: false,
    editLabelVisibility: false,
    inputLabel: '',
    zoomLevel: 0,
    sideMenuVisible: true,
    lazyImageMenuVisible: false,
    fabVisible: true,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSideMenu: (state, action) => {
            state.sideMenuVisible = !state.sideMenuVisible;
        },
        updateAnnotationContextPosition: (state, action) => {
            const { top, left } = action.payload;
            state.annotationContextPosition.top = top;
            state.annotationContextPosition.left = left;
            state.annotationContextVisible = top !== 0 && left !== 0;
        },
        updateAnnotationContextVisibility: (state, action) => {
            state.annotationContextVisible = action.payload;
        },
        updateColorPickerVisibility: (state, action) => {
            state.colorPickerVisible = action.payload;
        },
        updateZoomLevel: (state, action) => {
            state.zoomLevel = action.payload;
        },
        updateEditLabelVisibility: (state, action) => {
            state.editLabelVisibility = action.payload;
        },
        setInputLabel: (state, action) => {
            state.inputLabel = action.payload;
        },
        clearAnnotationWidgets: (state, action) => {
            state.annotationContextPosition.top = 0;
            state.annotationContextPosition.left = 0;
            state.annotationContextVisible = false;
            state.editLabelVisibility = false;
            state.colorPickerVisible = false;
            state.editionMode = constants.editionMode.NO_TOOL;
        },
        updateCornerstoneMode: (state, action) => {
            state.cornerstoneMode = action.payload;
        },
        updateAnnotationMode: (state, action) => {
            state.annotationMode = action.payload;
        },
        updateEditionMode: (state, action) => {
            state.editionMode = action.payload;
        },
    },
});

export const {
    toggleSideMenu,
    updateAnnotationContextPosition,
    updateZoomLevel,
    updateColorPickerVisibility,
    updateAnnotationContextVisibility,
    updateEditLabelVisibility,
    setInputLabel,
    clearAnnotationWidgets,
    updateEditionMode,
    updateCornerstoneMode,
    updateAnnotationMode,
} = uiSlice.actions;

export const getAnnotationContextPosition = (state) =>
    state.ui.annotationContextPosition;
export const getAnnotationContextVisible = (state) =>
    state.ui.annotationContextVisible;
export const getCornerstoneMode = (state) => state.ui.cornerstoneMode;
export const getAnnotationMode = (state) => state.ui.annotationMode;
export const getEditionMode = (state) => state.ui.editionMode;
export const getColorPickerVisible = (state) => state.ui.colorPickerVisible;
export const getEditLabelVisible = (state) => state.ui.editLabelVisibility;
export const getZoomLevel = (state) => state.ui.zoomLevel;
export const getInputLabel = (state) => state.ui.inputLabel;
export const getSideMenuVisible = (state) => state.ui.sideMenuVisible;
export const getLazyImageMenuVisible = (state) => state.ui.lazyImageMenuVisible;
export const getIsFABVisible = (state) => state.ui.fabVisible;
export default uiSlice.reducer;
