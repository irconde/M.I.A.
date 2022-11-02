import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../slices/settings.slice';
import annotationReducer from '../slices/annotation.slice';

// TODO
export default configureStore({
    reducer: {
        settings: settingsReducer,
        annotation: annotationReducer,
    },
});
