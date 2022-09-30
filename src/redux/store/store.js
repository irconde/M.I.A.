import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '../slices/settings/settings.slice';

// TODO
export default configureStore({
    reducer: {
        settings: settingsReducer,
    },
});
