import { configureStore } from '@reduxjs/toolkit';
import serverReducer from '../slices/server/serverSlice';

export default configureStore({
    reducer: {
        server: serverReducer,
    },
});
