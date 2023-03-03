import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import randomColor from 'randomcolor';
import { Channels, SAVE_STATUSES } from '../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

const polygonDataToCoordArray = (polygonData) => {
    let points = [];
    for (let index in polygonData) {
        points.push(polygonData[index].x);
        points.push(polygonData[index].y);
    }
    return points;
};
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
const calculateMaskAnchorPoints = (boundingBox, polygonCoords) => {
    // og: [x_0, y_0, x_f, y_f]
    // new: [x_0, y_0, width, height]
    const xDist = boundingBox[2];
    const yDist = boundingBox[3];
    const x_f = boundingBox[0] + boundingBox[2];
    const y_f = boundingBox[1] + boundingBox[3];
    polygonCoords.forEach((point) => {
        point.anchor = {
            top: ((y_f - point.y) / yDist) * 100,
            bottom: ((point.y - boundingBox[1]) / yDist) * 100,
            left: ((point.x - boundingBox[0]) / xDist) * 100,
            right: ((x_f - point.x) / xDist) * 100,
        };
    });
    return polygonCoords;
};
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

export const saveCurrentAnnotations = createAsyncThunk(
    'annotations/saveCurrentAnnotations',
    async (payload, { getState, rejectWithValue }) => {
        const state = getState();
        const { annotation } = state;
        let cocoAnnotations = [];
        const cocoCategories = annotation.categories;
        const cocoDeleted = annotation.deletedAnnotationIds;
        annotation.annotations.forEach((annot) => {
            const {
                area,
                iscrowd,
                image_id,
                bbox,
                category_id,
                id,
                segmentation,
            } = annot;
            let newSegmentation = [];
            if (segmentation?.length > 0) {
                segmentation.forEach((segment) => {
                    newSegmentation.push(polygonDataToCoordArray(segment));
                });
            }
            let newAnnotation = {
                area,
                iscrowd,
                image_id,
                bbox,
                segmentation: newSegmentation,
                category_id,
                id,
            };
            cocoAnnotations.push(newAnnotation);
        });
        console.log(cocoAnnotations);
        console.log(cocoCategories);
        console.log(cocoDeleted);
        await ipcRenderer
            .invoke(Channels.saveCurrentFile, {
                cocoAnnotations,
                cocoCategories,
                cocoDeleted,
                fileName: payload,
            })
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.log(error);
                rejectWithValue(error);
            });
        /*return true;*/
    }
);

export const saveAsCurrentFile = createAsyncThunk(
    'annotations/saveAsCurrentFile',
    async (payload, { getState, rejectWithValue }) => {
        const state = getState();
        const { annotation } = state;
        let cocoAnnotations = [];
        const cocoCategories = annotation.categories;
        const cocoDeleted = annotation.deletedAnnotationIds;
        annotation.annotations.forEach((annot) => {
            const {
                area,
                iscrowd,
                image_id,
                bbox,
                category_id,
                id,
                segmentation,
            } = annot;
            let newSegmentation = [];
            if (segmentation?.length > 0) {
                segmentation.forEach((segment) => {
                    newSegmentation.push(polygonDataToCoordArray(segment));
                });
            }
            let newAnnotation = {
                area,
                iscrowd,
                image_id,
                bbox,
                segmentation: newSegmentation,
                category_id,
                id,
            };
            cocoAnnotations.push(newAnnotation);
        });
        console.log(cocoAnnotations);
        console.log(cocoCategories);
        console.log(cocoDeleted);
        await ipcRenderer
            .invoke(Channels.saveAsCurrentFile, {
                cocoAnnotations,
                cocoCategories,
                cocoDeleted,
                fileName: payload,
            })
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.log(error);
                rejectWithValue(error);
            });
        /*return true;*/
    }
);

