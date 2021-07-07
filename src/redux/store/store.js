import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import serverReducer from '../slices/server/serverSlice';
import detectionsReducer from '../slices/detections/detectionsSlice';
import uiReducer from '../slices/ui/uiSlice';
export default configureStore({
    reducer: {
        server: serverReducer,
        detections: detectionsReducer,
        ui: uiReducer,
    },
    middleware: getDefaultMiddleware({
        serializableCheck: {
            // Ignore these action types
            ignoredActions: [
                'server/setCommandServerConnection',
                'server/setFileServerConnection',
                'detections/addDetection',
            ],
            ignoredPaths: [
                'detections.detections',
                'detections.selectedDetection',
            ],
        },
    }),
});
