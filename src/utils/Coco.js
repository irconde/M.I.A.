import JSZip from 'jszip';
import Utils from './Utils';

/**
 * buildCocoDataZip - Will take in the pixel data via myOra and blob format, along with
 *                    the detections via an array. It will build the needed JSON format for
 *                    the MS COCO dataset. It will return a nodebuffer stream of the archive file
 *                    to send to the command/file server
 *
 * @param {Object} myOra
 * @param {Array<Detections>} detections
 * @returns {nodebuffer}
 */
export const buildCocoDataZip = async (
    myOra,
    detections,
    viewports,
    cornerstone
) => {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = currentDate.getFullYear();
        const cocoZip = new JSZip();
        const info = {
            description: 'Annotated file from Pilot GUI',
            contributor: 'Pilot GUI',
            url: '',
            version: '1.0',
            year: currentDate.getFullYear(),
            data_created: `${yyyy}/${mm}/${dd}`,
        };
        // TODO: DICOS files do not have a license encoded, determine what license we need to use.
        const licenses = [
            {
                url: '',
                id: 1,
                name: '',
            },
        ];
        const categories = [
            {
                supercategory: 'food',
                id: 55,
                name: 'orange',
            },
        ];
        const images = [];
        const annotations = [];
        let imageID = 1;
        let annotationID = 1;
        const listOfPromises = [];
        myOra.stackData.forEach((stack, index) => {
            images.push({
                id: imageID,
                license: licenses[0].id,
                width: stack.dimensions.x,
                height: stack.dimensions.y,
                date_captured: currentDate,
                file_name: `${stack.view}_pixel_data.png`,
                coco_url: '',
                flickr_url: '',
            });

            const pngPromise = dicosPixelDataToPng(
                cornerstone,
                viewports[index]
            ).then((blob) => {
                cocoZip.file(`${stack.view}_pixel_data.png`, blob);
            });
            listOfPromises.push(pngPromise);

            for (let i = 1; i < stack.blobData.length; i++) {
                //
                const detection = detections.find(
                    (det) => det.uuid === stack.blobData[i].uuid
                );
                if (detection !== undefined) {
                    // TODO: Binary Masks can be presented differently in COCO via run-length-encoding in COCO
                    //       Or, RLE for short. Which is the segmentation field but uses size and count with iscrowd = 1
                    annotations.push({
                        id: annotationID,
                        image_id: imageID,
                        iscrowd: 0,
                        // TODO: Implement better category selection for annotations
                        category_id: 55,
                        // TODO: Area for polygon masks is not the polygon mask but the bbox
                        //       For accuracy, need to find area of a polygon mask if it exists
                        area: Math.abs(
                            (detection.boundingBox[0] -
                                detection.boundingBox[2]) *
                                (detection.boundingBox[1] -
                                    detection.boundingBox[3])
                        ),
                        bbox: [
                            detection.boundingBox[0],
                            detection.boundingBox[1],
                            detection.binaryMask[2][0],
                            detection.binaryMask[2][1],
                        ],
                        segmentation:
                            detection.polygonMask.length > 0
                                ? [
                                      Utils.polygonDataToCoordArray(
                                          detection.polygonMask
                                      ),
                                  ]
                                : [],
                    });
                    annotationID++;
                }
            }
            imageID++;
        });
        const cocoDataset = {
            info,
            licenses,
            images,
            annotations,
            categories,
        };
        cocoZip.file('annotations.json', JSON.stringify(cocoDataset));

        const promiseOfList = Promise.all(listOfPromises);
        promiseOfList.then(() => {
            cocoZip.generateAsync({ type: 'nodebuffer' }).then((file) => {
                resolve(file);
            });
        });
    });
};

/**
 * dicosPixelDataToPng - This function takes in the cornerstone viewport element holder and the cornerstone variable
 *                       that is created in App.js. It will pull the Pixel data from cornerstone as Uint16Array in 16 Bit
 *                       grey scale value. It converts the 16 bit grey scale value into a 8 bit value (0-255). This is the
 *                       grey color produced by setting the R, G, & B Values to this one 8 bit value. This produces a Uint8ClampedArray
 *                       in RGBA format to be loaded onto a canvas element to be finally returned as a Blob of type image/png
 *
 * @param {cornerstone} cornerstone
 * @param {DOMElement} imageViewport
 * @returns {Promise} That resolves to a blob of type image/png
 */
const dicosPixelDataToPng = async (cornerstone, imageViewport) => {
    return new Promise((resolve, reject) => {
        const image = cornerstone.getImage(imageViewport);
        const pixelData = image.getPixelData();
        const EightbitPixels = new Uint8ClampedArray(
            4 * image.width * image.height
        );
        let z = 0;
        const intervals = Utils.buildIntervals();
        for (let i = 0; i < pixelData.length; i++) {
            const greyValue = Utils.findGrayValue(pixelData[i], intervals);
            EightbitPixels[z] = greyValue;
            EightbitPixels[z + 1] = greyValue;
            EightbitPixels[z + 2] = greyValue;
            EightbitPixels[z + 3] = 255;
            z += 4;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.canvas.width = image.width;
        ctx.canvas.height = image.height;
        const imageData = new ImageData(
            EightbitPixels,
            image.width,
            image.height
        );
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
};
