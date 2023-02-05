import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import randomColor from 'randomcolor';
import { Channels } from '../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

export const saveColorsFile = createAsyncThunk(
    'annotations/saveColors',
    async (payload, { getState, rejectWithValue }) => {
        const { categoryName, color } = payload;
        const state = getState();
        const { annotation } = state;
        let colorUpdate = [];
        if (annotation.colors.length > 0) {
            const foundIndex = annotation.colors.findIndex(
                (color) => color.categoryName === categoryName
            );
            if (foundIndex === -1) {
                colorUpdate = JSON.parse(JSON.stringify(annotation.colors));
                colorUpdate.push(payload);
            } else {
                if (annotation.colors[foundIndex].color !== color) {
                    colorUpdate = JSON.parse(JSON.stringify(annotation.colors));
                    colorUpdate[foundIndex].color = color;
                }
            }
        } else {
            colorUpdate.push(payload);
        }

        await ipcRenderer
            .invoke(Channels.saveColorsFile, colorUpdate)
            .then(() => {
                return colorUpdate;
            })
            .catch((error) => {
                console.log(error);
                rejectWithValue(error);
            });

        return colorUpdate;
    }
);

const initialState = {
    annotations: [],
    categories: [],
    selectedAnnotation: null,
    colors: [],
};

const annotationSlice = createSlice({
    name: 'annotation',
    initialState,
    reducers: {
        addAnnotationArray: (state, action) => {
            const { annotationInformation, colors } = action.payload;
            const { annotations, categories } = annotationInformation;
            state.colors = colors;
            if (annotations?.length > 0) {
                annotations.forEach((annotation) => {
                    const categoryNameIdx = categories.findIndex(
                        (el) => el.id === annotation.category_id
                    );

                    let annotationColor = randomColor({
                        seed: annotation.category_id,
                        hue: 'random',
                        luminosity: 'bright',
                    });
                    if (categoryNameIdx !== -1) {
                        const foundColorIdx = colors.findIndex(
                            (color) =>
                                color.categoryName ===
                                categories[categoryNameIdx].name
                        );

                        if (foundColorIdx !== -1) {
                            annotationColor = colors[foundColorIdx].color;
                        }
                    }
                    const coordArrayToPolygonData = (coordArray) => {
                        let data = [];
                        let count = 0;
                        for (let i = 0; i < coordArray.length; i += 2) {
                            let x = coordArray[i];
                            let y = coordArray[i + 1];
                            data[count] = { x: x, y: y };
                            count++;
                        }
                        return data;
                    };
                    const calculateMaskAnchorPoints = (
                        boundingBox,
                        polygonCoords
                    ) => {
                        // og: [x_0, y_0, x_f, y_f]
                        // new: [x_0, y_0, width, height]
                        const xDist = boundingBox[2];
                        const yDist = boundingBox[3];
                        const x_f = boundingBox[0] + boundingBox[2];
                        const y_f = boundingBox[1] + boundingBox[3];
                        polygonCoords.forEach((point) => {
                            point.anchor = {
                                top: ((y_f - point.y) / yDist) * 100,
                                bottom:
                                    ((point.y - boundingBox[1]) / yDist) * 100,
                                left:
                                    ((point.x - boundingBox[0]) / xDist) * 100,
                                right: ((x_f - point.x) / xDist) * 100,
                            };
                        });
                        return polygonCoords;
                    };
                    for (let j = 0; j < annotation.segmentation.length; j++) {
                        const dataArray = coordArrayToPolygonData(
                            annotation.segmentation[j]
                        );
                        annotation.segmentation[j] = calculateMaskAnchorPoints(
                            annotation.bbox,
                            dataArray
                        );
                    }
                    state.annotations.push({
                        ...annotation,
                        color: annotationColor,
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
                    annotation.selected = !annotation.selected;
                    if (annotation.selected) {
                        state.selectedAnnotation = annotation;
                    }
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
        deleteSelectedAnnotation: (state, action) => {
            state.annotations = state.annotations.filter(
                (annotation) => annotation.id !== state.selectedAnnotation.id
            );
            state.selectedAnnotation = null;
        },
        updateAnnotationColor: (state, action) => {
            const { categoryName, color } = action.payload;
            state.annotations.forEach((annotation) => {
                if (annotation.categoryName === categoryName) {
                    annotation.color = color;
                }
            });
            if (state.selectedAnnotation?.categoryName === categoryName) {
                state.selectedAnnotation.color = color;
            }
        },
        updateAnnotationCategory: (state, action) => {
            // TODO: Check if the new category exists in categories or not
            const { id, newCategory } = action.payload;
            const foundAnnotation = state.annotations.find(
                (annotation) => annotation.id === id
            );
            if (foundAnnotation !== undefined) {
                foundAnnotation.categoryName = newCategory.toLowerCase();
            }
            const foundCategory = state.categories.find(
                (category) =>
                    category.name.toLowerCase() === newCategory.toLowerCase()
            );
            if (foundCategory === undefined) {
                state.categories.push({
                    supercategory: 'operator',
                    name: newCategory.toLowerCase(),
                });
            } else {
                const sameCategoryAnnotation = state.annotations.find(
                    (annotation) =>
                        annotation.categoryName.toLowerCase() ===
                            newCategory.toLowerCase() && annotation.id !== id
                );
                if (
                    sameCategoryAnnotation !== undefined &&
                    foundAnnotation !== undefined
                ) {
                    foundAnnotation.color = sameCategoryAnnotation.color;
                }
            }
        },
        updateAnnotationPosition: (state, action) => {
            const { bbox, id, segmentation } = action.payload;
            const foundAnnotation = state.annotations.find(
                (annotation) => annotation.id === id
            );
            if (foundAnnotation !== undefined) {
                foundAnnotation.bbox = bbox;
                if (segmentation && segmentation.length > 0) {
                    foundAnnotation.segmentation = segmentation;
                }
            }
        },
    },
    extraReducers: {
        [saveColorsFile.fulfilled]: (state, { payload }) => {
            state.colors = payload;
        },
        [saveColorsFile.pending]: (state, { payload }) => {
            //
        },
        [saveColorsFile.rejected]: (state, { payload }) => {
            console.log(payload);
        },
    },
});

export const {
    addAnnotationArray,
    selectAnnotation,
    clearAnnotationSelection,
    toggleVisibility,
    toggleCategoryVisibility,
    deleteSelectedAnnotation,
    updateAnnotationColor,
    updateAnnotationCategory,
    updateAnnotationPosition,
} = annotationSlice.actions;

export const getCategories = (state) => state.annotation.categories;
export const getAnnotations = (state) => state.annotation.annotations;
export const getSelectedAnnotation = (state) =>
    state.annotation.selectedAnnotation;
export const getSelectedAnnotationColor = (state) => {
    if (
        state.annotation.selectedAnnotation !== null &&
        state.annotation.selectedAnnotation !== undefined
    ) {
        return state.annotation.selectedAnnotation.color;
    } else {
        return '';
    }
};

export const getAnnotationCategories = (state) => {
    if (state.annotation.categories.length > 0) {
        const result = [];
        state.annotation.categories.forEach((category) => {
            result.push(category.name);
        });
        return result;
    } else return [];
};

export default annotationSlice.reducer;
