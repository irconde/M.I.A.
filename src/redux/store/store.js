import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import serverReducer from '../slices/server/serverSlice';
import detectionsReducer from '../slices/detections/detectionsSlice';
import settingsReducer from '../slices/settings/settingsSlice';
import uiReducer from '../slices/ui/uiSlice';
export default configureStore({
    reducer: {
        server: serverReducer,
        detections: detectionsReducer,
        ui: uiReducer,
        settings: settingsReducer,
    },
    middleware: getDefaultMiddleware({
        serializableCheck: {
            // Ignore these action types
            ignoredActions: [
                'server/setCommandServerConnection',
                'server/setFileServerConnection',
            ],
        },
    }),
});
