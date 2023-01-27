import { createSlice } from '@reduxjs/toolkit';
import randomColor from 'randomcolor';

const initialState = {
    annotations: [],
    categories: [],
    selectedAnnotation: null,
};

const annotationSlice = createSlice({
    name: 'annotation',
    initialState,
    reducers: {
        addAnnotationArray: (state, action) => {
            const { annotations, categories } = action.payload;
            if (annotations?.length > 0) {
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
                        selected: false,
                        visible: true,
                        categoryVisible: true,
                    });
                });

                state.categories = categories;
            }
        },
        selectAnnotation: (state, action) => {
            state.annotations.forEach((annotation) => {
                if (annotation.id === action.payload) {
                    annotation.selected = true;
                    state.selectedAnnotation = annotation;
                } else {
                    annotation.selected = false;
                }
            });
        },
        clearAnnotationSelection: (state, action) => {
            state.annotations.forEach((annotation) => {
                annotation.selected = false;
            });
            state.selectedAnnotation = null;
        },
        toggleVisibility: (state, action) => {
            const foundAnnotation = state.annotations.find(
                (annotation) => annotation.id === action.payload
            );
            if (foundAnnotation !== undefined) {
                if (foundAnnotation.visible && foundAnnotation.selected) {
                    foundAnnotation.selected = false;
                    state.selectedAnnotation = null;
                }
                foundAnnotation.visible = !foundAnnotation.visible;
                if (
                    foundAnnotation.visible &&
                    !foundAnnotation.categoryVisible
                ) {
                    state.annotations.forEach((annotation) => {
                        if (
                            annotation.categoryName ===
                            foundAnnotation.categoryName
                        ) {
                            annotation.categoryVisible = true;
                        }
                    });
                }
            }
        },
        toggleCategoryVisibility: (state, action) => {
            state.annotations.forEach((annotation) => {
                if (annotation.categoryName === action.payload) {
                    annotation.categoryVisible = !annotation.categoryVisible;
                    annotation.visible = annotation.categoryVisible;
                    if (!annotation.visible && annotation.selected) {
                        annotation.selected = false;
                        state.selectedAnnotation = null;
                    }
                }
            });
        },
    },
});

export const {
    addAnnotationArray,
    selectAnnotation,
    clearAnnotationSelection,
    toggleVisibility,
    toggleCategoryVisibility,
} = annotationSlice.actions;

export const getCategories = (state) => state.annotation.categories;
export const getAnnotations = (state) => state.annotation.annotations;

export default annotationSlice.reducer;
