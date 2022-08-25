import JSZip from 'jszip';
import XmlParserUtil from './xml-parser-util';
import { SETTINGS } from '../enums/Constants';
import { v4 as uuidv4 } from 'uuid';
import Utils from '../general/Utils';
import dicomParser from 'dicom-parser';
import Dicos from '../detections/Dicos';

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
                    this.#loadDetections(parsedData, zipUtil).then(
                        (detectionData) => console.log(detectionData)
                    );
                });
        });
    }

    /**
     * Returns an array of detection data objects depending on the format of COCO, or DICOS
     *
     * @param {{format: string; views: Array<{view: string; pixelData: string; detectionData: Array<string>}>;}} parsedData
     * @param {JSZip} zipUtil
     * @returns {Promise<Array<{ algorithm: string; className: string; confidence: number; view: string; boundingBox: Array<number>; binaryMask?: Array<Array<number>>; polygonMask: Array<number>; uuid: string; detectionFromFile: true; imageId: number;}>>}
     */
    async #loadDetections(parsedData, zipUtil) {
        const { COCO } = SETTINGS.ANNOTATIONS;
        const { format } = parsedData;
        const detectionData = [];
        const allPromises = [];
        parsedData.views.forEach((view) => {
            view.detectionData.forEach((detectionPath) => {
                allPromises.push(
                    zipUtil
                        .file(detectionPath)
                        .async(format === COCO ? 'string' : 'uint8array')
                );
                allPromises.at(-1).then((data) => {
                    format === COCO
                        ? this.#loadCocoData(data, detectionData, view.view)
                        : this.#loadDicosDetections(
                              data,
                              detectionData,
                              view.view
                          );
                });
            });
        });

        await Promise.all(allPromises);
        return detectionData;
    }

    /**
     * Returns an array of detection data objects depending on the format of COCO, or DICOS
     *
     * @param {{format: string; views: Array<{view: string; pixelData: string; imageId: string; detectionData: Array<string>}>;}} parsedData
     * @param {JSZip} zipUtil
     * @returns {Promise<{pixelData: *[], detectionData: *[]}>}
     * @private
     */
    async #loadCocoData(parsedData, zipUtil) {
        const detectionData = [];
        const allPromises = [];
        const pixelData = [];
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

            allPromises.push(zipUtil.file(view.pixelData).async('arraybuffer'));
            allPromises.at(-1).then((arrayBuffer) => {
                pixelData.push({
                    view: view.view,
                    type: SETTINGS.ANNOTATIONS.COCO,
                    pixelData: arrayBuffer,
                    imageId: view.imageId,
                });
            });
        });

        await Promise.all(allPromises);
        return { detectionData, pixelData };
    }

    /**
     * Parses an Uint8Array and pushes a detection object onto the passed in detection data array
     *
     * @param {Uint8Array} array - array containing detection information recovered from DICOS formatted file
     * @param {Array<{ algorithm: string; className: string; confidence: number; view: string; boundingBox: Array<number>; binaryMask?: Array<Array<number>>; polygonMask: Array<number>; uuid: string; detectionFromFile: true; imageId: number;}>} detectionData
     * @param {string} view - top or side view
     */
    #loadDicosDetections(array, detectionData, view) {
        const dataSet = dicomParser.parseDicom(array);

        const algorithm = dataSet.string(
            Dicos.dictionary['ThreatDetectionAlgorithmandVersion'].tag
        );
        const threatSequence = dataSet.elements.x40101011;
        if (
            threatSequence == null ||
            dataSet.uint16(Dicos.dictionary['NumberOfAlarmObjects'].tag) ===
                0 ||
            dataSet.uint16(Dicos.dictionary['NumberOfAlarmObjects'].tag) ===
                undefined
        ) {
            return null;
        } else {
            const boundingBox = Dicos.retrieveBoundingBoxData(
                threatSequence.items[0]
            );
            const className = Dicos.retrieveObjectClass(
                threatSequence.items[0]
            );
            const confidence = Utils.decimalToPercentage(
                Dicos.retrieveConfidenceLevel(threatSequence.items[0])
            );
            const binaryMask = Dicos.retrieveMaskData(
                threatSequence.items[0],
                dataSet
            );
            detectionData.push({
                algorithm,
                className,
                confidence,
                view,
                boundingBox,
                binaryMask,
                polygonMask: [],
                detectionFromFile: true,
                uuid: uuidv4(),
            });
        }
    }
}
