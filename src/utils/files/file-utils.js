import JSZip from 'jszip';
import XmlParserUtil from './xml-parser-util';
import { SETTINGS } from '../enums/Constants';

/**
 * Class that manages the loading and generating of files for the application
 */
export default class FileUtils {
    _fileData = '';
    _blobData = [];
    _imageData = [];
    _xmlParser = null;

    /**
     * Constructor for the file utils class
     * @param {string} fileData Base 64 string of the binary data
     */
    constructor(fileData) {
        this._fileData = fileData;
        this._loadData();
    }

    /**
     * Loads the data from the passed in file string data
     * @private
     */
    _loadData() {
        const zipUtil = new JSZip();
        zipUtil.loadAsync(this._fileData, { base64: true }).then(() => {
            zipUtil
                .file('stack.xml')
                .async('string')
                .then((stackFile) => {
                    this._xmlParser = new XmlParserUtil(stackFile);
                    const parsedData = this._xmlParser.getParsedXmlData();
                    console.log(parsedData);
                    if (parsedData.format === SETTINGS.ANNOTATIONS.COCO) {
                        const promises = [];
                        parsedData.views.forEach((view) => {
                            view.detectionData.forEach((detectionPath) => {
                                promises.push(
                                    zipUtil.file(detectionPath).async('string')
                                );
                            });
                        });
                        const detectionsData = [];
                        Promise.all(promises).then((strings) => {
                            strings.forEach((string) =>
                                detectionsData.push(JSON.parse(string))
                            );
                            console.log(detectionsData);
                        });
                    }
                });
        });
    }
}
