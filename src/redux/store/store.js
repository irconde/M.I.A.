import { configureStore } from '@reduxjs/toolkit';
import serverReducer from '../slices/serverSlice';

export default configureStore({
    reducer: {
        server: serverReducer,
    },
});
