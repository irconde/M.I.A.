/**
 * Will calculate a list of boxes to be fused (fList) with corresponding lList items
 * @param {Array<{view: string; className: string; algorithm: string; boundingBox: Array<number>; confidence: number; color: string; displayColor: string; visible: boolean; selected: boolean}>} bListDetections
 * @returns {{fList: Array<{view: string; className: string; algorithm: string; boundingBox: Array<number>; confidence: number; color: string; displayColor: string; visible: boolean; selected: boolean}>, lList: Array<Array<{view: string; className: string; algorithm: string; boundingBox: Array<number>; confidence: number; color: string; displayColor: string; visible: boolean; selected: boolean}>>}}
 */
export const calculateLFLists = (bListDetections) => {
    let lList = [],
        fList = [];
    const firstDet = bListDetections.shift();
    lList.push([firstDet]);
    fList.push(firstDet);
    for (let i = 0; i < bListDetections.length; i++) {
        let foundIoUIndex = fList.findIndex((det, index) => {
            if (calculateIoU(bListDetections[i], det) > 0.55) {
                return -1;
            } else {
                return index;
            }
        });
        if (foundIoUIndex === -1) {
            lList.push([bListDetections[i]]);
            fList.push(bListDetections[i]);
        } else {
            lList[foundIoUIndex].push(bListDetections[i]);
        }
    }
    return { lList, fList };
};

/**
 * Calculates the fused box for the past in list of detections
 * @param {Array<Array<{view: string; className: string; algorithm: string; boundingBox: Array<number>; confidence: number; color: string; displayColor: string; visible: boolean; selected: boolean}>>} lList
 * @param {number} i
 * @returns {{y1: number, x1: number, y2: number, x2: number, fusedConfidence: number}}
 */
export const calculateFusedBox = (lList, i) => {
    let x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = 0,
        fusedConfidence = 0,
        confidenceSum = 0,
        numAlgorithms = 0,
        numBoxes = lList[i].length,
        seenAlgorithms = [];
    for (let z = 0; z < lList[i].length; z++) {
        const foundAlgorithmIndex = seenAlgorithms.findIndex(
            (algorithm) => algorithm === lList[i][z].algorithm
        );
        if (foundAlgorithmIndex === -1)
            seenAlgorithms.push(lList[i][z].algorithm);
        numAlgorithms = seenAlgorithms.length;
        confidenceSum += lList[i][z].confidence;
        x1 += lList[i][z].confidence * lList[i][z].boundingBox[0];
        x2 += lList[i][z].confidence * lList[i][z].boundingBox[2];
        y1 += lList[i][z].confidence * lList[i][z].boundingBox[1];
        y2 += lList[i][z].confidence * lList[i][z].boundingBox[3];
    }
    try {
        x1 = x1 / confidenceSum;
        x2 = x2 / confidenceSum;
        y1 = y1 / confidenceSum;
        y2 = y2 / confidenceSum;
        fusedConfidence =
            confidenceSum * (Math.min(numBoxes, numAlgorithms) / numAlgorithms);
    } catch (e) {
        console.log(e);
    }
    return { x1, x2, y1, y2, fusedConfidence };
};

/**
 * Calculates the Intersection over Union for the 2 given detections
 * @param {{view: string; className: string; algorithm: string; boundingBox: Array<number>; confidence: number; color: string; displayColor: string; visible: boolean; selected: boolean}} detA
 * @param {{view: string; className: string; algorithm: string; boundingBox: Array<number>; confidence: number; color: string; displayColor: string; visible: boolean; selected: boolean}} detB
 * @returns {number}
 */
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
    const xB = Math.min(detA.boundingBox[2], detB.boundingBox[2]);
    const yA = Math.max(detA.boundingBox[1], detB.boundingBox[1]);
    const yB = Math.min(detA.boundingBox[3], detB.boundingBox[3]);

    const interArea = Math.max(xB - xA, 0) * Math.max(yB - yA, 0);
    return interArea / parseFloat(detAArea + detBArea - interArea);
};
