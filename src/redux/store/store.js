import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import serverReducer from '../slices/server/serverSlice';
import detectionsReducer from '../slices/detections/detectionsSlice';
import settingsReducer from '../slices/settings/settingsSlice';
import uiReducer from '../slices/ui/uiSlice';
import featureFlagReducer from '../slices/feature-flags/feature-flag-slice';

export default configureStore({
    reducer: {
        server: serverReducer,
        detections: detectionsReducer,
        ui: uiReducer,
        settings: settingsReducer,
        featureFlag: featureFlagReducer,
    },
    middleware: getDefaultMiddleware({
        serializableCheck: {
            // Ignore these action types
            ignoredActions: [
                'server/setCommandServerConnection',
                'server/setFileServerConnection',
                'ui/toggleCollapsedSideMenu',
                'ui/setCollapsedSideMenu',
                'ui/toggleCollapsedLazyMenu',
            ],
        },
    }),
});
