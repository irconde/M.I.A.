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

const saveToSessionStorage = (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
};

const getFromSessionStorage = (key) => {
    const data = sessionStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
};

const removeFromSessionStorage = (key) => {
    sessionStorage.removeItem(key);
};

const clearSessionStorage = () => {
    removeFromSessionStorage('annotations');
    removeFromSessionStorage('categories');
    removeFromSessionStorage('imageId');
    removeFromSessionStorage('deletedAnnotationIds');
};

const prepareAnnotationsForCoco = (annotation) => {
    let cocoAnnotations = [];
    const cocoCategories = annotation.categories;
    const cocoDeleted = annotation.deletedAnnotationIds;
    annotation.annotations.forEach((annot) => {
        const { area, iscrowd, image_id, bbox, category_id, id, segmentation } =
            annot;
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
    return { cocoAnnotations, cocoCategories, cocoDeleted };
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
                return rejectWithValue(error.message);
            });

        return colorUpdate;
    }
);

export const saveCurrentAnnotations = createAsyncThunk(
    'annotations/saveCurrentAnnotations',
    async (payload, { getState, rejectWithValue }) => {
        const state = getState();
        const { annotation, ui } = state;
        const { cocoAnnotations, cocoCategories, cocoDeleted } =
            prepareAnnotationsForCoco(annotation);
        await ipcRenderer
            .invoke(Channels.saveCurrentFile, {
                cocoAnnotations,
                cocoCategories,
                cocoDeleted,
                fileName: ui.currentFileName,
                imageId: annotation.imageId,
            })
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.log(error);
                rejectWithValue(error.message);
            });
    }
);

export const saveAsCurrentFile = createAsyncThunk(
    'annotations/saveAsCurrentFile',
    async (payload, { getState, rejectWithValue }) => {
        const state = getState();
        const { annotation, ui } = state;
        const { cocoAnnotations, cocoCategories, cocoDeleted } =
            prepareAnnotationsForCoco(annotation);
        try {
            await ipcRenderer.invoke(Channels.saveAsCurrentFile, {
                cocoAnnotations,
                cocoCategories,
                cocoDeleted,
                fileName: ui.currentFileName,
                imageId: annotation.imageId,
            });
            return true;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.message);
        }
    }
);

export const selectFileAndSaveTempAnnotations = createAsyncThunk(
    'annotations/selectFileAndSaveTempAnnotations',
    async (payload, { getState, rejectWithValue }) => {
        const state = getState();
        const { annotation, ui } = state;
        const { cocoAnnotations, cocoCategories, cocoDeleted } =
            prepareAnnotationsForCoco(annotation);
        await ipcRenderer
            .invoke(Channels.selectFile, {
                cocoAnnotations: annotation.hasAnnotationChanged
                    ? cocoAnnotations
                    : [],
                cocoCategories,
                cocoDeleted,
                tempFileName: ui.currentFileName,
                imageId: annotation.imageId,
                fileName: payload,
            })
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.log(error);
                rejectWithValue(error);
            });
    }
);

export const closeAppAndSaveAnnotations = createAsyncThunk(
    'annotations/closeAppAndSaveAnnotations',
    async (payload, { getState }) => {
        const state = getState();
        const { annotation, ui } = state;
        const { cocoAnnotations, cocoCategories, cocoDeleted } =
            prepareAnnotationsForCoco(annotation);
        await ipcRenderer
            .invoke(Channels.closeApp, {
                cocoAnnotations: annotation.hasAnnotationChanged
                    ? cocoAnnotations
                    : [],
                cocoCategories,
                cocoDeleted,
                imageId: annotation.imageId,
                fileName: ui.currentFileName,
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                return true;
            });
    }
);

