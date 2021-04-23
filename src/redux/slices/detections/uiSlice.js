import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';

const uiSlice = createSlice({
    name: 'uiDetections',
    initialState: {},
    reducers: {
        updateDetectionVisibility: (state, action) => {
            console.log('updating visibility');
        },
    },
});

export const { updateDetectionVisibility } = uiSlice.actions;

export default uiSlice.reducer;
