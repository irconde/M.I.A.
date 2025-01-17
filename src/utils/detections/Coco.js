import JSZip from 'jszip';
import Utils from '../general/Utils';
import { SETTINGS } from '../enums/Constants';
import React from 'react';

/**
 * Takes in the pixel data via myOra and blob format, along with
 * the detections via an array and builds the needed JSON format for
 * the MS COCO dataset.
 *
 * @param {Array<{view: string, type: string, pixelData: ArrayBuffer | Blob, imageId: string, dimensions: {x: number; y: number}}>} imageData - Object containing image information
 * @param {Array<{algorithm: string; className: string; confidence: number; view: string; binaryMask: Array<Array<number>>; polygonMask?: Array<number>; boundingBox: Array<number>; selected: boolean; visible: boolean; uuid: string; color: string; validation?: boolean; textColor: string; detectionType: string;}>} detections - Collection of detection objects
 * @param {Array<{view: string; element: HTMLElement}>} viewports - Collection of viewport HTMLElement objects
 * @param {{"cornerstone-core": *, __esModule: *}} cornerstone - Main cornerstone object
 * @param {string} currentFileFormat - Current file format string (MS COCO or DICOS-TDR)
 * @returns {JSZip} cocoZip - The zipped file
 */
export const buildCocoDataZip = async (
    imageData,
    detections,
    viewports,
    cornerstone,
    currentFileFormat
) => {
    return new Promise((resolve) => {
        const cocoZip = new JSZip();
        const stackXML = document.implementation.createDocument('', '', null);
        const prolog = '<?xml version="1.0" encoding="utf-8"?>';
        const imageElem = stackXML.createElement('image');
        imageElem.setAttribute('format', SETTINGS.ANNOTATIONS.COCO);
        const mimeType = new Blob(['image/openraster'], {
            type: 'text/plain;charset=utf-8',
        });
        cocoZip.file('mimetype', mimeType, { compression: null });
        const currentDate = new Date();
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = currentDate.getFullYear();
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

        let imageID = 1;
        let annotationID = 1;
        const listOfPromises = [];
        imageData.forEach((image, index) => {
            const stackElem = stackXML.createElement('stack');
            stackElem.setAttribute('name', `SOP Instance UID #${imageID}`);
            stackElem.setAttribute('view', image.view);
            const pixelLayer = stackXML.createElement('layer');
            const images = [];
            images.push({
                id: imageID,
                license: licenses[0].id,
                width: image.dimensions.x,
                height: image.dimensions.y,
                date_captured: currentDate,
                file_name: `${image.view}_pixel_data.png`,
                coco_url: '',
                flickr_url: '',
            });
            pixelLayer.setAttribute('src', `data/${image.view}_pixel_data.png`);
            stackElem.appendChild(pixelLayer);
            const currentDetections = detections.filter(
                (det) => det.view === image.view
            );
            const viewportIndex = viewports.findIndex(
                (view) => view.view === image.view
            );
            if (currentFileFormat === SETTINGS.ANNOTATIONS.TDR) {
                const pngPromise = dicosPixelDataToPng(
                    cornerstone,
                    viewports[viewportIndex].element
                ).then((blob) => {
                    cocoZip.file(`data/${image.view}_pixel_data.png`, blob);
                    currentDetections.forEach((detection) => {
                        if (detection !== undefined) {
                            let annotations = [];
                            annotations.push({
                                id: annotationID,
                                image_id: imageID,
                                className: detection.className,
                                confidence: detection.confidence,
                                iscrowd: 0,
                                category_id: 55,
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
                            const info = {
                                description: 'Annotated file from Pilot GUI',
                                contributor: 'Pilot GUI',
                                url: '',
                                version: '1.0',
                                year: currentDate.getFullYear(),
                                data_created: `${yyyy}/${mm}/${dd}`,
                                algorithm: detection.algorithm,
                            };
                            const cocoDataset = {
                                info,
                                licenses,
                                images,
                                annotations,
                                categories,
                            };
                            cocoZip.file(
                                `data/${image.view}_annotation_${annotationID}.json`,
                                JSON.stringify(cocoDataset, null, 4)
                            );
                            const newLayer = stackXML.createElement('layer');
                            newLayer.setAttribute(
                                'src',
                                `data/${image.view}_annotation_${annotationID}.json`
                            );
                            stackElem.appendChild(newLayer);
                            annotationID++;
                        }
                    });
                });
                listOfPromises.push(pngPromise);
            } else if (currentFileFormat === SETTINGS.ANNOTATIONS.COCO) {
                cocoZip.file(
                    `data/${image.view}_pixel_data.png`,
                    image.pixelData
                );
                currentDetections.forEach((detection) => {
                    if (detection !== undefined) {
                        let annotations = [];
                        annotations.push({
                            id: annotationID,
                            image_id: imageID,
                            className: detection.className,
                            confidence: detection.confidence,
                            iscrowd: 0,
                            category_id: 55,
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
                        const info = {
                            description: 'Annotated file from Pilot GUI',
                            contributor: 'Pilot GUI',
                            url: '',
                            version: '1.0',
                            year: currentDate.getFullYear(),
                            data_created: `${yyyy}/${mm}/${dd}`,
                            algorithm: detection.algorithm,
                        };
                        const cocoDataset = {
                            info,
                            licenses,
                            images,
                            annotations,
                            categories,
                        };
                        cocoZip.file(
                            `data/${image.view}_annotation_${annotationID}.json`,
                            JSON.stringify(cocoDataset, null, 4)
                        );
                        const newLayer = stackXML.createElement('layer');
                        newLayer.setAttribute(
                            'src',
                            `data/${image.view}_annotation_${annotationID}.json`
                        );
                        stackElem.appendChild(newLayer);
                        annotationID++;
                    }
                });
            } else {
                return null;
            }
            imageID++;
            imageElem.appendChild(stackElem);
        });

        const promiseOfList = Promise.all(listOfPromises);
        promiseOfList.then(() => {
            stackXML.appendChild(imageElem);
            cocoZip.file(
                'stack.xml',
                new Blob(
                    [prolog + new XMLSerializer().serializeToString(stackXML)],
                    { type: 'application/xml ' }
                )
            );
            resolve(cocoZip);
        });
    });
};

/**
 * Pulls the pixel data from cornerstone as Uint16Array in 16 Bit grey scale value and converts the 16 bit grey
 * scale value into a 8 bit value (0-255). This is the grey color produced by setting the R, G, & B Values to
 * this one 8 bit value. This produces a Uint8ClampedArray in RGBA format to be loaded onto a canvas element to
 * be finally returned as a Blob of type image/png
 *
 * @param {cornerstone} cornerstone - Main cornerstone object
 * @param {HTMLElement} imageViewport - Viewport HTMLElement object
 * @returns {Promise} - That resolves to a blob of type image/png
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
