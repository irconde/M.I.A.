import { configureStore } from '@reduxjs/toolkit';
import serverReducer from '../slices/server/serverSlice';
import detectionsReducer from '../slices/detections/detectionsSlice';
import uiDetectionsReducer from '../slices/detections/uiSlice';
export default configureStore({
    reducer: {
        server: serverReducer,
        detections: detectionsReducer,
        uiDetections: uiDetectionsReducer,
    },
});
