import { configureStore } from '@reduxjs/toolkit';
import serverReducer from '../slices/server/serverSlice';
import detectionsReducer from '../slices/detections/detectionsSlice';
export default configureStore({
    reducer: {
        server: serverReducer,
        detections: detectionsReducer,
    },
});
