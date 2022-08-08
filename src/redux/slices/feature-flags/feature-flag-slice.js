import { createSlice } from '@reduxjs/toolkit';

const featureFlagSlice = createSlice({
    name: 'featureFlag',
    initialState: {
        fileLoadingFlag:
            process.env.REACT_APP_FEATURE_FLAG_FILE_LOADING === 'true',
    },
    reducers: {},
});

export const getFileLoadingFlag = (state) => state.featureFlag.fileLoadingFlag;

export default featureFlagSlice.reducer;
