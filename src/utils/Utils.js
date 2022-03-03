/**
 * Class that encompasses any secondary method to support the primary features of the client
 */
import * as constants from './Constants';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { arrayBufferToImage, createImage } from 'cornerstone-web-image-loader';
import randomColor from 'randomcolor';
const cloneDeep = require('lodash.clonedeep');

export default class Utils {
    /**
     * loadImage - Custom cornerstone image loader; Takes arrayBuffer provided to utilize arrayBufferToImage from
     * CornerstoneJS's web image loader library. Returns a promise that resolves a Cornerstone Image Object.
     *
     * @param {String} imageId
     * @param {Array} arrayBuffer
     */
    static async loadImage(imageId, arrayBuffer) {
        const promise = new Promise((resolve, reject) => {
            const imagePromise = arrayBufferToImage(arrayBuffer);
            imagePromise
                .then((image) => {
                    const imageObject = createImage(image, imageId);
                    imageObject.rgba = true;
                    resolve(imageObject);
                })
                .catch((error) => {
                    reject(error);
                });
        });

        return promise;
    }

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
     * getDetectionType - Utility method that determines a detection's type according to constants.detectionType.
     *
     * @param {Object} detection
     * @return {constants.detectionType} type
     */
    static getDetectionType(detection) {
        let type;
        if (
            detection.binaryMask.length !== 0 &&
            detection.binaryMask[0].length !== 0 &&
            detection.polygonMask.length === 0
        ) {
            type = constants.detectionType.BINARY;
        } else if (detection.polygonMask.length !== 0) {
            type = constants.detectionType.POLYGON;
        } else {
            type = constants.detectionType.BOUNDING;
        }
        return type;
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
     * buildIntervals - Builder function to create the needed ranges to associate a 16 bit value to an 8 bit value given certain ranges
     *
     * @returns {Array<{min: Number, max: Number}>} Array of objects with key values of min and max
     */
    static buildIntervals() {
        const intervals = [{ min: 0, max: 255 }];
        for (let i = 255; i < 65535; i += 256) {
            intervals.push({ min: i, max: i + 256 });
        }
        return intervals;
    }

    /**
     * findGrayValue - Takes in a 16 bit gray scale value between 0 - 65535 along with the build intervals from this.buildIntervals()
     *                 It returns an 8 bit gray scale value between 0 - 255. There is lose of data but the image retains most of it's quality
     *
     * @param {Number} greyScale
     * @param {Array<{min: Number, max: Number}>} intervals
     * @returns {Number} 8 Bit Color in range of 0-255
     */
    static findGrayValue(greyScale, intervals) {
        let result;
        for (let x = 0; x < intervals.length; x++) {
            if (this.inRange(greyScale, intervals[x].min, intervals[x].max)) {
                result = x;
                break;
            }
        }
        return result;
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
     * calculateViewportDimensions - Performs the calculations for the widths and position of viewports.
     *                         It will use the cornerstone object to perform the resize on the canvas elements
     *
     * @param {Object} cornerstone
     * @param {Boolean} singleViewport
     * @param {Boolean} collapsedSideMenu
     * @param {Boolean} collapsedLazyMenu
     * @param {Boolean} desktopMode
     *
     */
    static calculateViewportDimensions(
        cornerstone,
        singleViewport,
        collapsedSideMenu,
        collapsedLazyMenu = true,
        desktopMode = false
    ) {
        // Array of viewport or viewports to loop through and resize at the end
        let viewports = [];
        const totalMenuWidth =
            !collapsedLazyMenu && !collapsedSideMenu && desktopMode
                ? constants.sideMenuWidth * 2
                : constants.sideMenuWidth;
        if (singleViewport === false) {
            const viewportTop = document.getElementById('dicomImageLeft');
            const viewportSide = document.getElementById('dicomImageRight');
            viewports.push(viewportTop);
            viewports.push(viewportSide);
            viewportTop.style.width = '';
            viewportSide.style.width = '';
            viewportSide.style.left = '';
            const verticalDivider = document.getElementById('verticalDivider');
            if (collapsedLazyMenu && collapsedSideMenu) {
                // Both menus are collapsed
                const width = window.innerWidth / 2 + constants.RESOLUTION_UNIT;
                viewportSide.style.width = width;
                viewportTop.style.width = width;
                viewportTop.style.left = 0;
                verticalDivider.style.left = viewportTop.style.width;
                viewportSide.style.left =
                    viewportTop.style.width + verticalDivider.style.width;
            } else if (collapsedLazyMenu && !collapsedSideMenu) {
                // Only one menu is collapsed, lazy menu is collapsed
                const width =
                    (window.innerWidth - constants.sideMenuWidth) / 2 +
                    constants.RESOLUTION_UNIT;
                viewportSide.style.width = width;
                viewportTop.style.width = width;
                viewportTop.style.left = 0;
                verticalDivider.style.left = viewportTop.style.width;
                viewportSide.style.left =
                    viewportTop.style.width + verticalDivider.style.width;
            } else if (!collapsedLazyMenu && collapsedSideMenu) {
                const width =
                    (window.innerWidth - constants.sideMenuWidth) / 2 +
                    constants.RESOLUTION_UNIT;
                viewportSide.style.width = width;
                viewportTop.style.width = width;
                if (desktopMode) {
                    viewportTop.style.left = constants.sideMenuWidth + 'px';
                    verticalDivider.style.left =
                        parseInt(viewportTop.style.width) +
                        constants.sideMenuWidth +
                        'px';
                    viewportSide.style.left =
                        parseInt(viewportTop.style.width) +
                        constants.sideMenuWidth +
                        'px';
                } else {
                    verticalDivider.style.left = viewportTop.style.width;
                    viewportSide.style.left =
                        viewportTop.style.width + verticalDivider.style.width;
                }
            } else {
                // Both menus are visible
                const width =
                    (window.innerWidth - totalMenuWidth) / 2 +
                    constants.RESOLUTION_UNIT;
                viewportSide.style.width = width;
                viewportTop.style.width = width;
                if (desktopMode) {
                    viewportTop.style.left = constants.sideMenuWidth + 'px';
                    verticalDivider.style.left =
                        parseInt(viewportTop.style.width) +
                        constants.sideMenuWidth +
                        'px';
                    viewportSide.style.left =
                        parseInt(viewportTop.style.width) +
                        constants.sideMenuWidth +
                        'px';
                } else {
                    verticalDivider.style.left = viewportTop.style.width;
                    viewportSide.style.left =
                        viewportTop.style.width + verticalDivider.style.width;
                }
            }
        } else {
            const singleViewport = document.getElementById('dicomImageLeft');
            viewports.push(singleViewport);
            singleViewport.style.width = '';
            if (collapsedLazyMenu && collapsedSideMenu) {
                const width = window.innerWidth + constants.RESOLUTION_UNIT;
                singleViewport.style.width = width;
                singleViewport.style.left = 0;
            } else if (collapsedLazyMenu && !collapsedSideMenu) {
                //
                const width =
                    window.innerWidth -
                    constants.sideMenuWidth +
                    constants.RESOLUTION_UNIT;
                singleViewport.style.width = width;
                singleViewport.style.left = 0;
            } else if (!collapsedLazyMenu && collapsedSideMenu) {
                //
                const width =
                    window.innerWidth -
                    constants.sideMenuWidth +
                    constants.RESOLUTION_UNIT;
                singleViewport.style.width = width;
                singleViewport.style.left = constants.sideMenuWidth + 'px';
            } else {
                const width =
                    window.innerWidth -
                    totalMenuWidth +
                    constants.RESOLUTION_UNIT;
                singleViewport.style.width = width;
                singleViewport.style.left = constants.sideMenuWidth + 'px';
            }
        }
        // Sometimes the Canvas elements are not enabled yet and will cause an error, but the App can still render the image
        try {
            viewports.forEach((viewport) => {
                cornerstone.resize(viewport);
            });
        } catch (error) {
            console.log('Cornerstone Elements not enabled yet');
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
     * usePrevious - For use in functional components to compare a current value with the next value in a
     *               useEffect in the functional component.
     * @param {Any} value - Any type allowed
     * @returns {Ref.current}
     */
    static usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    };

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
     * deviceType - Determines the device type based on the navigator userAgent
     * @params {None}
     * @returns {constants.DEVICE_TYPE}
     */
    static deviceType = () => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return constants.DEVICE_TYPE.TABLET;
        } else if (
            /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
                ua
            )
        ) {
            return constants.DEVICE_TYPE.MOBILE;
        }
        return constants.DEVICE_TYPE.DESKTOP;
    };

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
     * polygonDataToCoordArray - Convert list of handles into an array of float values
     *
     * @param {Array<Number>} polygonData - list of handles, i.e., the vertices, of a polygon
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
     * coordArrayToPolygonData - Convert list of handles into an array of float values
     *
     * @param {Array<Number>} coordArray - list of handles, i.e., the vertices, of a polygon (x_1, y_1, x_2, y_2, ...x_n, y_n )
     */
    static coordArrayToPolygonData(coordArray) {
        let data = {};
        let count = 0;
        for (let i = 0; i < coordArray.length; i += 2) {
            let x = coordArray[i];
            let y = coordArray[i + 1];
            data[count] = { x: x, y: y };
            count++;
        }
        return data;
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
        newPolygonData = this.calculateMaskAnchorPoints(
            boundingBox,
            newPolygonData
        );
        return newPolygonData;
    }

