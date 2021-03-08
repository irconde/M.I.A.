import csTools from 'cornerstone-tools';
import * as constants from '../Constants';
import Utils from '../Utils.js';

const BaseAnnotationTool = csTools.importInternal('base/BaseAnnotationTool');
const getROITextBoxCoords = csTools.importInternal('util/getROITextBoxCoords');
const getNewContext = csTools.importInternal('drawing/getNewContext');
const draw = csTools.importInternal('drawing/draw');
const setShadow = csTools.importInternal('drawing/setShadow');
const drawHandles = csTools.importInternal('drawing/drawHandles');
const drawRect = csTools.importInternal('drawing/drawRect');

// We define the new annotation tool by extending BaseAnnotationTool class
export default class BoundingBoxDrawingTool extends BaseAnnotationTool {
    constructor(props = {}) {
        const defaultProps = {
            name: 'BoundingBoxDrawing',
            supportedInteractionTypes: ['Mouse', 'Touch'],
            configuration: {
                drawHandles: true,
                drawHandlesOnHover: true,
                hideHandlesIfMoving: true,
                renderDashed: false,
                renderClassName: true,
            },
            // TODO irconde. Customize the cursor
            //svgCursor: rectangleRoiCursor,
        };
        super(props, defaultProps);
    }

    // Abstract method. Automatically invoked on mouse move to know whether the mouse pointer is
    //  over (or close to) the rectangle's border
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

        const distance = interactionType === 'mouse' ? 15 : 25;
        const startCanvas = csTools.external.cornerstone.pixelToCanvas(
            element,
            data.handles.start
        );
        const endCanvas = csTools.external.cornerstone.pixelToCanvas(
            element,
            data.handles.end
        );

        const rect = {
            left: Math.min(startCanvas.x, endCanvas.x),
            top: Math.min(startCanvas.y, endCanvas.y),
            width: Math.abs(startCanvas.x - endCanvas.x),
            height: Math.abs(startCanvas.y - endCanvas.y),
        };

        const distanceToPoint = csTools.external.cornerstoneMath.rect.distanceToPoint(
            rect,
            coords
        );

        return distanceToPoint < distance;
    }

    // Abstract method. Automatically invoked to render all the widgets that comprise a detection
    renderToolData(evt) {
        const toolData = csTools.getToolState(evt.currentTarget, this.name);
        if (!toolData) {
            // No tool data
            return;
        }

        const eventData = evt.detail;
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

        draw(context, (context) => {
            // If we have tool data for this element - iterate over each set and draw it
            for (let i = 0; i < toolData.data.length; i++) {
                const data = toolData.data[i];
                if (data.visible === false) {
                    continue;
                }
                // Configure
                const color = constants.detectionStyle.NORMAL_COLOR;
                const handleOptions = {
                    color,
                    handleRadius,
                    drawHandlesIfActive: drawHandlesOnHover,
                    hideHandlesIfMoving,
                };

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
                    'pixel',
                    data.handles.initialRotation
                );

                // Draw handles
                if (this.configuration.drawHandles) {
                    drawHandles(
                        context,
                        eventData,
                        data.handles,
                        handleOptions
                    );
                }

                // Default to textbox on right side of ROI
                if (
                    this.configuration.renderClassName === true &&
                    data.updatingDetection === true
                ) {
                    context.font = constants.detectionStyle.LABEL_FONT;
                    context.lineWidth = constants.detectionStyle.BORDER_WIDTH;
                    context.strokeStyle = data.renderColor;
                    context.fillStyle = data.renderColor;
                    const detectionLabel = Utils.formatDetectionLabel(
                        data.class,
                        data.confidence
                    );
                    const labelSize = Utils.getTextLabelSize(
                        context,
                        detectionLabel,
                        constants.detectionStyle.LABEL_PADDING
                    );
                    context.fillRect(
                        data.handles.start.x,
                        data.handles.start.y - labelSize['height'],
                        labelSize['width'],
                        labelSize['height']
                    );
                    context.fillStyle =
                        constants.detectionStyle.LABEL_TEXT_COLOR;
                    context.fillText(
                        detectionLabel,
                        data.handles.start.x +
                            constants.detectionStyle.LABEL_PADDING,
                        data.handles.start.y -
                            constants.detectionStyle.LABEL_PADDING
                    );
                }
            }
        });
    }

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
