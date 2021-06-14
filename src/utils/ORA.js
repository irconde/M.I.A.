/**
 * Class that holds our stacks from an ora file
 */
export default class ORA {
    constructor() {
        this.stackData = [];
    }

    setStackBlobData(index, data) {
        if (this.stackData[index] !== undefined) {
            this.stackData[index].blobData = data;
        }
    }

    /**
     * getFirstImage() - Returns the first image on the first stack if it exists
     *
     * @param {type} None
     * @returns {type} Blob
     */
    getFirstImage() {
        if (this.stackData.length > 0) {
            if (this.stackData[0].blobData.length > 0) {
                return this.stackData[0].blobData[0];
            }
        }
    }
    /**
     * getFirstPixelData() - Returns the pixel data as an array buffer
     *                       From the first stack if it exists
     *
     * @param {type} None
     * @returns {type} ArrayBuffer
     */
    getFirstPixelData() {
        if (this.stackData.length > 0) {
            if (this.stackData[0].rawData.length > 0) {
                return this.stackData[0].pixelData;
            }
        }
    }
    /**
     * getImage(stackNum, imageNum) - Given a stack number and image number will return
     *                                that corresponding image blob if it exists
     *
     * @param {number} stackNum
     * @param {number} imageNum
     * @returns {type} Blob
     */
    getImage(stackNum, imageNum) {
        if (this.stackData.length > 0) {
            if (this.stackData[stackNum].blobData.length > 0) {
                return this.stackData[stackNum].blobData[imageNum];
            }
        }
    }
    /**
     * getPixelData(stackNum) - Given a stack number, if it exists, will return that
     *                          corresponding stack's pixel data as an array buffer
     *
     * @param {number} stackNum
     * @returns {type} ArrayBuffer
     */
    getPixelData(stackNum) {
        if (this.stackData.length > 0) {
            if (this.stackData[stackNum].rawData.length > 0) {
                return this.stackData[stackNum].pixelData;
            }
        }
    }
}
