import csTools from 'eac-cornerstone-tools';
import * as constants from '../utils/Constants';
import Utils from '../utils/Utils.js';
import * as cornerstone from 'cornerstone-core';
const BaseAnnotationTool = csTools.importInternal('base/BaseAnnotationTool');
const getNewContext = csTools.importInternal('drawing/getNewContext');
const draw = csTools.importInternal('drawing/draw');
const setShadow = csTools.importInternal('drawing/setShadow');
const drawRect = csTools.importInternal('drawing/drawRect');

/**
 * @public
 * @class DetectionMovementTool
 * @classdesc Tool for drawing rectangular regions of interest
 * @extends Tools.Base.BaseAnnotationTool
 */
export default class DetectionMovementTool extends BaseAnnotationTool {
    constructor(props = {}) {
        const defaultProps = {
            name: 'DetectionMovementTool',
            supportedInteractionTypes: ['Mouse', 'Touch'],
            configuration: {
                drawHandles: true,
                renderDashed: false,
            },
        };
        super(props, defaultProps);
    }

    // Method that overrides the original abstract method in the cornerstone-tools library
    // Automatically invoked on mouse move to know whether the mouse pointer is
    // over (or close to) the rectangle's border
    pointNearTool(element, data, coords, interactionType) {
        const hasStartAndEndHandles =
            data && data.handles && data.handles.start && data.handles.end;
        const validParameters = hasStartAndEndHandles;

        if (!validParameters) {
            console.log("invalid parameters supplied to tool's pointNearTool");
        }
        if (!validParameters || data.visible === false) {
            return false;
        }
        const startCanvas = cornerstone.pixelToCanvas(
            element,
            data.handles.start
        );
        const endCanvas = cornerstone.pixelToCanvas(element, data.handles.end);
        const rect = [startCanvas.x, startCanvas.y, endCanvas.x, endCanvas.y];
        return Utils.pointInRect(coords, rect);
    }

    // Method that overrides the original abstract method in the cornerstone-tools library
    // Automatically invoked when a handle is selected and it's being dragged
    handleSelectedCallback(evt, toolData, handle, interactionType = 'mouse') {
        if (this.options.editionMode === constants.editionMode.MOVE) {
            super.handleSelectedCallback(
                evt,
                toolData,
                handle,
                interactionType
            );
        }
    }

    // Method that overrides the original abstract method in the cornerstone-tools library
    // Automatically invoked to render all the widgets that comprise a detection
    renderToolData(evt) {
        const toolData = csTools.getToolState(evt.currentTarget, this.name);
        if (!toolData) {
            // No tool data
            return;
        }
        const eventData = evt.detail;
        // eslint-disable-next-line no-unused-vars
        const { image, element } = eventData;
        const zoom =
            element.id === 'dicomImageRight'
                ? this.options.zoomLevelSide
                : this.options.zoomLevelTop;
        const lineWidth = constants.detectionStyle.BORDER_WIDTH * zoom;

        const lineDash = csTools.getModule('globalConfiguration').configuration
            .lineDash;
        const { renderDashed } = this.configuration;

        const context = getNewContext(eventData.canvasContext.canvas);

        const color = constants.detectionStyle.NORMAL_COLOR;

        draw(context, (context) => {
            // If we have tool data for this element - iterate over each set and draw it
            for (let i = 0; i < toolData.data.length; i++) {
                const data = toolData.data[i];
                if (data.visible === false) {
                    continue;
                }
                // Configure
                setShadow(context, this.configuration);
                const rectOptions = { color };

                if (renderDashed) {
                    rectOptions.lineDash = lineDash;
                }
                rectOptions.lineWidth = lineWidth;

                // Draw bounding box
                drawRect(
                    context,
                    element,
                    data.handles.start,
                    data.handles.end,
                    rectOptions,
                    'pixel'
                );
                // Label Rendering
                let myCoords;
                if (
                    data.handles.end.y < data.handles.start.y &&
                    data.handles.end.x < data.handles.start.x
                ) {
                    myCoords = cornerstone.pixelToCanvas(element, {
                        x: data.handles.end.x,
                        y: data.handles.end.y,
                    });
                } else if (
                    data.handles.end.y > data.handles.start.y &&
                    data.handles.end.x < data.handles.start.x
                ) {
                    myCoords = cornerstone.pixelToCanvas(element, {
                        x: data.handles.end.x,
                        y: data.handles.start.y,
                    });
                } else if (data.handles.end.y < data.handles.start.y) {
                    myCoords = cornerstone.pixelToCanvas(element, {
                        x: data.handles.start.x,
                        y: data.handles.end.y,
                    });
                } else {
                    myCoords = cornerstone.pixelToCanvas(
                        element,
                        data.handles.start
                    );
                }
                var fontArr = constants.detectionStyle.LABEL_FONT.split(' ');
                var fontSizeArr = fontArr[1].split('px');
                var fontSize = fontSizeArr[0];
                fontSize *= zoom;
                fontSizeArr[0] = fontSize;
                var newFontSize = fontSizeArr.join('px');
                var newFont = fontArr[0] + ' ' + newFontSize + ' ' + fontArr[2];

                context.font = newFont;

                context.lineWidth = constants.detectionStyle.BORDER_WIDTH;
                context.strokeStyle = data.renderColor;
                context.fillStyle = data.renderColor;
                const className =
                    this.options.temporaryLabel !== undefined
                        ? this.options.temporaryLabel
                        : data.class;
                const detectionLabel = Utils.formatDetectionLabel(
                    className,
                    data.confidence
                );
                const labelSize = Utils.getTextLabelSize(
                    context,
                    detectionLabel,
                    constants.detectionStyle.LABEL_PADDING * zoom
                );
                context.fillRect(
                    myCoords.x - 1 * zoom,
                    myCoords.y - labelSize['height'],
                    labelSize['width'],
                    labelSize['height']
                );
                context.fillStyle = constants.detectionStyle.LABEL_TEXT_COLOR;
                context.fillText(
                    detectionLabel,
                    myCoords.x + constants.detectionStyle.LABEL_PADDING * zoom,
                    myCoords.y - constants.detectionStyle.LABEL_PADDING * zoom
                );
                // Polygon Mask Rendering
                if (data.polygonCoords.length > 0) {
                    const pixelStart = cornerstone.pixelToCanvas(element, {
                        x: data.handles.start.x,
                        y: data.handles.start.y,
                    });
                    const pixelEnd = cornerstone.pixelToCanvas(element, {
                        x: data.handles.end.x,
                        y: data.handles.end.y,
                    });
                    data.polygonCoords = Utils.calculatePolygonMask(
                        [
                            Math.abs(pixelStart.x),
                            Math.abs(pixelStart.y),
                            Math.abs(pixelEnd.x),
                            Math.abs(pixelEnd.y),
                        ],
                        data.polygonCoords
                    );
                    context.strokeStyle =
                        constants.detectionStyle.SELECTED_COLOR;
                    context.fillStyle = constants.detectionStyle.SELECTED_COLOR;
                    context.globalAlpha = 0.5;
                    Utils.renderPolygonMasks(context, data.polygonCoords);
                    context.globalAlpha = 1.0;
                } else if (
                    data.binaryMask.length > 0 &&
                    data.binaryMask[0].length > 0
                ) {
                    context.globalAlpha = 0.5;
                    context.strokeStyle =
                        constants.detectionStyle.SELECTED_COLOR;
                    context.fillStyle = constants.detectionStyle.SELECTED_COLOR;
                    const base = cornerstone.pixelToCanvas(element, {
                        x: data.handles.start.x,
                        y: data.handles.start.y,
                    });
                    data.binaryMask[1][0] = base.x;
                    data.binaryMask[1][1] = base.y;
                    Utils.renderBinaryMasks(data.binaryMask, context, zoom);
                    context.globalAlpha = 1.0;
                }
            }
        });
    }

