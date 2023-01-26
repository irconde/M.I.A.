import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../slices/settings.slice';
import annotationReducer from '../slices/annotation.slice';
import uiReducer from '../slices/ui.slice';

// TODO
export default configureStore({
    reducer: {
        settings: settingsReducer,
        annotation: annotationReducer,
        ui: uiReducer,
    },
});