    /**
     * renderPolygonMasks - Will render the polygon mask coordinates for the passed in context
     *
     * @param {eventData.context} context
     * @param {Array<{x, y}>} polygonCoords
     */
    static renderPolygonMasks(context, polygonCoords) {
        let index = 0;
        context.beginPath();
        context.moveTo(polygonCoords[index].x, polygonCoords[index].y);
        for (let i = index; i < polygonCoords.length; i++) {
            context.lineTo(polygonCoords[i].x, polygonCoords[i].y);
        }
        context.closePath();
        context.fill();
    }

    /**
     * renderBinaryMasks - Method that renders the binary mask associated with a detection
     *
     * @param  {Array<Array<Number>>} data DICOS+TDR data
     * @param  {eventData.canvasContext} context Rendering context
     * @return {None} None
     */
    static renderBinaryMasks(data, context, zoom = 1) {
        if (data === undefined || data === null || data.length === 0) {
            return;
        }
        if (data[0].length === 0) return;
        const baseX = data[1][0];
        const baseY = data[1][1];
        const maskWidth = data[2][0];
        const maskHeight = data[2][1];
        const pixelData = data[0];
        context.imageSmoothingEnabled = true;
        for (let y = 0; y < maskHeight; y++)
            for (let x = 0; x < maskWidth; x++) {
                if (pixelData[x + y * maskWidth] === 1) {
                    context.fillRect(baseX + x * zoom, baseY + y * zoom, 1, 1);
                }
            }
        context.imageSmoothingEnabled = false;
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

    /**
     * onSegment - Given three colinear points p, q, r, the function checks if point q lies on line segment 'pr'
     *
     * @param {dictionary} p - a dictionary of the form {x:value, y:value}
     * @param {dictionary} q - a dictionary of the form {x:value, y:value}
     * @param {dictionary} r - a dictionary of the form {x:value, y:value}
     * @return {boolean} - is point q on line segment 'pr'
     */
    static onSegment(p, q, r) {
        if (
            q.x <= Math.max(p.x, r.x) &&
            q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) &&
            q.y >= Math.min(p.y, r.y)
        ) {
            return true;
        }
        return false;
    }

