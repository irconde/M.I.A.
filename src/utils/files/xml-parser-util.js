import { SETTINGS } from '../general/Constants';

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
     * @returns {Object}
     */
    getParsedXmlData() {
        // TODO: Simply return an easily readable and parsable json object of the xml data
        const parser = new DOMParser();
        this._xmlDoc = parser.parseFromString(this._xmlData, 'text/xml');
        const xmlImage = this._xmlDoc.getElementsByTagName('image');
        const currentFileFormat = xmlImage[0].getAttribute('format');
        if (currentFileFormat === SETTINGS.ANNOTATIONS.COCO) {
            return this._parseCocoData();
        } else if (currentFileFormat === SETTINGS.ANNOTATIONS.TDR) {
            return this._parseTdrData();
        }
    }

    _parseCocoData() {
        return 'TODO: Return parsed coco data';
    }

    _parseTdrData() {
        return 'TODO: Return parsed tdr data';
    }
}
