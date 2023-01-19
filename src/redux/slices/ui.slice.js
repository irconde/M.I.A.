import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    collapsedSideMenu: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSideMenu: (state, action) => {
            state.collapsedSideMenu = !state.collapsedSideMenu;
        },
    },
});

export const { toggleSideMenu } = uiSlice.actions;

export const getCollapsedSideMenu = (state) => state.ui.collapsedSideMenu;

export default uiSlice.reducer;