    // eslint-disable-next-line no-unused-vars
    updateCachedStats(image, element, data) {}

    // Abstract method invoked when the mouse is clicked (on mouse down) to create and add a new annotation
    createNewMeasurement(eventData) {
        if (this.options.cornerstoneMode === constants.cornerstoneMode.EDITION)
            return;

        const goodEventData =
            eventData &&
            eventData.currentPoints &&
            eventData.currentPoints.image;
        if (!goodEventData) {
            console.log(
                "required eventData not supplied to tool's createNewMeasurement"
            );
            return;
        }
        return {
            visible: true,
            active: true,
            color: undefined,
            invalidated: true,
            handles: {
                start: {
                    x: eventData.currentPoints.image.x,
                    y: eventData.currentPoints.image.y,
                    highlight: true,
                    active: false,
                },
                end: {
                    x: eventData.currentPoints.image.x,
                    y: eventData.currentPoints.image.y,
                    highlight: true,
                    active: true,
                },
                initialRotation: eventData.viewport.rotation,
                textBox: {
                    active: false,
                    hasMoved: false,
                    movesIndependently: false,
                    drawnIndependently: true,
                    allowedOutsideImage: true,
                    hasBoundingBox: true,
                },
            },
            algorithm: constants.OPERATOR,
            class: constants.commonDetections.UNKNOWN,
            confidence: 100,
            updatingDetection: false,
        };
    }
}

/**
 *
 * @param {*} startHandle
 * @param {*} endHandle
 * @returns {{ left: number, top: number, width: number, height: number}}
 */

function _getRectangleImageCoordinates(startHandle, endHandle) {
    return {
        left: Math.min(startHandle.x, endHandle.x),
        top: Math.min(startHandle.y, endHandle.y),
        width: Math.abs(startHandle.x - endHandle.x),
        height: Math.abs(startHandle.y - endHandle.y),
    };
}

/**
 *
 * @param {*} context
 * @param {*} { className, score}
 * @param {*} [options={}]
 * @returns {string[]}
 */

// eslint-disable-next-line no-unused-vars
function _createTextBoxContent(context, { className, score }, options = {}) {
    const textLines = [];
    const classInfoString = `${className} - ${score}%`;
    textLines.push(classInfoString);
    return textLines;
}

/**
 *
 *
 * @param {*} startHandle
 * @param {*} endHandle
 * @returns {Array.<{x: number, y: number}>}
 */

// eslint-disable-next-line no-unused-vars
function _findTextBoxAnchorPoints(startHandle, endHandle) {
    const { left, top, width, height } = _getRectangleImageCoordinates(
        startHandle,
        endHandle
    );

    return [
        {
            // Top middle point of rectangle
            x: left + width / 2,
            y: top,
        },
        {
            // Left middle point of rectangle
            x: left,
            y: top + height / 2,
        },
        {
            // Bottom middle point of rectangle
            x: left + width / 2,
            y: top + height,
        },
        {
            // Right middle point of rectangle
            x: left + width,
            y: top + height / 2,
        },
    ];
}