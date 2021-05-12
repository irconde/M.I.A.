import { configureStore } from '@reduxjs/toolkit';
import serverReducer from '../slices/server/serverSlice';
import detectionsReducer from '../slices/detections/detectionsSlice';
import uiReducer from '../slices/ui/uiSlice';
export default configureStore({
    reducer: {
        server: serverReducer,
        detections: detectionsReducer,
        ui: uiReducer,
    },
});
