import { createSlice } from '@reduxjs/toolkit';
import './util/typedef';
import { createDetectionSet } from './util/DetectionSet';

const detectionsSlice = createSlice({
    name: 'detections',
    initialState: {},
    reducers: {
        addDetectionSet: (state, action) => {},
        addDetection: (state, action) => {},
    },
});

export const { addDetectionSet, addDetection } = detectionsSlice.actions;

export default detectionsSlice.reducer;
