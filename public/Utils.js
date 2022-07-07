/**
 * Checks if the current passed in value is inside the specified
 * min and max range.
 * @param {Number} value - Value to check
 * @param {Number} min - Minimum allowed value
 * @param {Number} max - Maximum allowed value
 */
const inRange = (value, min, max) => {
    return (value - min) * (value - max) <= 0;
};

/**
 * Takes in a 16 bit gray scale value between 0 - 65535 along with the build intervals from this.buildIntervals()
 * It returns an 8 bit gray scale value between 0 - 255. There is lose of data but the image retains most of it's quality
 * @param {Number} greyScale
 * @param {Array<{min: Number; max: Number;}>} intervals
 * @returns {Number} 8 Bit color in range of 0-255
 */
const findGrayValue = (greyScale, intervals) => {
    let result;
    for (let x = 0; x < intervals.length; x++) {
        if (inRange(greyScale, intervals[x].min, intervals[x].max)) {
            result = x;
            break;
        }
    }
    return result;
};

/**
 * buildIntervals - Builder function to create the needed ranges to associate a 16 bit value to an 8 bit value given certain ranges
 * @returns {Array<{min: Number; max: Number;}>} Array of objects with key values of min and max
 */
const buildIntervals = () => {
    const intervals = [{ min: 0, max: 255 }];
    for (let i = 255; i < 65535; i += 256) {
        intervals.push({ min: i, max: i + 256 });
    }
    return intervals;
};

module.exports.buildIntervals = buildIntervals;
module.exports.findGrayValue = findGrayValue;
