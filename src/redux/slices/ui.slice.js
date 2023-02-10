import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../utils/enums/Constants';

const initialState = {
    collapsedSideMenu: false,
    annotationContextPosition: {
        top: 0,
        left: 0,
    },
    annotationContextVisible: false,
    editionMode: constants.editionMode.NO_TOOL,
    colorPickerVisible: false,
    editLabelVisibility: false,
    inputLabel: '',
    zoomLevel: 0,
    isLazyMenuCollapsed: false,
    currentFileName: '',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSideMenu: (state, action) => {
            state.collapsedSideMenu = !state.collapsedSideMenu;
        },
        toggleLazySideMenu: (state, action) => {
            state.isLazyMenuCollapsed = !state.isLazyMenuCollapsed;
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
        updateEditionMode: (state, action) => {
            state.editionMode = action.payload;
        },
        updateCurrFileName: (state, action) => {
            state.currentFileName = action.payload;
        },
    },
});

export const {
    toggleSideMenu,
    toggleLazySideMenu,
    updateAnnotationContextPosition,
    updateZoomLevel,
    updateColorPickerVisibility,
    updateAnnotationContextVisibility,
    updateEditLabelVisibility,
    setInputLabel,
    clearAnnotationWidgets,
    updateEditionMode,
    updateCurrFileName,
} = uiSlice.actions;

export const getCollapsedSideMenu = (state) => state.ui.collapsedSideMenu;
export const getIsLazyMenuCollapsed = (state) => state.ui.isLazyMenuCollapsed;
export const getAnnotationContextPosition = (state) =>
    state.ui.annotationContextPosition;
export const getAnnotationContextVisible = (state) =>
    state.ui.annotationContextVisible;
export const getEditionMode = (state) => state.ui.editionMode;
export const getColorPickerVisible = (state) => state.ui.colorPickerVisible;
export const getEditLabelVisible = (state) => state.ui.editLabelVisibility;
export const getZoomLevel = (state) => state.ui.zoomLevel;
export const getInputLabel = (state) => state.ui.inputLabel;
export const getCurrFileName = (state) => state.ui.currentFileName;

export default uiSlice.reducer;
