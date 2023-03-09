import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Channels } from '../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

const defaultSettings = {
    selectedImagesDirPath: '',
    selectedAnnotationFile: '',
};

export const initSettings = createAsyncThunk(
    'settings/initSettings',
    async (payload, { rejectWithValue }) => {
        try {
            return await ipcRenderer.invoke(Channels.getSettings);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateSettings = createAsyncThunk(
    'settings/updateSettings',
    async (settingsToUpdate, { rejectedWithValue }) => {
        try {
            await ipcRenderer.invoke(Channels.saveSettings, settingsToUpdate);
            return settingsToUpdate;
        } catch (e) {
            rejectedWithValue(e);
        }
    }
);

const initialState = {
    settings: {},
    isLoading: true,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        updateAnnotationFile: (state, action) => {
            state.settings.selectedAnnotationFile = action.payload;
        },
    },
    extraReducers: {
        [initSettings.fulfilled]: (state, { payload }) => {
            for (let key in payload) {
                state.settings[key] = payload[key];
            }
            state.isLoading = false;
        },
        [initSettings.pending]: (state) => {
            state.isLoading = true;
        },
        [initSettings.rejected]: (state) => {
            state = { isLoading: false, settings: defaultSettings };
        },
        [updateSettings.fulfilled]: (state, { payload }) => {
            for (let key in payload) {
                state.settings[key] = payload[key];
            }
        },
        [updateSettings.rejected]: (state, { payload }) => {
            // TODO: handle saving settings rejection
        },
    },
});

export const { updateAnnotationFile } = settingsSlice.actions;

// Selectors
export const getSettingsLoadingState = (state) => state.settings.isLoading;

export const getAssetsDirPaths = (state) => ({
    selectedImagesDirPath: state.settings.settings.selectedImagesDirPath,
    selectedAnnotationFile: state.settings.settings.selectedAnnotationFile,
});

export default settingsSlice.reducer;
