/**
 * Class that encompasses any secondary method to support the primary features of the client
 */
import * as constants from './Constants';
import { useLayoutEffect, useState } from 'react';
import randomColor from 'randomcolor';
const cloneDeep = require('lodash.clonedeep');

export default class Utils {
    /**
     * @static decimalToPercentage - Method that converts a decimal value into a percentage
     *
     * @param  {type} num Float value <= 1.0 with common decimal format
     * @return {type}     int value that represents the percentage value equivalent to the given input float value
     */
    static decimalToPercentage(num) {
        return Math.floor(num * 100);
    }

    /**
     * hexToRgb - Take in a string hex value such as '#F7B500' and will return an object containing
     *            the red (r), green (g), and blue (b) properties with its correct values.
     *
     * @param {String} hex
     */
    static hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : null;
    }

    /**
     * Get random hex color from given seed value.
     * @param {string} seed seed value for random color generation
     * @returns {string} hex color value string
     */
    static getRandomColor(seed) {
        return randomColor({
            seed: seed,
            hue: 'random',
            luminosity: 'bright',
        });
    }

    /**
     * @static formatDetectionLabel - Method that creates a string to be used as
     * detection label, providing information regarding both the type of threat and the associated confidence level
     *
     * @param  {type} objectClass     string value that indicates the threat type
     * @param  {type} confidenceLevel int value that indicates the confidence level in the form of a percentage
     * @return {type}                 resulting string to be used as detection label
     */
    static formatDetectionLabel(objectClass, confidenceLevel) {
        return objectClass.toUpperCase() + ' · ' + confidenceLevel + '%';
    }

    /**
     * @static getTextLabelSize - Method that provides the size of a label containing the given string
     *
     * @param  {type} context   2d canvas context
     * @param  {type} labelText string value to be displayed inside the label
     * @param  {type} padding   blank space surrounding the text within the label
     * @return {type}           dictionary with two components: width and height
     */
    static getTextLabelSize(context, labelText, padding) {
        const textSize = context.measureText(labelText);
        // Approximation to estimate the text height
        const lineHeight = context.measureText('M').width;
        return {
            width: textSize.width + 2 * padding,
            height: lineHeight + 2 * padding,
        };
    }

    /**
     * @static pointInRect - Method that indicates whether a given point is inside a rectangle or not
     *
     * @param  {type} point 2D point with two coordinates, x and y
     * @param  {type} rect  rectangle defined as a float array of size 4. Includes the coordinates of the two end-points of the rectangle diagonal
     * @return {type}       boolean value: true if teh point is inside the rectangle; false otherwise
     */
    static pointInRect(point, rect) {
        return (
            point.x >= rect[0] &&
            point.x <= rect[2] &&
            point.y >= rect[1] &&
            point.y <= rect[3]
        );
    }

    /**
     * @static rectAreEquals - Method that indicates whether the two given rectangles are the equals or not
     *
     * @return {boolean} boolean value: true if the corner points of the two rectangles have the same coordinates. False, otherwise.
     * @param {array} rectA rectangle defined as a float array of size 4. Includes the coordinates of the two end-points of the rectangle diagonal
     * @param {array} rectB rectangle defined as a float array of size 4. Includes the coordinates of the two end-points of the rectangle diagonal
     */
    static rectAreEquals(rectA, rectB) {
        for (let index = 0; index < rectA.length; index++) {
            if (rectA[index] !== rectB[index]) {
                return false;
            }
        }
        return true;
    }

    /**
     * b64toBlob - Converts binary64 encoding to a blob to display
     *
     * @param  {type} b64Data Binary string
     * @param  {type} contentType The MIMI type, image/dcs
     * @return {type}               blob
     */
    static b64toBlob = (
        b64Data,
        contentType = 'image/dcs',
        sliceSize = 512
    ) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (
            let offset = 0;
            offset < byteCharacters.length;
            offset += sliceSize
        ) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };

    /**
     * base64ToArrayBuffer - Converts the base 64 to an arraybuffer
     *
     * @param {string} base64 Binary 64 string to convert to ArrayBuffer
     * @return {type} ArrayBuffer
     */
    static base64ToArrayBuffer(base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * blobToBase64 - Converts a blob object to a base 64 string.
     * @param {Blob} blob
     * @returns {Promise} Promise that resolves once the blob has been converted to base64, or rejects on error.
     */
    static async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                const dataUrl = reader.result;
                const base64 = dataUrl.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    }

    /**
     * getFilenameFromURI - Methods that extracts the name of a file for the corresponding given Uri
     *
     * @param {String} uri - String value that represents the location of a img file within an ORA file
     * @return {MouseEvent} fileName - String value with the name of the file
     */
    static getFilenameFromURI(fileSrcPath) {
        const userAgent = window.navigator.userAgent,
            platform = window.navigator.platform,
            macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'];
        let os = null;
        let fileName = null;
        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'Mac';
            fileName = fileSrcPath.split('/')[1];
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'iOS';
            fileName = fileSrcPath.split('/')[1];
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'Windows';
            fileName = fileSrcPath.split('\\')[1];
        } else if (/Android/.test(userAgent)) {
            os = 'Android';
            fileName = fileSrcPath.split('/')[1];
        } else if (!os && /Linux/.test(platform)) {
            os = 'Linux';
            fileName = fileSrcPath.split('/')[1];
        }
        return fileName;
    }

    static changeViewport(singleViewport) {
        let viewportTop = document.getElementById('dicomImageLeft');
        let viewportSide = document.getElementById('dicomImageRight');
        let verticalDivider = document.getElementById('verticalDivider');

        if (singleViewport === true) {
            viewportTop.classList.remove('twoViewportsTop');
            viewportTop.classList.remove('singleViewportTop');
            viewportTop.classList.add('singleViewportTop');
            viewportTop.style.visibility = 'visible';

            viewportSide.classList.remove('twoViewportsSide');
            viewportSide.classList.remove('singleViewportSide');
            viewportSide.classList.add('singleViewportSide');
            viewportSide.style.visibility = 'hidden';

            verticalDivider.classList.add('dividerHidden');
            verticalDivider.classList.remove('dividerVisible');
        } else {
            viewportTop.classList.remove('singleViewportTop');
            viewportTop.classList.remove('twoViewportsTop');
            viewportTop.classList.add('twoViewportsTop');
            viewportTop.style.visibility = 'visible';

            viewportSide.classList.remove('singleViewportSide');
            viewportSide.classList.remove('twoViewportsSide');
            viewportSide.classList.add('twoViewportsSide');
            viewportSide.style.visibility = 'visible';

            verticalDivider.classList.remove('dividerHidden');
            verticalDivider.classList.add('dividerVisible');
        }
    }

    /**
     * getDataFromViewport - Get data required for validation buttons' proper rendering
     *
     * @return {dictionary} viewportInfo - viewport-related data: viewport name and offset
     * @param viewportName {string} - Viewport's name
     * @param DOM {Document} - HTML DOM
     */
    static getDataFromViewport(viewportName, DOM) {
        let viewportInfo = {};
        let viewport = undefined;
        let offsetLeft = 0;
        let viewportElement;
        const viewportId =
            viewportName === 'top'
                ? 'dicomImageLeft'
                : viewportName === 'side'
                ? 'dicomImageRight'
                : undefined;
        if (viewportId !== undefined)
            viewportElement = DOM.getElementById(viewportId);
        if (viewportElement !== undefined) {
            offsetLeft = viewportElement.offsetLeft;
            viewport =
                viewportName === 'top'
                    ? constants.viewport.TOP
                    : viewportName === 'side'
                    ? constants.viewport.SIDE
                    : undefined;
        }
        viewportInfo['viewport'] = viewport;
        viewportInfo['offset'] = offsetLeft;
        return viewportInfo;
    }

    /**
     * eventToViewportInfo - Get data required for validation buttons' proper rendering from mouse event
     *
     * @return {dictionary} viewportInfo - viewport-related data: viewport name and offset
     * @param e {MouseEvent} - Mouse event
     */
    static eventToViewportInfo(e) {
        let viewportInfo = {};
        let viewport = undefined;
        let offsetLeft = 0;
        if (e.detail !== null) {
            if (e.detail.element !== undefined) {
                if (e.detail.element.id === 'dicomImageLeft') {
                    viewport = constants.viewport.TOP;
                    offsetLeft = e.target.offsetLeft;
                } else if (e.detail.element.id === 'dicomImageRight') {
                    viewport = constants.viewport.SIDE;
                    offsetLeft = e.target.offsetLeft;
                }
            } else {
                if (
                    e.target.id === 'top-span' ||
                    e.target.id === 'top-container'
                ) {
                    viewport = constants.viewport.TOP;
                    offsetLeft = e.target.offsetLeft;
                } else if (
                    e.target.id === 'side-span' ||
                    e.target.id === 'side-container'
                ) {
                    viewport = constants.viewport.SIDE;
                    offsetLeft = e.target.offsetLeft;
                }
            }
        }
        viewportInfo['viewport'] = viewport;
        viewportInfo['offset'] = offsetLeft;
        return viewportInfo;
    }
    /**
     * Used to mock CustomEvents for mouse events that cornerstone does not have custom events for
     * such as 'mouseup'
     * @param {Event} e Mouse event data
     * @param {HTMLElement} element on which the event happened
     */
    static mockCornerstoneEvent(e, element) {
        let fakeEvent = { ...e };
        fakeEvent.detail = { ...fakeEvent.detail, element: element };
        fakeEvent.target = element;

        return fakeEvent;
    }
    /**
     * getScreenSize - Simply retrieves the device's screen size that is accessing the application.
     *
     * @param {none} none
     * @returns {screenSize} screenSize - can be accessed via
     *                                    const [width, height] = Utils.getUserScreenSize()
     */
    static getScreenSize() {
        const [screenSize, setScreenSize] = useState([0, 0]);

        useLayoutEffect(() => {
            function updateScreenSize() {
                setScreenSize([window.innerWidth, window.innerHeight]);
            }
            window.addEventListener('resize', updateScreenSize);
            updateScreenSize();
            return () => window.removeEventListener('resize', updateScreenSize);
        }, []);

        return screenSize;
    }

    /**
     * inRange - Checks if the current passed in value is inside the specified
     *           min and max range.
     *
     * @param {number} value - Value to check
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     */
    static inRange(value, min, max) {
        return (value - min) * (value - max) <= 0;
    }

    /**
     * calculateZoomLevel - Computes zoom level for CornerstoneJS viewport based on the viewport's width.
     *
     * @param {number} width - Viewport's width
     */
    static calculateZoomLevel(width) {
        return (
            (constants.viewportStyle.ZOOM * parseInt(width, 10)) /
            constants.viewportStyle.REF_VIEWPORT_WIDTH
        );
    }

    /**
     * truncateString - Truncate a given string.
     *
     * @param {string} originalString - original string value
     * @param {number} numberOfChars - target maximum number of chars in string
     */
    static truncateString(originalString, numberOfChars) {
        if (originalString.length <= numberOfChars) return originalString;
        return originalString.substring(0, numberOfChars) + '...';
    }

    /**
     * recalculateRectangle - Recalculates the four corners of a rectangle based on the coordinates of the corner being moved
     *
     * @param {dictionary} cornerList - rectangle corners' coordinates
     */
    static recalculateRectangle(cornerList) {
        const cornerKeys = Object.keys(cornerList);
        let movingCornerKey;
        let movingCornerKeyIndex;
        for (let i = 0; i < cornerKeys.length; i++) {
            if (cornerList[cornerKeys[i]].hasMoved === true) {
                movingCornerKeyIndex = i;
                movingCornerKey = cornerKeys[i];
                break;
            }
        }
        if (movingCornerKey === undefined) {
            return cornerList;
        }
        let newRectDiagonal = movingCornerKey.includes('start')
            ? [movingCornerKey, cornerKeys[movingCornerKeyIndex + 1]]
            : [cornerKeys[movingCornerKeyIndex - 1], movingCornerKey];

        let secondDiagonalFirstIndex = movingCornerKey.includes('prima')
            ? 0
            : 2;
        cornerList[cornerKeys[secondDiagonalFirstIndex]].x =
            cornerList[newRectDiagonal[0]].x;
        cornerList[cornerKeys[secondDiagonalFirstIndex]].y =
            cornerList[newRectDiagonal[1]].y;
        cornerList[cornerKeys[secondDiagonalFirstIndex + 1]].x =
            cornerList[newRectDiagonal[1]].x;
        cornerList[cornerKeys[secondDiagonalFirstIndex + 1]].y =
            cornerList[newRectDiagonal[0]].y;

        return cornerList;
    }

    /**
     * handleDataToArray - Convert list of handles into an array of float values
     *
     * @param {array} polygonData - list of handles, i.e., the vertices, of a polygon
     */
    static polygonDataToCoordArray(polygonData) {
        let points = [];
        for (let index in polygonData) {
            points.push(polygonData[index].x);
            points.push(polygonData[index].y);
        }
        return points;
    }

    /**
     * polygonDataToXYArray - Convert list of handles into an array of objects with x, y float values
     *                        It will as well, calculate anchor points in percentage values of each point
     *                        corresponding to each wall of the bounding box(top/bottom/left/right). Which
     *                        represents its position as a percentage value inside the bounding box.
     *
     * @param {array} polygonData - list of handles, i.e., the vertices, of a polygon
     * @returns {Array<Object{x, y, anchor: {top, bottom, left, right}}>}
     */
    static polygonDataToXYArray(polygonData, boundingBox) {
        const xDist = boundingBox[2] - boundingBox[0];
        const yDist = boundingBox[3] - boundingBox[1];
        let points = [];
        for (let index in polygonData) {
            points.push({
                x: polygonData[index].x,
                y: polygonData[index].y,
                anchor: {
                    top:
                        ((boundingBox[3] - polygonData[index].y) / yDist) * 100,
                    bottom:
                        ((polygonData[index].y - boundingBox[1]) / yDist) * 100,
                    left:
                        ((polygonData[index].x - boundingBox[0]) / xDist) * 100,
                    right:
                        ((boundingBox[2] - polygonData[index].x) / xDist) * 100,
                },
            });
        }
        return points;
    }

    /**
     * calculateBoundingBox - Calculate the coordinates of the bounding box for a given polygon
     *
     * @param {array} polygonData - list of handles, i.e., the vertices, of a polygon
     */
    static calculateBoundingBox(polygonData) {
        let x_values = [];
        let y_values = [];
        for (let index in polygonData) {
            x_values.push(polygonData[index].x);
            y_values.push(polygonData[index].y);
        }
        const x_min = Math.min(...x_values);
        const y_max = Math.max(...y_values);
        const x_max = Math.max(...x_values);
        const y_min = Math.min(...y_values);
        return [x_min, y_min, x_max, y_max];
    }

    /**
     * calculateMaskAnchorPoints - Will recalculate the anchor points of a polygon mask
     *
     * @param {Array<Number>} boundingBox - Bounding box data formatted as [x_start, y_start, x_end, y_end]
     * @param {Array<Object{x, y, anchor: {top, bottom, left, right}}>} polygonData - list of handles, i.e., the vertices, of a polygon
     * @returns
     */
    static calculateMaskAnchorPoints(boundingBox, polygonCoords) {
        const xDist = boundingBox[2] - boundingBox[0];
        const yDist = boundingBox[3] - boundingBox[1];
        polygonCoords.forEach((point) => {
            point.anchor.top = ((boundingBox[3] - point.y) / yDist) * 100;
            point.anchor.bottom = ((point.y - boundingBox[1]) / yDist) * 100;
            point.anchor.left = ((point.x - boundingBox[0]) / xDist) * 100;
            point.anchor.right = ((boundingBox[2] - point.x) / xDist) * 100;
        });
        return polygonCoords;
    }

    /**
     * calculatePolygonMask - Calculate the coordinates of the bounding box for a given polygon
     *
     * @param {Array<Number>} boundingBox - Bounding box data formatted as [x_start, y_start, x_end, y_end]
     * @param {Array<Object{x, y, anchor: {top, bottom, left, right}}>} polygonData - list of handles, i.e., the vertices, of a polygon
     * @returns {Array<Object{x, y, anchor: {top, bottom, left, right}}>} - newPolygonData with updated points based on anchor points
     */
    static calculatePolygonMask(boundingBox, polygonData) {
        let newPolygonData = cloneDeep(polygonData);
        const xDist = boundingBox[2] - boundingBox[0];
        const yDist = boundingBox[3] - boundingBox[1];
        newPolygonData.forEach((point) => {
            if (point.anchor.left !== 0 && point.anchor.right !== 0) {
                point.x = boundingBox[0] + (xDist * point.anchor.left) / 100;
            } else if (point.anchor.right === 0) {
                point.x = boundingBox[2];
            } else if (point.anchor.left === 0) {
                point.x = boundingBox[0];
            }
            if (point.anchor.top !== 0 && point.anchor.bottom !== 0) {
                point.y = boundingBox[1] + (yDist * point.anchor.bottom) / 100;
            } else if (point.anchor.bottom === 0) {
                point.y = boundingBox[1];
            } else if (point.anchor.top === 0) {
                point.y = boundingBox[3];
            }
        });
        return newPolygonData;
    }

    /**
     * getDistanceBetween - calculates the Euclidean distance between two 2D points.
     *
     * @param {dictionary} position1 - a dictionary of the form {x:value, y:value}
     * @param {dictionary} position2 - a dictionary of the form {x:value, y:value}
     * @return {number} - the Euclidean distance between position1 and position2
     */
    static getDistanceBetween(position1, position2) {
        return Math.sqrt(
            Math.pow(position1.x - position2.x, 2) +
                Math.pow(position1.y - position2.y, 2)
        );
    }
}
