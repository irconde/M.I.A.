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
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSideMenu: (state, action) => {
            state.collapsedSideMenu = !state.collapsedSideMenu;
        },
        updateAnnotationContextPosition: (state, action) => {
            const { top, left } = action.payload;
            state.annotationContextPosition.top = top;
            state.annotationContextPosition.left = left;
            state.annotationContextVisible = top !== 0 && left !== 0;
        },
    },
});

export const { toggleSideMenu, updateAnnotationContextPosition } =
    uiSlice.actions;

export const getCollapsedSideMenu = (state) => state.ui.collapsedSideMenu;
export const getAnnotationContextPosition = (state) =>
    state.ui.annotationContextPosition;
export const getAnnotationContextVisible = (state) =>
    state.ui.annotationContextVisible;
export const getEditionMode = (state) => state.ui.editionMode;

export default uiSlice.reducer;
