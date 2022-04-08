import * as dcmjs from 'dcmjs';

/**
 * Collection of auxiliary methods for managing DICOS files
 */
export default class Dicos {
    static get dictionary() {
        return {
            ThreatROIBase: {
                tag: 'x40101004',
                name: 'ThreatROIBase',
            },
            ThreatROIExtents: {
                tag: 'x40101005',
                name: 'ThreatROIExtents',
            },
            ThreatROIBitmap: {
                tag: 'x40101006',
                name: 'ThreatROIBitmap',
            },
            BoundingPolygon: {
                tag: 'x4010101d',
                name: 'BoundingPolygon',
            },
            ThreatCategoryDescription: {
                tag: 'x40101013',
                name: 'ThreatCategoryDescription',
            },
            ATDAssessmentProbability: {
                tag: 'x40101016',
                name: 'ATDAssessmentProbability',
            },
            NumberOfAlarmObjects: {
                tag: 'x40101034',
                name: 'NumberOfAlarmObjects',
            },
            ThreatDetectionAlgorithmandVersion: {
                tag: 'x40101029',
                name: 'ThreatDetectionAlgorithmandVersion',
            },
            DetectorType: {
                tag: 'x00187004',
                name: 'DetectorType',
            },
            DetectorConfiguration: {
                tag: 'x00187005',
                name: 'DetectorConfiguration',
            },
            StationName: {
                tag: 'x00081010',
                name: 'StationName',
            },
            SeriesDescription: {
                tag: 'x0008103e',
                name: 'SeriesDescription',
            },
            StudyDescription: {
                tag: 'x00081030',
                name: 'StudyDescription',
            },
        };
    }

    /**
     * Parses a DICOS+TDR file to pull the coordinates of the bounding boxes to be rendered
     *
     * @param {Blob} image - Blob data
     * @return {Array<number>} - Coordinates of the several bounding boxes derived from the DICOS+TDR data. Each
     * bounding box is defined by the two end points of the diagonal, and each point is defined by its coordinates x and y.
     */
    static retrieveBoundingBoxData(image) {
        let BYTES_PER_FLOAT = 4;
        let B_BOX_POINT_COUNT = 2;
        const bBoxDataSet = image.dataSet.elements.x40101037.items[0].dataSet;
        const bBoxByteArraySize =
            bBoxDataSet.elements[Dicos.dictionary['BoundingPolygon'].tag]
                .length;
        const bBoxBytesCount = bBoxByteArraySize / BYTES_PER_FLOAT;
        // NOTE: The z component is not necessary, so we get rid of the third component in every trio of values
        const bBoxComponentsCount = (B_BOX_POINT_COUNT * bBoxBytesCount) / 3;
        var bBoxCoords = new Array(bBoxComponentsCount);
        var bBoxIndex = 0;
        var componentCount = 0;

        for (var i = 0; i < bBoxBytesCount; i++, componentCount++) {
            if (componentCount === B_BOX_POINT_COUNT) {
                componentCount = -1;
                continue;
            }
            bBoxCoords[bBoxIndex] = bBoxDataSet.float(
                Dicos.dictionary['BoundingPolygon'].tag,
                i
            );
            bBoxIndex++;
        }
        return bBoxCoords;
    }

