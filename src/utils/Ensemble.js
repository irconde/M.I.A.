export const calculateIoU = (detA, detB) => {
    const detAArea = Math.abs(
        (detA.boundingBox[2] - detA.boundingBox[0]) *
            (detA.boundingBox[3] - detA.boundingBox[1])
    );
    const detBArea = Math.abs(
        (detB.boundingBox[2] - detB.boundingBox[0]) *
            (detB.boundingBox[3] - detB.boundingBox[1])
    );
    const xA = Math.max(detA.boundingBox[0], detB.boundingBox[0]);
    const xB = Math.max(detA.boundingBox[2], detB.boundingBox[2]);
    const yA = Math.max(detA.boundingBox[1], detB.boundingBox[1]);
    const yB = Math.max(detA.boundingBox[3], detB.boundingBox[3]);

    const interArea = Math.max(xB - xA, 0) * Math.max(yB - yA, 0);
    return interArea / parseFloat(detAArea + detBArea - interArea);
};
