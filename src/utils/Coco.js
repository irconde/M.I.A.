import JSZip from 'jszip';
import Utils from './Utils';

export const buildCocoDataZip = async (myOra, detections) => {
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
        myOra.stackData.forEach((stack) => {
            images.push({
                id: imageID,
                license: licenses[0].id,
                width: stack.dimensions.x,
                height: stack.dimensions.y,
                date_captured: currentDate,
                file_name: `${stack.view}_pixel_data.jpg`,
                coco_url: '',
                flickr_url: '',
            });
            cocoZip.file(
                `${stack.view}_pixel_data.dcs`,
                stack.blobData[0].blob
            );
            for (let i = 1; i < stack.blobData.length; i++) {
                //
                const detection = detections.find(
                    (det) => det.uuid === stack.blobData[i].uuid
                );
                if (detection !== undefined) {
                    annotations.push({
                        id: annotationID,
                        image_id: imageID,
                        iscrowd: 0,
                        // TODO: Implement better category selection for annotations
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

        cocoZip.generateAsync({ type: 'nodebuffer' }).then((file) => {
            resolve(file);
        });
    });
};
