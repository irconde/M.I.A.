import JSZip from 'jszip';
import XmlParserUtil from './xml-parser-util';
import { SETTINGS } from '../enums/Constants';
import { v4 as uuidv4 } from 'uuid';
import Utils from '../general/Utils';

/**
 * Class that manages the loading and generating of files for the application
 */
export default class FileUtils {
    #fileData = '';
    #blobData = [];
    #imageData = [];
    #xmlParser = null;

    /**
     * Constructor for the file utils class
     * @param {string} fileData Base 64 string of the binary data
     */
    constructor(fileData) {
        this.#fileData = fileData;
        this.#loadData();
    }

    /**
     * Loads the data from the passed in file string data
     * @private
     */
    #loadData() {
        const zipUtil = new JSZip();
        zipUtil.loadAsync(this.#fileData, { base64: true }).then(() => {
            zipUtil
                .file('stack.xml')
                .async('string')
                .then((stackFile) => {
                    this.#xmlParser = new XmlParserUtil(stackFile);
                    const parsedData = this.#xmlParser.getParsedXmlData();
                    console.log(parsedData);
                    if (parsedData.format === SETTINGS.ANNOTATIONS.COCO) {
                        this.#loadCocoDetections(parsedData, zipUtil).then(
                            (detectionData) => console.log(detectionData)
                        );
                    }
                });
        });
    }

    /**
     * Returns an array of detection data parsed from the json files using JSZip
     *
     * @param {{format: string; views: Array<{view: string; pixelData: string; detectionData: Array<string>}>;}} parsedData
     * @param {JSZip} zipUtil
     * @returns {Promise<Array<{ algorithm: string; className: string; confidence: number; view: string; boundingBox: Array<number>; binaryMask?: Array<Array<number>>; polygonMask: Array<number>; uuid: string; detectionFromFile: true; imageId: number;}>>}
     * @private
     */
    async #loadCocoDetections(parsedData, zipUtil) {
        const detectionData = [];
        const allPromises = [];
        parsedData.views.forEach((view) => {
            view.detectionData.forEach((detectionPath) => {
                allPromises.push(zipUtil.file(detectionPath).async('string'));
                allPromises.at(-1).then((string) => {
                    const detection = JSON.parse(string);
                    const { annotations, info } = detection;
                    const {
                        className,
                        confidence,
                        bbox,
                        image_id,
                        segmentation,
                    } = annotations[0];
                    const boundingBox = Utils.getBoundingBox(bbox);
                    const { binaryMask, polygonMask } = Utils.getMasks(
                        boundingBox,
                        segmentation
                    );
                    detectionData.push({
                        algorithm: info.algorithm,
                        className,
                        confidence,
                        view: view.view,
                        boundingBox,
                        binaryMask,
                        polygonMask,
                        uuid: uuidv4(),
                        detectionFromFile: true,
                        imageId: image_id,
                    });
                });
            });
        });

        await Promise.all(allPromises);
        return detectionData;
    }
}