    /**
     * Parses a DICOS+TDR file to pull the bitmap mask data
     *
     * @param {DICOSImageObject} image - DICOS+TDR image data
     * @param {DICOSPixelData} data - DICOS+TDR pixel data
     * @returns {Array<number>} - Bitmap mask data
     *
     */
    static retrieveMaskData(image, data) {
        let BYTES_PER_FLOAT = 4;
        let B_BOX_POINT_COUNT = 2;

        const dataSet = image.dataSet;
        if (dataSet === undefined) return;
        if (
            dataSet.elements.x40101037.items[0].dataSet.elements.x40101001 ===
            undefined
        )
            return;
        const baseDataSet =
            dataSet.elements.x40101037.items[0].dataSet.elements.x40101001
                .items[0].dataSet;
        const baseByteArraySize =
            baseDataSet.elements[Dicos.dictionary['ThreatROIBase'].tag].length;
        const bBoxBytesCount = baseByteArraySize / BYTES_PER_FLOAT;
        // NOTE: The z component is not necessary, so we get rid of the third component in every trio of values
        const bBoxComponentsCount = (B_BOX_POINT_COUNT * bBoxBytesCount) / 3;
        var baseCoords = new Array(bBoxComponentsCount);
        var bBoxIndex = 0;
        var componentCount = 0;

        for (let i = 0; i < bBoxBytesCount; i++, componentCount++) {
            if (componentCount === B_BOX_POINT_COUNT) {
                componentCount = -1;
                continue;
            }
            baseCoords[bBoxIndex] = baseDataSet.float(
                Dicos.dictionary['ThreatROIBase'].tag,
                i
            );
            bBoxIndex++;
        }

        const extentsByteArraySize =
            baseDataSet.elements[Dicos.dictionary['ThreatROIExtents'].tag]
                .length;
        const extentsBytesCount = extentsByteArraySize / BYTES_PER_FLOAT;
        // NOTE: The z component is not necessary, so we get rid of the third component in every trio of values
        const extentsComponentsCount =
            (B_BOX_POINT_COUNT * extentsBytesCount) / 3;
        var extentsCoords = new Array(extentsComponentsCount);
        bBoxIndex = 0;
        componentCount = 0;

        for (var j = 0; j < extentsBytesCount; j++, componentCount++) {
            if (componentCount === B_BOX_POINT_COUNT) {
                componentCount = -1;
                continue;
            }
            extentsCoords[bBoxIndex] = baseDataSet.float(
                Dicos.dictionary['ThreatROIExtents'].tag,
                j
            );
            bBoxIndex++;
        }
        let arrayPixelData = [];
        if (
            image.dataSet.elements.x40101037.items[0].dataSet.elements.x40101001
                .items[0].dataSet.elements.x40101006 !== undefined
        ) {
            const pixelDataElement =
                image.dataSet.elements.x40101037.items[0].dataSet.elements
                    .x40101001.items[0].dataSet.elements.x40101006;
            let pixelData = new Uint8Array(
                data.byteArray.buffer,
                pixelDataElement.dataOffset,
                pixelDataElement.length
            );
            arrayPixelData = Array.from(pixelData);
        }
        return [arrayPixelData, baseCoords, extentsCoords];
    }

    /**
     * Parses a DICOS+TDR file to retrieve the class of the potential threat object
     *
     * @param {Blob} image - Blob data
     * @returns {string} - Description of the potential threat object
     */
    static retrieveObjectClass(image) {
        return image.dataSet.elements.x40101038.items[0].dataSet.string(
            Dicos.dictionary['ThreatCategoryDescription'].tag
        );
    }

    /**
     * Parses a DICOS+TDR file to retrieve the confidence level of the detection algorithm used
     *
     * @param {Blob} image - Blob data
     * @returns {number} - Confidence level
     */
    static retrieveConfidenceLevel(image) {
        return image.dataSet.elements.x40101038.items[0].dataSet.float(
            Dicos.dictionary['ATDAssessmentProbability'].tag
        );
    }

