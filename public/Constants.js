module.exports.Channels = {
    selectDirectory: 'select-directory',
    loadFiles: 'load-files',
    getNextFile: 'get-next-file',
    getSpecificFile: 'get-specific-file',
    saveCurrentFile: 'save-current-file',
    saveIndFile: 'save-individual-file',
    getThumbnail: 'get-thumbnail',
    thumbnailStatus: 'thumbnail-status',
    updateFiles: 'update-files',
    updateCurrentFile: 'update-current-file',
    saveSettingsCookie: 'save-settings-cookie',
    getSettingsCookie: 'get-settings-cookie',
    loadSettingsCookie: 'load-settings-cookie',
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
    remoteIp: '127.0.0.1',
    remotePort: '4001',
    autoConnect: true,
    fileFormat: 'Open Raster',
    annotationsFormat: 'DICOS TDR',
    localFileOutput: '',
    fileSuffix: '_img',
    remoteOrLocal: true,
    deviceType: '',
    displaySummarizedDetections: false,
};
