import * as dcmjs from 'dcmjs';
import Utils from "./Utils";

/**
 * Class that emcompases any secondary method related to DICOS file management
 */
export default class Dicos {

  static get dictionary() {
    return {
      "BoundingPolygon": {
        tag: "x4010101d",
        name: "BoundingPolygon"
      },
      "ThreatCategoryDescription": {
        tag: "x40101013",
        name: "ThreatCategoryDescription"
      },
      "ATDAssessmentProbability": {
        tag: "x40101016",
        name: "ATDAssessmentProbability"
      },
      "NumberOfAlarmObjects": {
        tag: "x40101034",
        name: "NumberOfAlarmObjects"
      },
      "ThreatDetectionAlgorithmandVersion": {
        tag: "x40101029",
        name: "ThreatDetectionAlgorithmandVersion"
      },
      "DetectorType": {
        tag: "x00187004",
        name: "DetectorType"
      },
      "DetectorConfiguration": {
        tag: "x00187005",
        name: "DetectorConfiguration"
      },
      "StationName": {
        tag: "x00081010",
        name: "StationName"
      },
      "SeriesDescription": {
        tag: "x0008103e",
        name: "SeriesDescription"
      },
      "StudyDescription": {
        tag: "x00081030",
        name: "StudyDescription"
      },
    };
  };


  /**
   * retrieveBoundingBoxData - Method that parses a DICOS+TDR file to pull the coordinates of the bounding boxes to be rendered
   *
   * @param  {type} image DICOS+TDR image data
   * @return {type}       Float array with the coordenates of the several bounding boxes derived from the DICOS+TDR data.
   *                      Each bounding box is defined by the two end points of the diagonal, and each point is defined by its coordinates x and y.
   */
  static retrieveBoundingBoxData(image) {
    let BYTES_PER_FLOAT = 4;
    let B_BOX_POINT_COUNT = 2;
    const bBoxDataSet = image.dataSet.elements.x40101037.items[0].dataSet;
    const bBoxByteArraySize = bBoxDataSet.elements[Dicos.dictionary['BoundingPolygon'].tag].length
    const bBoxBytesCount = bBoxByteArraySize / BYTES_PER_FLOAT;
    // NOTE: The z component is not necessary, so we get rid of the third component in every trio of values
    const bBoxComponentsCount = B_BOX_POINT_COUNT * bBoxBytesCount / 3;
    var bBoxCoords = new Array(bBoxComponentsCount);
    var bBoxIndex = 0;
    var componentCount = 0;

    for (var i = 0; i < bBoxBytesCount; i++,componentCount++) {
      if (componentCount === B_BOX_POINT_COUNT) {
        componentCount = -1;
        continue;
      }
      bBoxCoords[bBoxIndex] = bBoxDataSet.float(Dicos.dictionary['BoundingPolygon'].tag, i);
      bBoxIndex++;
    }
    return bBoxCoords;
  }


  /**
   * retrieveObjectClass - Method that parses a DICOS+TDR file to pull the a string value that indicates the class of the potential threat object
   *
   * @param  {type} image DICOS+TDR image data
   * @return {type}       String value with the description of the potential threat object
   */
  static retrieveObjectClass(image) {
    return image.dataSet.elements.x40101038.items[0].dataSet.string(Dicos.dictionary['ThreatCategoryDescription'].tag);
  }


  /**
   * retrieveConfidenceLevel - Method that parses a DICOS+TDR file to pull the a float value that indicates the confidence level of the detection algorithm used
   *
   * @param  {type} image DICOS+TDR image data
   * @return {type}       Float value with the confidence level
   */
  static retrieveConfidenceLevel(image) {
    return image.dataSet.elements.x40101038.items[0].dataSet.float(Dicos.dictionary['ATDAssessmentProbability'].tag);
  }


  /**
   * @static write - Method that takes validation information and the original
   * DICOS data and generates the data to be encoded in the amended DICOS file
   *
   * @param  {type} validationList Array with information regarding the validations made on the detections
   * @param  {type} image          Original DICOS data
   * @param  {type} startTime      Time the client displayed image on screen -- used to create 'Total Processing Time'
   * @param  {type} abort= false   Boolean value that represents the abort flag.
   *                               True. When feedback has been left for at least one detection, we need to create a TDR to save feedback
   *                               False. When feedback has not been left for any detection we need to create a TDR w/ ABORT flag
   * @return {type}                Blob with data for the creation of the amended DICOS file.
   */
  static dataToBlob(validationList, image, startTime, abort= false) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    let validations = [];
    if(validationList !== null){
      validations = validationList;
    }

    var fileReader = new FileReader();
    fileReader.onload = function(event) {
      image = event.target.result;

      var dicomDict = dcmjs.data.DicomMessage.readFile(image);
      var dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict);
      let copiedData = dataset;
      let instanceNumber = copiedData.InstanceNumber;
      var numberAlarmObjs = copiedData.NumberOfAlarmObjects;
      var numberTotalObjs = copiedData.NumberOfTotalObjects;
      instanceNumber = instanceNumber * 4;

