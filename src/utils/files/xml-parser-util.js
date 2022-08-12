import { SETTINGS } from '../enums/Constants';

/**
 * Class that parses a xml file based on the given string
 */
export default class XmlParserUtil {
    _xmlData = '';
    _xmlDoc = null;

    /**
     * Takes in the xml data as a string
     * @param {string} xmlData
     */
    constructor(xmlData) {
        this._xmlData = xmlData;
    }

    /**
     * Returns the xml string in a simply javascript object
     * @returns {{format: string; views: Array<{view: string; pixelData: string; detectionData: Array<string>}>;}}
     */
    getParsedXmlData() {
        // TODO: Simply return an easily readable and parsable json object of the xml data
        const parser = new DOMParser();
        this._xmlDoc = parser.parseFromString(this._xmlData, 'text/xml');
        const xmlImages = this._xmlDoc.getElementsByTagName('image');
        const currentFileFormat = xmlImages[0]?.getAttribute('format');
        const jsonObj = {
            format: currentFileFormat,
            views: [],
        };
        [...xmlImages[0].children].forEach((stack) => {
            const view = stack.getAttribute('view');
            const firstLayer = stack.firstElementChild;
            const pixelData = firstLayer.getAttribute('src');
            if (jsonObj.format === null) {
                const fileExtension = pixelData.split('.').pop();
                switch (fileExtension) {
                    case 'dcs':
                        jsonObj.format = SETTINGS.ANNOTATIONS.TDR;
                        break;
                    case 'png':
                    case 'jpg':
                    case 'jpeg':
                        jsonObj.format = SETTINGS.ANNOTATIONS.COCO;
                        break;
                    default:
                        jsonObj.format = '';
                }
            }
            const detectionData = [];
            for (
                let currLayer = firstLayer.nextElementSibling;
                currLayer;
                currLayer = currLayer.nextElementSibling
            ) {
                detectionData.push(currLayer.getAttribute('src'));
            }
            jsonObj.views.push({ view, pixelData, detectionData });
        });

        return jsonObj;
    }
}
