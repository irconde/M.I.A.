import csTools from 'cornerstone-tools';
import * as cornerstone from 'cornerstone-core';
import path from './path.js';

/**
 * Method for drawing handles based on the original code in the CornerstoneJS library
 * @public
 * @method drawHandles
 * @memberof Drawing
 *
 * @param {CanvasRenderingContext2D} context - Target context
 * @param {*} evtDetail - Cornerstone's 'cornerstoneimagerendered' event's `detail`
 * @param {Object[]|Object} handles - An array of handle objects, or an object w/ named handle objects
 * @param {Object} [options={}] - Options object
 * @param {string} [options.color]
 * @param {Boolean} [options.drawHandlesIfActive=false] - Whether the handles should only be drawn if Active (hovered/selected)
 * @param {string} [options.fill]
 * @param {Number} [options.handleRadius=6]
 * @returns {undefined}
 */
export default function (context, evtDetail, handles, options = {}) {
    const element = evtDetail.element;
    const defaultColor = csTools.toolColors.getActiveColor();
    context.strokeStyle = options.color || defaultColor;
    const handleKeys = Object.keys(handles);
    const lineWidth = options.handleLineWidth;

    for (let i = 0; i < handleKeys.length; i++) {
        const handleKey = handleKeys[i];
        const handle = handles[handleKey];
        if (handle.drawnIndependently === true) {
            continue;
        }
        if (options.drawHandlesIfActive === true && !handle.active) {
            continue;
        }
        if (options.hideHandlesIfMoving && handle.moving) {
            continue;
        }
        const fillStyle = options.fill;
        const pathOptions = { lineWidth, fillStyle };
        if (options.lineDash) {
            pathOptions.lineDash = options.lineDash;
        }

        path(context, pathOptions, (context) => {
            const handleCanvasCoords = cornerstone.pixelToCanvas(
                element,
                handle
            );
            const handleRadius = handle.radius || options.handleRadius;
            context.arc(
                handleCanvasCoords.x,
                handleCanvasCoords.y,
                handleRadius,
                0,
                2 * Math.PI
            );
            context.fill();
            context.stroke();
        });
    }
}