      copiedData.InstanceNumber = instanceNumber;
      copiedData.InstanceCreationDate = mm + '-' + dd + '-' + yyyy;
      copiedData.InstanceCreationTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      copiedData.AcquisitionNumber = instanceNumber;
      copiedData.TotalProcessingTime = startTime - Date.now();
      copiedData.TDRType = "OPERATOR";
      copiedData.OperatorIdentificationSequence = {
        'vrMap': {},
        'PersonIdentificationCodeSequence': {
          'CodeValue': 'none',
          'CodingSchemeDesignator': 'none',
          'CodingSchemeVersion': '1.1.1',
          'CodeMeaning': 'none',
          'vrMap': {}
        },
        'PersonAddress': '123 Main Street',
        'PersonTelephoneNumbers': '1112223333',
        'OrganizationName': 'The Organization',
        'OrganizationAddress': '123 Main Street',
        'OrganizationCodeSequence': {
          'CodeValue': 'none',
          'CodingSchemeDesignator': 'none',
          'CodingSchemeVersion': '1.1.1',
          'CodeMeaning': 'none',
          'vrMap': {}
        }
      }

      if(abort === true){
        copiedData.abortFlag = 'ABORT';
        copiedData.abortReason = 'NOT_REVIEWED';
        copiedData.AdditionalScreeningPerformed = "NO";
      }
      else {
        copiedData.abortFlag = 'SUCCESS';
        copiedData.AdditionalScreeningPerformed = "YES";
        copiedData.AdditionalInspectionSelectionCriteria = "RANDOM";

        if(validations.length>1) {
          for (var i = 0; i < validations.length; i++) {
            if (copiedData.ThreatSequence[i]) {
              copiedData.ThreatSequence[i]['ReferencedPTOSequence'] = {
                'vrMap': {},
                'PotentialThreatObjectID': copiedData.ThreatSequence[i]['PotentialThreatObjectID'],
                'ReferencedTDRInstanceSequence': {
                  'ReferencedSOPClassUID': copiedData.SOPClassUID,
                  'ReferencedSOPInstanceUID': copiedData.SOPInstanceUID,
                  'vrMap': {}
                }
              }
            }
            copiedData.ThreatSequence[i]['ATDAssessmentSequence']['ThreatCategoryDescription'] = validations[i];
            copiedData.ThreatSequence[i]['ATDAssessmentSequence']['ATDAssessmentProbability'] = 1;

            if (validations[i] === "CONFIRM") {
              copiedData.ThreatSequence[i]['ATDAssessmentSequence']['ATDAssessmentFlag'] = "THREAT";
              copiedData.ThreatSequence[i]['ATDAssessmentSequence']['ATDAbilityAssessment'] = "NO_INTERFERENCE";
            } else if (validations[i] === "REJECT") {
              copiedData.ThreatSequence[i]['ATDAssessmentSequence']['ATDAssessmentFlag'] = "NO_THREAT";
              copiedData.ThreatSequence[i]['ATDAssessmentSequence']['ATDAbilityAssessment'] = "NO_INTERFERENCE";
              numberAlarmObjs = numberAlarmObjs - 1;
              numberTotalObjs = numberTotalObjs - 1;
              copiedData.NumberOfAlarmObjects = numberAlarmObjs;
              copiedData.NumberOfTotalObjects = numberTotalObjs;
            }
          } //end for loop through validations
        } // end if validations.length>1

        else {
          if (copiedData.ThreatSequence) {
            copiedData.ThreatSequence['ReferencedPTOSequence'] = {
              'vrMap': {},
              'PotentialThreatObjectID': copiedData.ThreatSequence['PotentialThreatObjectID'],
              'ReferencedTDRInstanceSequence': {
                'ReferencedSOPClassUID': copiedData.SOPClassUID,
                'ReferencedSOPInstanceUID': copiedData.SOPInstanceUID,
                'vrMap': {}
              }
            }
          }
          copiedData.ThreatSequence['ATDAssessmentSequence']['ThreatCategoryDescription'] = validations;
          copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAssessmentProbability'] = 1;

          if (validations[i] === "CONFIRM") {
            copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAssessmentFlag'] = "THREAT";
            copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAbilityAssessment'] = "NO_INTERFERENCE";
          } else if (validations === "REJECT") {
            copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAssessmentFlag'] = "NO_THREAT";
            copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAbilityAssessment'] = "NO_INTERFERENCE";
            numberAlarmObjs = numberAlarmObjs - 1;
            numberTotalObjs = numberTotalObjs - 1;
            copiedData.NumberOfAlarmObjects = numberAlarmObjs;
            copiedData.NumberOfTotalObjects = numberTotalObjs;
          }
        } // else
      } //end else abort

      dicomDict.dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(copiedData);
      let new_file_WriterBuffer = dicomDict.write();
      var file = new Blob([new_file_WriterBuffer], {type: "image/dcs"});
      return file;
    };

    fileReader.readAsArrayBuffer(image);
  }
};
