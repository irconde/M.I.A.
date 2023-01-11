import { createSlice } from '@reduxjs/toolkit';
import randomColor from 'randomcolor';

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
            annotations.forEach((annotation) => {
                const categoryNameIdx = categories.findIndex(
                    (el) => el.id === annotation.category_id
                );
                state.annotations.push({
                    ...annotation,
                    color: randomColor({
                        seed: annotation.category_id,
                        hue: 'random',
                        luminosity: 'bright',
                    }),
                    categoryName:
                        categoryNameIdx !== -1
                            ? categories[categoryNameIdx].name
                            : '',
                });
            });

            state.categories = categories;
        },
        selectAnnotation: (state, action) => {
            state.annotations.forEach((annotation) => {
                if (annotation.id === action.payload) {
                    annotation.selected = true;
                }
            });
        },
        clearAnnotationSelection: (state, action) => {
            state.annotations.forEach((annotation) => {
                annotation.selected = false;
            });
        },
    },
});

export const {
    addAnnotationArray,
    selectAnnotation,
    clearAnnotationSelection,
} = annotationSlice.actions;

export const getCategories = (state) => state.annotation.categories;
export const getAnnotations = (state) => state.annotation.annotations;

export default annotationSlice.reducer;