    /**
     * orientation - To find orientation of ordered triplet (p, q, r).
     *
     * @param {dictionary} p - a dictionary of the form {x:value, y:value}
     * @param {dictionary} q - a dictionary of the form {x:value, y:value}
     * @param {dictionary} r - a dictionary of the form {x:value, y:value}
     * @return {number} -  The function returns following values: 0 --> p, q and r are colinear, 1 --> Clockwise, 2 --> Counterclockwise
     */
    static orientation(p, q, r) {
        let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

        if (val == 0) {
            return 0; // colinear
        }
        return val > 0 ? 1 : 2; // clock or counterclock wise
    }

    /**
     * doIntersect - The function that returns true if line segment 'p1q1' and 'p2q2' intersect.
     *
     * @param {dictionary} p1 - a dictionary of the form {x:value, y:value}
     * @param {dictionary} q1 - a dictionary of the form {x:value, y:value}
     * @param {dictionary} p2 - a dictionary of the form {x:value, y:value}
     * @param {dictionary} q2 - a dictionary of the form {x:value, y:value}
     * @return {boolean} -  returns true if line segment 'p1q1' and 'p2q2' intersect
     */
    static doIntersect(p1, q1, p2, q2) {
        // Find the four orientations needed for general and special cases

        let o1 = this.orientation(p1, q1, p2);
        let o2 = this.orientation(p1, q1, q2);
        let o3 = this.orientation(p2, q2, p1);
        let o4 = this.orientation(p2, q2, q1);

        // General case
        if (o1 != o2 && o3 != o4) {
            return true;
        }

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        if (o1 == 0 && this.onSegment(p1, p2, q1)) {
            return true;
        }

        // p1, q1 and p2 are colinear and q2 lies on segment p1q1
        if (o2 == 0 && this.onSegment(p1, q2, q1)) {
            return true;
        }

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        if (o3 == 0 && this.onSegment(p2, p1, q2)) {
            return true;
        }

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        if (o4 == 0 && this.onSegment(p2, q1, q2)) {
            return true;
        }

        // Doesn't fall in any of the above cases
        return false;
    }

