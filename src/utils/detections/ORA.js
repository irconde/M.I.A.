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
     * Returns the first image on the first stack if it exists
     *
     * @returns {Blob} first image on the first stack
     */
    getFirstImage() {
        if (this.stackData.length > 0) {
            if (this.stackData[0].blobData.length > 0) {
                return this.stackData[0].blobData[0];
            }
        }
    }
    /**
     * Returns the pixel data as an array buffer from the first stack if it exists
     *
     * @returns {ArrayBuffer} Pixel data
     */
    getFirstPixelData() {
        if (this.stackData.length > 0) {
            if (this.stackData[0].rawData.length > 0) {
                return this.stackData[0].pixelData;
            }
        }
    }
    /**
     * Given a stack number and image number will return that corresponding image blob if it exists
     *
     * @param {number} stackNum
     * @param {number} imageNum
     * @returns {Blob} Image blob of given stack/image number
     */
    getImage(stackNum, imageNum) {
        if (this.stackData.length > 0) {
            if (this.stackData[stackNum].blobData.length > 0) {
                return this.stackData[stackNum].blobData[imageNum];
            }
        }
    }
    /**
     * Given a stack number, if it exists, will return that corresponding stack's pixel data as an array buffer
     *
     * @param {number} stackNum
     * @returns {ArrayBuffer} Corresponding stack's pixel data
     */
    getPixelData(stackNum) {
        if (this.stackData.length > 0) {
            if (this.stackData[stackNum].rawData.length > 0) {
                return this.stackData[stackNum].pixelData;
            }
        }
    }
}
