import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../utils/enums/Constants';

const initialState = {
    annotationContextVisible: false,
    cornerstoneMode: constants.cornerstoneMode.SELECTION,
    annotationMode: constants.annotationMode.NO_TOOL,
    editionMode: constants.editionMode.NO_TOOL,
    colorPickerVisible: false,
    editLabelVisibility: false,
    zoomLevel: 0,
    currentFileName: '',
    sideMenuVisible: true,
    lazyImageMenuVisible: false,
    fabVisible: true,
    splashScreenVisible: true,
    showApp: false,
    isImageToolsOpen: false,
    manualSideMenuToggle: false,
    // when the user clicks on a thumbnail to open the file
    // we use this boolean to indicate waiting on electron to send an update
    isLoadingFile: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSideMenu: (state, action) => {
            state.sideMenuVisible = !state.sideMenuVisible;
            state.manualSideMenuToggle = !state.manualSideMenuToggle;
        },
        setSideMenu: (state, action) => {
            state.sideMenuVisible = action.payload;
        },
        toggleLazySideMenu: (state, action) => {
            state.lazyImageMenuVisible = !state.lazyImageMenuVisible;
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
        clearAnnotationWidgets: (state, action) => {
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
        updateCurrFileName: (state, action) => {
            state.currentFileName = action.payload;
        },
        updateSplashScreenVisibility: (state, action) => {
            state.splashScreenVisible = action.payload;
        },
        updateShowApp: (state, action) => {
            state.showApp = action.payload;
        },
        updateFABVisibility: (state, action) => {
            state.isFABVisible = action.payload;
        },
        updateIsImageToolsOpen: (state, action) => {
            state.isImageToolsOpen = action.payload;
        },
        updateIsLoadingFile: (state, action) => {
            state.isLoadingFile = action.payload;
        },
    },
});

export const {
    toggleSideMenu,
    setSideMenu,
    toggleLazySideMenu,
    updateZoomLevel,
    updateColorPickerVisibility,
    updateAnnotationContextVisibility,
    updateEditLabelVisibility,
    clearAnnotationWidgets,
    updateEditionMode,
    updateCornerstoneMode,
    updateAnnotationMode,
    updateCurrFileName,
    updateSplashScreenVisibility,
    updateShowApp,
    updateFABVisibility,
    updateIsImageToolsOpen,
    updateIsLoadingFile,
} = uiSlice.actions;

export const getAnnotationContextVisible = (state) =>
    state.ui.annotationContextVisible;
export const getCornerstoneMode = (state) => state.ui.cornerstoneMode;
export const getAnnotationMode = (state) => state.ui.annotationMode;
export const getEditionMode = (state) => state.ui.editionMode;
export const getColorPickerVisible = (state) => state.ui.colorPickerVisible;
export const getEditLabelVisible = (state) => state.ui.editLabelVisibility;
export const getZoomLevel = (state) => state.ui.zoomLevel;
export const getCurrFileName = (state) => state.ui.currentFileName;

export const getSideMenuVisible = (state) => state.ui.sideMenuVisible;
export const getLazyImageMenuVisible = (state) => state.ui.lazyImageMenuVisible;
export const getIsFABVisible = (state) => state.ui.fabVisible;
export const getSplashScreenVisibility = (state) =>
    state.ui.splashScreenVisible;
export const getShowApp = (state) => state.ui.showApp;
export const getIsImageToolsOpen = (state) => state.ui.isImageToolsOpen;
export const getIsLoadingFile = (state) => state.ui.isLoadingFile;
export const getIsManualSideMenuToggle = (state) =>
    state.ui.manualSideMenuToggle;

export default uiSlice.reducer;
