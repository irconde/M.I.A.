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

export default annotationSlice.reducer;