    /**
     * isInside - The function that returns true if line segment 'p1q1' and 'p2q2' intersect.
     *
     * @param {Array<{x, y}>} polygon - a dictionary of the form {x:value, y:value}
     * @param {Number} n - number of verticies in polygon array
     * @param {dictionary} p - a dictionary of the form {x:value, y:value}
     * @return {boolean} -  Returns true if the point p lies inside the polygon[] with n vertices
     */
    static isInside(polygon, n, p) {
        // There must be at least 3 vertices in polygon[]
        if (n < 3) {
            return false;
        }

        // Create a point for line segment from p to infinite
        let extreme = {
            x: 99999,
            y: p.y,
        };

        // Count intersections of the above line
        // with sides of polygon
        let count = 0,
            i = 0;
        do {
            let next = (i + 1) % n;
            // Check if the line segment from 'p' to 'extreme' intersects with the line segment from 'polygon[i]' to 'polygon[next]'
            if (this.doIntersect(polygon[i], polygon[next], p, extreme)) {
                // If the point 'p' is colinear with line segment 'i-next', then check if it lies on segment. If it lies, return true, otherwise false
                if (this.orientation(polygon[i], p, polygon[next]) == 0) {
                    return this.onSegment(polygon[i], p, polygon[next]);
                }
                count++;
            }
            i = next;
        } while (i != 0);

        // Return true if count is odd, false otherwise
        return count % 2 == 1; // Same as (count%2 == 1)
    }

    /**
     * polygonToBinaryMask - Method that converts the polygon mask associated with a detection to its binary mask counterpart
     *
     * @param  {Array<Number>} coords    polygon mask coordinates
     *
     */
    static polygonToBinaryMask(coords) {
        if (coords === undefined || coords === null || coords.length === 0) {
            return;
        }

        let n = coords.length;

        let min = {
            x: 99999,
            y: 99999,
        };
        let max = {
            x: 0,
            y: 0,
        };

        for (let i = 0; i < coords.length; i++) {
            //MIN
            if (coords[i].x < min.x) min.x = Math.floor(coords[i].x);
            if (coords[i].y < min.y) min.y = Math.floor(coords[i].y);

            //MAX
            if (coords[i].x > max.x) max.x = Math.floor(coords[i].x);
            if (coords[i].y > max.y) max.y = Math.floor(coords[i].y);
        }

        const x_diff = max.x - min.x;
        const y_diff = max.y - min.y;

        let bitmap = [];

        for (let i = 0; i < y_diff; i++) {
            for (let j = 0; j < x_diff; j++) {
                let p = {
                    //Create new point to determine if within polygon.
                    x: j + min.x,
                    y: i + min.y,
                };
                bitmap[j + i * x_diff] = this.isInside(coords, n, p) ? 1 : 0;
            }
        }

        let data = [];
        data[0] = bitmap;
        data[1] = [min.x, min.y];
        data[2] = [x_diff, y_diff];

        return data;
    }
}