const initialState = {
    annotations: [],
    categories: [],
    selectedAnnotation: null,
    colors: [],
    selectedCategory: '',
    hasAnnotationChanged: false,
    saveAnnotationsStatus: SAVE_STATUSES.IDLE,
    saveFailureMessage: '',
    deletedAnnotationIds: [],
    maxAnnotationId: 1,
};

const annotationSlice = createSlice({
    name: 'annotation',
    initialState,
    reducers: {
        addAnnotationArray: (state, action) => {
            const { annotationInformation, colors } = action.payload;
            const { annotations, categories, maxAnnotationId } =
                annotationInformation;
            state.annotations = [];
            state.colors = colors;
            state.maxAnnotationId = maxAnnotationId;
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
                        categorySelected: false,
                    });
                });

                state.categories = categories;
            }
            state.hasAnnotationChanged = false;
        },
        addAnnotation: (state, action) => {
            const { bbox, area, segmentation } = action.payload;
            let newAnnotation = {
                bbox,
                area,
                segmentation,
            };
            if (state.annotations.length > 0) {
                newAnnotation.image_id = state.annotations[0].image_id;
                newAnnotation.id =
                    state.annotations.reduce((a, b) => (a.id > b.id ? a : b))
                        .id + 1;
            } else {
                newAnnotation.image_id = 1;
                newAnnotation.id = state.maxAnnotationId++;
            }

            newAnnotation.selected = false;
            newAnnotation.categorySelected = false;
            newAnnotation.visible = true;
            newAnnotation.categoryVisible = true;
            newAnnotation.iscrowd = 0;

            // Category lookup
            const foundCategoryIndex = state.categories.findIndex(
                (category) => category.name.toLowerCase() === 'operator'
            );
            if (foundCategoryIndex === -1) {
                if (state.categories.length > 0) {
                    newAnnotation.category_id =
                        state.categories.reduce((a, b) => (a.id > b.id ? a : b))
                            .id + 1;
                } else {
                    newAnnotation.category_id = 1;
                }
                newAnnotation.categoryName = 'operator';
                state.categories.push({
                    supercategory: 'operator',
                    id: newAnnotation.category_id,
                    name: 'operator',
                });
            } else {
                newAnnotation.category_id =
                    state.categories[foundCategoryIndex].id;
                newAnnotation.categoryName =
                    state.categories[foundCategoryIndex].name;
            }

            // Color lookup
            let annotationColor = randomColor({
                seed: newAnnotation.category_id,
                hue: 'random',
                luminosity: 'bright',
            });
            const foundColorIdx = state.colors.findIndex(
                (color) => color.categoryName === newAnnotation.categoryName
            );
            if (foundColorIdx !== -1) {
                annotationColor = state.colors[foundColorIdx].color;
            }
            newAnnotation.color = annotationColor;

            state.annotations.push(newAnnotation);
            state.hasAnnotationChanged = true;
        },
        selectAnnotation: (state, action) => {
            let anySelected = false;
            state.annotations.forEach((annotation) => {
                if (annotation.id === action.payload) {
                    annotation.selected = !annotation.selected;
                    if (annotation.selected) {
                        state.selectedAnnotation = annotation;
                        anySelected = true;
                    }
                } else {
                    annotation.selected = false;
                }
                annotation.categorySelected = false;
            });

            if (anySelected === false && state.selectedAnnotation !== null) {
                state.selectedAnnotation = null;
            }
            state.selectedCategory = '';
        },
        selectAnnotationCategory: (state, action) => {
            state.annotations.forEach((annotation) => {
                if (annotation.categoryName === action.payload) {
                    annotation.categorySelected = !annotation.categorySelected;
                    if (annotation.categorySelected && annotation.selected) {
                        annotation.selected = false;
                    }
                } else if (annotation.categorySelected === true) {
                    annotation.categorySelected = false;
                }
            });
            if (
                (action.payload !== '' ||
                    action.payload !== null ||
                    action.payload !== undefined) &&
                action.payload !== state.selectedCategory
            ) {
                state.selectedCategory = action.payload;
            } else {
                state.selectedCategory = '';
            }
        },
        clearAnnotationSelection: (state, action) => {
            state.annotations.forEach((annotation) => {
                annotation.selected = false;
                annotation.categorySelected = false;
            });
            state.selectedAnnotation = null;
            state.selectedCategory = '';
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
                    if (
                        !annotation.visible &&
                        (annotation.selected || annotation.categorySelected)
                    ) {
                        annotation.selected = false;
                        annotation.categorySelected = false;
                        state.selectedAnnotation = null;
                        state.selectedCategory = '';
                    }
                }
            });
        },
        deleteSelectedAnnotation: (state, action) => {
            state.deletedAnnotationIds.push(state.selectedAnnotation.id);
            state.annotations = state.annotations.filter(
                (annotation) => annotation.id !== state.selectedAnnotation.id
            );
            state.selectedAnnotation = null;
            state.hasAnnotationChanged = true;
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
            state.hasAnnotationChanged = true;
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
                if (foundAnnotation.id === state.selectedAnnotation.id) {
                    state.selectedAnnotation = foundAnnotation;
                }
            }
            state.hasAnnotationChanged = true;
        },
        updateSaveAnnotationStatus: (state, action) => {
            state.saveAnnotationsStatus = action.payload;
        },
        clearAnnotationData: (state) => {
            state.annotations = [];
            state.categories = [];
            state.selectedAnnotation = null;
            state.selectedCategory = '';
            state.hasAnnotationChanged = false;
            state.deletedAnnotationIds = [];
        },
    },
    extraReducers: {
        [saveColorsFile.fulfilled]: (state, { payload }) => {
            state.colors = payload;
        },
        [saveColorsFile.rejected]: (state, { payload }) => {
            console.log(payload);
        },
        [saveCurrentAnnotations.fulfilled]: (state) => {
            state.saveAnnotationsStatus = SAVE_STATUSES.SAVED;
        },
        [saveCurrentAnnotations.pending]: (state) => {
            state.saveAnnotationsStatus = SAVE_STATUSES.PENDING;
        },
        [saveCurrentAnnotations.rejected]: (state, { payload }) => {
            console.log(payload);
            state.saveAnnotationsStatus = SAVE_STATUSES.FAILURE;
            if (typeof payload === 'string') {
                state.saveFailureMessage = payload;
            } else if (typeof payload === 'object') {
                state.saveFailureMessage = payload.toString();
            }
        },
        [saveAsCurrentFile.fulfilled]: (state) => {
            state.saveAnnotationsStatus = SAVE_STATUSES.SAVED;
        },
        [saveAsCurrentFile.pending]: (state) => {
            state.saveAnnotationsStatus = SAVE_STATUSES.PENDING;
        },
        [saveAsCurrentFile.rejected]: (state, { payload }) => {
            console.log(payload);
            state.saveAnnotationsStatus = SAVE_STATUSES.FAILURE;
            if (typeof payload === 'string') {
                state.saveFailureMessage = payload;
            } else if (typeof payload === 'object') {
                state.saveFailureMessage = payload.toString();
            }
        },
    },
});

export const {
    addAnnotation,
    addAnnotationArray,
    selectAnnotation,
    clearAnnotationSelection,
    toggleVisibility,
    toggleCategoryVisibility,
    deleteSelectedAnnotation,
    updateAnnotationColor,
    updateAnnotationCategory,
    updateAnnotationPosition,
    selectAnnotationCategory,
    updateSaveAnnotationStatus,
    clearAnnotationData,
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

export const getSelectedCategory = (state) => state.annotation.selectedCategory;
export const getHasAnnotationChanged = (state) =>
    state.annotation.hasAnnotationChanged;
export const getSaveAnnotationStatus = (state) =>
    state.annotation.saveAnnotationsStatus;
export const getIsAnyAnnotations = (state) =>
    state.annotation.annotations?.length > 0;

export default annotationSlice.reducer;
