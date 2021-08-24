export const buildCocoDataset = (myOra, detections) => {
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
                        (detection.boundingBox[0] - detection.boundingBox[2]) *
                            (detection.boundingBox[1] -
                                detection.boundingBox[3])
                    ),
                    bbox: [
                        detection.boundingBox[0],
                        detection.boundingBox[1],
                        detection.binaryMask[2][0],
                        detection.binaryMask[2][1],
                    ],
                    segmentation: [],
                });
                annotationID++;
            }
        }
        imageID++;
    });
    console.log(images);
    console.log(annotations);
};
