export const viewport = {
    TOP: 'top',
    SIDE: 'side',
};

export const selection = {
    NO_SELECTION: -1,
    FIRST_ELEMENT: 0,
    ALL_SELECTED: 999,
};

export const colors = {
    WHITE: '#FFFFFF',
    YELLOW: '#F7B500',
    GREEN: '#0b8409',
    RED: '#ff4b4b',
    BLUE: '#367FFF',
    HOVER_COLOR: '#2658b2',
};

export const buttonStyle = {
    MARGIN_LEFT: 60,
    MARGIN_RIGHT: 250,
    GAP: 120,
    HEIGHT: 60,
    LINE_GAP: 40,
};

export const annotationStyle = {
    NORMAL_COLOR: colors.BLUE,
    SELECTED_COLOR: colors.BLUE,
    VALID_COLOR: colors.GREEN,
    INVALID_COLOR: colors.RED,
    LABEL_PADDING: {
        LEFT: 10,
        BOTTOM: 8,
    },
    LABEL_FONT: 'bold 13px Noto Sans JP',
    FONT_DETAILS: {
        FAMILY: 'Noto Sans JP',
        SIZE: 13,
        WEIGHT: 'bold',
        get(zoom = 1) {
            return `${this.WEIGHT} ${this.SIZE / zoom}px ${this.FAMILY}`;
        },
    },
    LABEL_HEIGHT: 28,
    LABEL_TEXT_COLOR: colors.WHITE,
    BORDER_WIDTH: 2,
};

export const detectionContextStyle = {
    HEIGHT: 30,
    WIDTH: 160,
    WHITE: '#dadada',
    SELECTED_COLOR: '#aeaeae',
    HOVER_COLOR: '#c7c7c7',
};

export const viewportStyle = {
    ZOOM: 1.2,
    ORIGIN: 0,
    REF_VIEWPORT_WIDTH: 753,
};

export const RESOLUTION_UNIT = 'px';
export const sideMenuWidth = 238;
export const sideMenuPaddingTop = 55;
export const cornerstoneMode = {
    SELECTION: 'selection',
    ANNOTATION: 'annotation',
    EDITION: 'edition',
};
export const detectionType = {
    BOUNDING: 'bounding',
    BINARY: 'binary',
    POLYGON: 'polygon',
    NO_TOOL: 'none',
};
export const annotationMode = {
    BOUNDING: 'bounding',
    POLYGON: 'polygon',
    NO_TOOL: 'none',
};
export const editionMode = {
    LABEL: 'label',
    BOUNDING: 'bounding',
    MOVE: 'movement',
    POLYGON: 'polygon',
    DELETE: 'delete',
    NO_TOOL: 'none',
    COLOR: 'color',
};
export const commonDetections = {
    APPLE: 'apple',
    BANANA: 'banana',
    ORANGE: 'orange',
    UNKNOWN: 'unknown',
};
export const events = {
    POLYGON_MASK_CREATED: 'polygon_mask_created',
    POLYGON_MASK_MODIFIED: 'polygon_mask_modified',
};

export const UNKNOWN = 'unknown';
export const BOUNDING_BOX_AREA_THRESHOLD = 10;
export const ALGORITHM = 'Algorithm';
export const MAX_LABEL_LENGTH = 10;

export const COOKIE = {
    // In seconds, 10800 = 3 hours
    WEB_TIME: 10800000,
    DESKTOP_TIME: 2147483647 * 1000,
};

export const SETTINGS = {
    ANNOTATIONS: {
        COCO: 'MS COCO',
        TDR: 'DICOS TDR',
    },
    OUTPUT_FORMATS: {
        ORA: 'Open Raster',
        ZIP: 'Zip Archive',
    },
};

export const DEVICE_TYPE = {
    TABLET: 'tablet',
    MOBILE: 'mobile',
    DESKTOP: 'desktop',
};

export const Channels = {
    updateAnnotationFile: 'update-annotation-file',
    saveColorsFile: 'save-colors-file',
    verifyDirectories: 'verify-directories',
    loadFiles: 'load-files',
    getNextFile: 'get-next-file',
    getCurrentFile: 'get-current-file',
    getSpecificFile: 'get-specific-file',
    saveCurrentFile: 'save-current-file',
    saveAsCurrentFile: 'save-as-current-file',
    saveIndFile: 'save-individual-file',
    getThumbnail: 'get-thumbnail',
    thumbnailStatus: 'thumbnail-status',
    updateFiles: 'update-files',
    updateCurrentFile: 'update-current-file',
    saveSettings: 'save-settings',
    getSettings: 'get-settings',
    initSettings: 'init-settings',
    showFolderPicker: 'show-folder-picker',
    getFileName: 'get-file-name',
    getNumberOfFiles: 'get-number-of-files',
    newFileUpdate: 'new-file-update',
    requestInitialThumbnailsList: 'request-initial-thumbnails-list',
    addThumbnail: 'add-thumbnail',
    removeThumbnail: 'remove-thumbnail',
    updateThumbnails: 'update-thumbnails',
    updateThumbnailHasAnnotations: 'update-thumbnail-has-annotations',
    selectFile: 'select-file',
    sentFeedbackHTTP: 'send-feedback-http',
    updateSaveModalStatus: 'update-save-modal-status',
    closeApp: 'close-app',
    anyTempDataUpdate: 'any-temp-data-update',
};

export const toolNames = {
    boundingBox: 'BoundingBoxDrawing',
    segmentation: 'SegmentationDrawingTool',
    movement: 'AnnotationMovementTool',
};

export const NEXT_BUTTON_FAB_MARGIN = 7;

export const SAVE_STATUSES = {
    IDLE: 'idle',
    PENDING: 'pending',
    SAVED: 'saved',
    FAILURE: 'failure',
};