    /**
     * Provides the unique instance identifier for a given DICOM Image.
     *
     * @param {Blob} image - Blob data
     * @returns {string} - Unique identifier
     */
    static async getInstanceNumber(image) {
        var fileReader = new FileReader();
        return new Promise((resolve, reject) => {
            fileReader.onerror = () => {
                fileReader.abort();
                reject('Unable to load file');
            };
            fileReader.onload = function (event) {
                image = event.target.result;
                var dicomDict = dcmjs.data.DicomMessage.readFile(image);
                var dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
                    dicomDict.dict
                );
                resolve(dataset.InstanceNumber);
            };
            fileReader.readAsArrayBuffer(image);
        });
    }

    /**
     * Converts a detection and its parent image into blob data with DICOM format
     *
     * @param {Detection} detection - Detection object
     * @param {Blob} data - Blob data
     * @returns {Promise} - Promise containing the blob on resolve or error on reject
     */
    static detectionObjectToBlob(detection, data) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();
        // Create the new dataset with fields required
        let dataset = {};
        return new Promise((resolve, reject) => {
            try {
                this.getInstanceNumber(data).then((instanceNumber) => {
                    dataset.ImageType = [
                        'ORIGINAL',
                        'PRIMARY',
                        'VOLUME',
                        'NONE',
                    ];
                    dataset.InstanceCreationDate = mm + '-' + dd + '-' + yyyy;
                    dataset.InstanceCreationTime =
                        today.getHours() +
                        ':' +
                        today.getMinutes() +
                        ':' +
                        today.getSeconds();
                    dataset.SOPClassUID = '1.2.840.10008.5.1.4.1.1.501.2.1';
                    dataset.SOPInstanceUID =
                        '1.2.276.0.7230010.3.1.4.8323329.1130.1596485298.771161';
                    dataset.StudyDate = '19700101';
                    dataset.SeriesDate = '19700101';
                    dataset.AcquisitionDate = '19700101';
                    dataset.ContentDate = '19700101';
                    dataset.AcquisitionDateTime = '19700101000000';
                    dataset.StudyTime = '000000';
                    dataset.SeriesTime = '000000';
                    dataset.AcquisitionTime = '000000';
                    dataset.ContentTime = '000000';
                    dataset.Modality = 'DX';
                    dataset.PresentationIntentType = 'FOR PROCESSING';
                    dataset.Manufacturer = 'Rapiscan Systems';
                    dataset.InstitutionName = 'Rapiscan Systems';
                    dataset.InstitutionAddress =
                        '2805 Columbia St, Torrance, CA 90503 U.S.A.';
                    dataset.StationName = 'unknown';
                    dataset.StudyDescription = 'Malibu v1.0';
                    dataset.SeriesDescription = 'unknown';
                    dataset.ManufacturerModelName = 'unknown';
                    dataset.PatientName = 'unknown';
                    dataset.PatientID = 'unknown';
                    dataset.IssuerOfPatientID = 'Rapiscan Systems';
                    dataset.TypeOfPatientID = 'TEXT';
                    dataset.PatientBirthDate = 'unknown';
                    dataset.PatientSex = 'U';
                    dataset.KVP = '0';
                    dataset.DeviceSerialNumber = '0000';
                    dataset.SoftwareVersions = '0000';
                    dataset.DistanceSourceToDetector = '0';
                    dataset.DateOfLastCalibration = '19700101';
                    dataset.TimeOfLastCalibration = '000000';
                    dataset.DetectorType = 'DIRECT';
                    dataset.DetectorConfiguration = 'SLOT';
                    dataset.DetectorDescription = 'DetectorDesc';
                    dataset.XRayTubeCurrentInuA = '0';
                    dataset.TableSpeed = 1;
                    dataset.StudyInstanceUID =
                        '1.2.276.0.7230010.3.1.4.8323329.1130.1596485298.771162';
                    dataset.SeriesInstanceUID =
                        '1.2.276.0.7230010.3.1.4.8323329.1130.1596485298.771163';
                    dataset.StudyID = 'Malibu v1.0';
                    dataset.AcquisitionNumber = '0';
                    dataset.InstanceNumber = instanceNumber;
                    dataset.ImagePositionPatient = [1, 1, 1];
                    dataset.ImageOrientationPatient = [1, 0, 0, 0, 1, 0];
                    dataset.SamplesPerPixel = 1;
                    dataset.PhotometricInterpretation = 'MONOCHROME2';
                    dataset.PlanarConfiguration = 0;
                    dataset.NumberOfFrames = '1';
                    dataset.Rows = 580;
                    dataset.Columns = 508;
                    dataset.BitsAllocated = 16;
                    dataset.BitsStored = 16;
                    dataset.HighBit = 15;
                    dataset.PixelRepresentation = 0;
                    dataset.BurnedInAnnotation = 'NO';
                    dataset.PixelIntensityRelationship = 'LIN';
                    dataset.PixelIntensityRelationshipSign = 1;
                    dataset.RescaleIntercept = '0';
                    dataset.RescaleSlope = '1';
                    dataset.RescaleType = 'HU';
                    dataset.LossyImageCompression = '00';
                    if (
                        detection.binaryMask !== undefined &&
                        detection.binaryMask.length > 0 &&
                        detection.binaryMask[0].length > 0
                    ) {
                        let maskPixelData = new Uint8Array(
                            detection.binaryMask[0]
                        ).buffer;
                        dataset.ThreatSequence = {
                            PotentialThreatObjectID: 0,
                            PTORepresentationSequence: {
                                ReferencedInstanceSequence: [
                                    {
                                        ReferencedSOPClassUID:
                                            '1.2.840.10008.5.1.4.1.1.501.2.1',
                                        ReferencedSOPInstanceUID:
                                            '1.2.276.0.7230010.3.1.4.8323329.1130.1596485298.771161',
                                    },
                                ],
                                ThreatROIVoxelSequence: [
                                    {
                                        ThreatROIBase: [
                                            detection.binaryMask[1][0],
                                            detection.binaryMask[1][1],
                                            0,
                                        ],
                                        ThreatROIExtents: [
                                            detection.binaryMask[2][0],
                                            detection.binaryMask[2][1],
                                            0,
                                        ],
                                        ThreatROIBitmap: maskPixelData,
                                    },
                                ],
                                // [x0, y0, z0, xf, yf, zf]
                                BoundingPolygon: [
                                    detection.boundingBox[0],
                                    detection.boundingBox[1],
                                    0,
                                    detection.boundingBox[2],
                                    detection.boundingBox[3],
                                    0,
                                ],
                            },
                            ATDAssessmentSequence: {
                                ThreatCategory: 'ANOMALY',
                                ThreatCategoryDescription: detection.className,
                                ATDAbilityAssessment: 'SHIELD',
                                ATDAssessmentFlag: 'THREAT',
                                ATDAssessmentProbability:
                                    detection.confidence / 100,
                            },
                        };
                    } else {
                        dataset.ThreatSequence = {
                            PotentialThreatObjectID: 0,
                            PTORepresentationSequence: {
                                ReferencedInstanceSequence: [
                                    {
                                        ReferencedSOPClassUID:
                                            '1.2.840.10008.5.1.4.1.1.501.2.1',
                                        ReferencedSOPInstanceUID:
                                            '1.2.276.0.7230010.3.1.4.8323329.1130.1596485298.771161',
                                    },
                                ],
                                ThreatROIVoxelSequence: [
                                    {
                                        ThreatROIBase: [
                                            detection.binaryMask !== undefined
                                                ? detection.binaryMask[1][0]
                                                : 0,
                                            detection.binaryMask !== undefined
                                                ? detection.binaryMask[1][1]
                                                : 0,
                                            0,
                                        ],
                                        ThreatROIExtents: [
                                            detection.binaryMask !== undefined
                                                ? detection.binaryMask[2][0]
                                                : 0,
                                            detection.binaryMask !== undefined
                                                ? detection.binaryMask[2][1]
                                                : 0,
                                            0,
                                        ],
                                    },
                                ],
                                // [x0, y0, z0, xf, yf, zf]
                                BoundingPolygon: [
                                    detection.boundingBox[0],
                                    detection.boundingBox[1],
                                    0,
                                    detection.boundingBox[2],
                                    detection.boundingBox[3],
                                    0,
                                ],
                            },
                            ATDAssessmentSequence: {
                                ThreatCategory: 'ANOMALY',
                                ThreatCategoryDescription: detection.className,
                                ATDAbilityAssessment: 'SHIELD',
                                ATDAssessmentFlag: 'THREAT',
                                ATDAssessmentProbability:
                                    detection.confidence / 100,
                            },
                        };
                    }
                    dataset.AcquisitionContextSequence = {
                        ConceptNameCodeSequence: {
                            CodeMeaning: 0,
                            CodeValue: 0,
                            CodingSchemeDesignator: 0,
                        },
                    };
                    dataset.AlgorithmRoutingCodeSequence = [];
                    dataset.DetectorGeometrySequence = {
                        DistanceSourceToDetector: 0.0,
                        SourceOrientation: [1, 1, 1],
                        SourcePosition: [1, 1, 1],
                    };
                    dataset.PresentationLUTShape = 'IDENTITY';
                    dataset.OOIOwnerType = 'OwnerType';
                    dataset.TDRType = 'OPERATOR';
                    dataset.ThreatDetectionAlgorithmandVersion =
                        detection.algorithm;
                    dataset.AlarmDecisionTime = dataset.InstanceCreationTime;
                    dataset.AlarmDecision = 'ALARM';
                    dataset.NumberOfTotalObjects = 1;
                    dataset.NumberOfAlarmObjects = 1;
                    dataset.DICOSVersion = 'V02A';
                    dataset.OOIType = 'BAGGAGE';
                    dataset.OOISize = [1, 1, 1];
                    dataset.AcquisitionStatus = 'SUCCESSFUL';
                    dataset.ScanType = 'OPERATIONAL';
                    dataset.BeltHeight = 0;
                    dataset.NumberOfAlarmObjects = 1;
                    dataset.NumberOfTotalObjects = 1;
                    // Create the Dicom Dictionary file
                    let dicomDict = new dcmjs.data.DicomDict({});
                    dicomDict.dict =
                        dcmjs.data.DicomMetaDictionary.denaturalizeDataset(
                            dataset
                        );
                    // Create the buffer from the denaturalized data set populated above
                    let new_file_WriterBuffer = dicomDict.write();
                    // Create a blob with this buffer
                    var file = new Blob([new_file_WriterBuffer], {
                        type: 'image/dcs',
                    });
                    resolve(file);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}