export const closeAppAndDontSaveAnnotations = createAsyncThunk(
    'annotations/closeAppAndDontSaveAnnotations',
    async (payload, { getState }) => {
        const state = getState();
        const { annotation, ui } = state;
        await ipcRenderer
            .invoke(Channels.closeApp, {
                cocoAnnotations: [],
                cocoCategories: [],
                cocoDeleted: [],
                imageId: annotation.imageId,
                fileName: ui.currentFileName,
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                return true;
            });
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
    imageId: 0,
    maxContrast: 0,
    maxBrightness: 0,
    contrast: 50,
    brightness: 50,
    inverted: false,
    saveAsModalOpen: false,
    anyTempData: false,
};

const annotationSlice = createSlice({
    name: 'annotation',
    initialState,
    reducers: {
        addAnnotationArray: (state, action) => {
            const { annotationInformation, colors } = action.payload;
            const {
                annotations,
                categories,
                maxAnnotationId,
                imageId,
                deletedAnnotationIds,
                anyTempData,
            } = annotationInformation;
            state.annotations = [];
            state.colors = colors;
            state.imageId = imageId;

            state.anyTempData = anyTempData;

            if (deletedAnnotationIds !== undefined) {
                // Loaded from temp data
                state.deletedAnnotationIds = deletedAnnotationIds;
                state.hasAnnotationChanged = true;
            } else {
                state.hasAnnotationChanged = false;
            }

            if (state.maxAnnotationId === 1 && maxAnnotationId !== undefined) {
                state.maxAnnotationId = maxAnnotationId;
            }
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

            saveToSessionStorage('annotations', state.annotations);
            saveToSessionStorage('categories', state.categories);
            saveToSessionStorage('imageId', state.imageId);
            saveToSessionStorage('maxAnnotationId', state.maxAnnotationId);
            saveToSessionStorage(
                'deletedAnnotationIds',
                state.deletedAnnotationIds
            );
        },
        addAnnotation: (state, action) => {
            const { bbox, area, segmentation } = action.payload;
            let newAnnotation = {
                bbox,
                area,
                segmentation,
            };
            newAnnotation.image_id = state.imageId;
            // TODO: May need to check: Number.MAX_SAFE_INTEGER - some values from COCO data are getting large: 908800474295
            newAnnotation.id = state.maxAnnotationId++;

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

            saveToSessionStorage('annotations', state.annotations);
            saveToSessionStorage('categories', state.categories);
            saveToSessionStorage('maxAnnotationId', state.maxAnnotationId);
        },
        updateColors: (state, action) => {
            state.colors = action.payload;
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

            saveToSessionStorage('annotations', state.annotations);
            saveToSessionStorage(
                'deletedAnnotationIds',
                state.deletedAnnotationIds
            );
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
                const newId =
                    state.categories.reduce((a, b) => (a.id > b.id ? a : b))
                        .id + 1;
                state.categories.push({
                    supercategory: 'operator',
                    name: newCategory.toLowerCase(),
                    id: newId,
                });
                foundAnnotation.category_id = newId;
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

                if (foundAnnotation !== undefined) {
                    foundAnnotation.category_id = foundCategory.id;
                }
            }
            state.hasAnnotationChanged = true;

            saveToSessionStorage('annotations', state.annotations);
            saveToSessionStorage('categories', state.categories);
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

            saveToSessionStorage('annotations', state.annotations);
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
            state.maxContrast = 0;
            state.maxBrightness = 0;
            state.brightness = 50;
            state.contrast = 50;
            state.inverted = false;
            clearSessionStorage();
        },
        updateMaxImageValues: (state, action) => {
            const { maxBrightness, maxContrast } = action.payload;
            state.maxBrightness = maxBrightness;
            state.maxContrast = maxContrast;
        },
        updateImageBrightness: (state, action) => {
            state.brightness = action.payload;
        },
        updateImageContrast: (state, action) => {
            state.contrast = action.payload;
        },
        updateImageInversion: (state, action) => {
            state.inverted = action.payload;
        },
        updateShowSaveAsModal: (state, action) => {
            state.saveAsModalOpen = action.payload;
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
            state.saveAsModalOpen = false;
            state.saveAnnotationsStatus = SAVE_STATUSES.SAVED;
        },
        [saveCurrentAnnotations.pending]: (state) => {
            state.saveAnnotationsStatus = SAVE_STATUSES.PENDING;
        },
        [saveCurrentAnnotations.rejected]: (state, { payload }) => {
            state.saveAsModalOpen = false;
            console.log(payload);
            state.saveAnnotationsStatus = SAVE_STATUSES.FAILURE;
            if (typeof payload === 'string') {
                state.saveFailureMessage = payload;
            } else if (typeof payload === 'object') {
                state.saveFailureMessage = payload.toString();
            }
        },
        [selectFileAndSaveTempAnnotations.fulfilled]: (state) => {
            state.annotations = [];
            state.selectedAnnotation = null;
            state.selectedCategory = '';
            state.hasAnnotationChanged = false;
            state.deletedAnnotationIds = [];
            state.maxBrightness = 0;
            state.maxContrast = 0;
            state.contrast = 50;
            state.brightness = 50;
            state.inverted = false;
            clearSessionStorage();
        },
        [selectFileAndSaveTempAnnotations.pending]: (state) => {
            //
        },
        [selectFileAndSaveTempAnnotations.rejected]: (state, { payload }) => {
            console.log(payload);
        },
        [saveAsCurrentFile.fulfilled]: (state) => {
            state.saveAsModalOpen = false;
            state.saveAnnotationsStatus = SAVE_STATUSES.SAVED;
        },
        [saveAsCurrentFile.pending]: (state) => {
            state.saveAnnotationsStatus = SAVE_STATUSES.PENDING;
        },
        [saveAsCurrentFile.rejected]: (state, { payload }) => {
            state.saveAsModalOpen = false;
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
    updateColors,
    updateMaxImageValues,
    updateImageBrightness,
    updateImageContrast,
    updateImageInversion,
    updateShowSaveAsModal,
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
export const getHasAnyTempOrCurrentChanged = (state) =>
    state.annotation.anyTempData || state.annotation.hasAnnotationChanged;
export const getSaveAnnotationStatus = (state) =>
    state.annotation.saveAnnotationsStatus;
export const getIsAnyAnnotations = (state) =>
    state.annotation.annotations?.length > 0;
export const getHasAllAnnotationsDeleted = (state) =>
    state.annotation.annotations?.length === 0 &&
    state.annotation.hasAnnotationChanged === true;
export const getImageId = (state) => state.annotation.imageId;
export const getMaxImageValues = (state) => {
    return {
        maxBrightness: state.annotation.maxBrightness,
        maxContrast: state.annotation.maxContrast,
    };
};
export const getImageBrightness = (state) => state.annotation.brightness;
export const getImageContrast = (state) => state.annotation.contrast;
export const getImageInversion = (state) => state.annotation.inverted;
export const getIsSaveModalOpen = (state) => state.annotation.saveAsModalOpen;

export default annotationSlice.reducer;
