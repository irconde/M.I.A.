import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Channels } from '../../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

const defaultSettings = {
    selectedImagesDirPath: '',
    selectedAnnotationsDirPath: '',
};

export const initSettings = createAsyncThunk(
    'settings/initSettings',
    async (payload, { rejectWithValue }) => {
        try {
            return await ipcRenderer.invoke(Channels.getSettings);
        } catch (e) {
            rejectWithValue(e);
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
    reducers: {},
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

// Selectors
export const getSettingsLoadingState = (state) => state.settings.isLoading;

export const getAssetsDirPaths = (state) => ({
    selectedImagesDirPath: state.settings.settings.selectedImagesDirPath,
    selectedAnnotationsDirPath:
        state.settings.settings.selectedAnnotationsDirPath,
});

export default settingsSlice.reducer;
