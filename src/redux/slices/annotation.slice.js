import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    annotations: [],
    categories: [],
};

const annotationSlice = createSlice({
    name: 'annotation',
    initialState,
    reducers: {
        addAnnotationArray: (state, action) => {
            const { annotations, categories } = action.payload;
            state.annotations = annotations;
            state.categories = categories;
        },
    },
});

export const { addAnnotationArray } = annotationSlice.actions;

export const getCategories = (state) => state.annotation.categories;
export const getAnnotations = (state) => state.annotation.annotations;

export default annotationSlice.reducer;
