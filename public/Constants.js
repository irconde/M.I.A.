module.exports.Channels = {
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
    updateThumbnailHasAnnotations: 'update-thumbnail-has-annotations',
    selectFile: 'select-file',
    sentFeedbackHTTP: 'send-feedback-http',
    updateSaveModalStatus: 'update-save-modal-status',
    closeApp: 'close-app',
    anyTempDataUpdate: 'any-temp-data-update',
};

module.exports.FileWatcher = {
    add: 'add',
    change: 'change',
    unlink: 'unlink',
    all_json_files: '*.json',
};

module.exports.Settings = {
    ANNOTATIONS: {
        COCO: 'MS COCO',
        TDR: 'DICOS TDR',
    },
    OUTPUT_FORMATS: {
        ORA: 'Open Raster',
        ZIP: 'Zip Archive',
    },
};

module.exports.Viewport = {
    TOP: 'top',
    SIDE: 'side',
};

module.exports.Thumbnail = {
    width: 197,
};

module.exports.defaultSettings = {
    selectedImagesDirPath: '',
    selectedAnnotationFile: '',
};

module.exports.fileType = {
    IMAGES: 'images',
    ANNOTATIONS: 'annotations',
    CANCEL: 'cancel',
};
