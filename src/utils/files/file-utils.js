import JSZip from 'jszip';
import XmlParserUtil from './xml-parser-util';
import { SETTINGS } from '../enums/Constants';
import { v4 as uuidv4 } from 'uuid';

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
                        this._loadCOCOdata(parsedData, zipUtil).then((data) =>
                            console.log(data)
                        );
                    }
                });
        });
    }

    async _loadCOCOdata(parsedData, zipUtil) {
        const detectionData = [];
        parsedData.views.forEach((view) => {
            view.detectionData.forEach((detectionPath) => {
                zipUtil
                    .file(detectionPath)
                    .async('string')
                    .then((string) => {
                        const detection = JSON.parse(string);
                        console.log(detection);
                        const { annotations, info } = detection;
                        const { className, confidence, bbox, id, image_id } =
                            annotations[0];
                        detectionData.push({
                            algorithm: info.algorithm,
                            className,
                            confidence,
                            view: view.view,
                            boundingBox: bbox,
                            // To be calculated
                            binaryMask: [],
                            polygonMask: [],
                            uuid: uuidv4(), // make sure this is the right id
                            detectionFromFile: true,
                            imageId: image_id,
                        });
                    });
            });
        });
        return detectionData;
    }
}
