import csTools from 'eac-cornerstone-tools';
import * as constants from '../Constants';
import Utils from '../Utils.js';
import * as cornerstone from 'cornerstone-core';
const drawHandles = csTools.importInternal('drawing/drawHandles');
const BaseAnnotationTool = csTools.importInternal('base/BaseAnnotationTool');
const getNewContext = csTools.importInternal('drawing/getNewContext');
const draw = csTools.importInternal('drawing/draw');
const setShadow = csTools.importInternal('drawing/setShadow');
const draw4CornerRect = csTools.importInternal('drawing/draw4CornerRect');
const drawRect = csTools.importInternal('drawing/drawRect');

// We define the new annotation tool by extending BaseAnnotationTool class
export default class BoundingBoxDrawingTool extends BaseAnnotationTool {
    constructor(props = {}) {
        const defaultProps = {
            name: 'BoundingBoxDrawing',
            supportedInteractionTypes: ['Mouse', 'Touch'],
            configuration: {
                drawHandles: true,
                renderDashed: false,
            },
            // TODO irconde. Customize the cursor
            //svgCursor: rectangleRoiCursor,
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
        if (this.options.editionMode === constants.editionMode.BOUNDING) {
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
        const lineWidth = constants.detectionStyle.BORDER_WIDTH;

        const lineDash = csTools.getModule('globalConfiguration').configuration
            .lineDash;
        const {
            handleRadius,
            drawHandlesOnHover,
            hideHandlesIfMoving,
            renderDashed,
        } = this.configuration;

        const context = getNewContext(eventData.canvasContext.canvas);
        const color = constants.detectionStyle.NORMAL_COLOR;
        const handleOptions = {
            color,
            handleRadius: 8,
            handleLineWidth: 3,
            fill: 'white',
            drawHandlesIfActive: drawHandlesOnHover,
            hideHandlesIfMoving,
        };

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
                if (
                    this.options.cornerstoneMode ===
                    constants.cornerstoneMode.EDITION
                ) {
                    data.handles = Utils.recalculateRectangle(data.handles);
                    draw4CornerRect(
                        context,
                        element,
                        data.handles.start,
                        data.handles.end,
                        data.handles.start_prima,
                        data.handles.end_prima,
                        rectOptions,
                        'pixel'
                    );
                } else {
                    drawRect(
                        context,
                        element,
                        data.handles.start,
                        data.handles.end,
                        rectOptions,
                        'pixel'
                    );
                }
                // Draw handles
                if (
                    this.options.editionMode ==
                        constants.editionMode.BOUNDING &&
                    this.configuration.drawHandles
                ) {
                    drawHandles(
                        context,
                        eventData,
                        data.handles,
                        handleOptions
                    );
                }
                // Label Rendering

                if (
                    this.options.editionMode == constants.editionMode.NO_TOOL &&
                    data.updatingDetection === true
                ) {
                    if (
                        !data.handles.start.moving &&
                        !data.handles.end.moving
                    ) {
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
                        context.font = constants.detectionStyle.LABEL_FONT;
                        context.lineWidth =
                            constants.detectionStyle.BORDER_WIDTH;
                        context.strokeStyle = data.renderColor;
                        context.fillStyle = data.renderColor;
                        const className = this.options.temporaryLabel !== undefined ? this.options.temporaryLabel : data.class;
                        const detectionLabel = Utils.formatDetectionLabel(
                            className,
                            data.confidence
                        );
                        const labelSize = Utils.getTextLabelSize(
                            context,
                            detectionLabel,
                            constants.detectionStyle.LABEL_PADDING
                        );
                        context.fillRect(
                            myCoords.x,
                            myCoords.y - labelSize['height'],
                            labelSize['width'],
                            labelSize['height']
                        );
                        context.fillStyle =
                            constants.detectionStyle.LABEL_TEXT_COLOR;
                        context.fillText(
                            detectionLabel,
                            myCoords.x + constants.detectionStyle.LABEL_PADDING,
                            myCoords.y - constants.detectionStyle.LABEL_PADDING
                        );
                    }
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
                start_prima: {
                    x: eventData.currentPoints.image.x,
                    y: eventData.currentPoints.image.y,
                    highlight: true,
                    active: true,
                },
                end_prima: {
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
