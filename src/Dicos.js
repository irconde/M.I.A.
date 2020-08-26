/**
 * Class that emcompases any secondary method related to DICOS file management
 */

import * as dcmjs from 'dcmjs';

export default class Dicos {


  /**
   * @static write - Method that takes validation information and the original
   * DICOS data and generates the data to be encoded in the amended DICOS file
   *
   * @param  {type} validationList Array with information regarding the validations made on the detections
   * @param  {type} image          Original DICOS data
   * @param  {type} abort= false   Boolean value that represents the abort flag.
   *                               True. When feedback has been left for at least one detection, we need to create a TDR to save feedback
   *                               False. When feedback has not been left for any detection we need to create a TDR w/ ABORT flag
   * @return {type}                Blob with data for the creation of the amended DICOS file.
   */
  static dataToBlob(validationList, image, abort= false) {

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    let validations = [];
    if(validationList !== null){
      validations = validationList;
    }
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

    if(copiedData.ThreatSequence) {
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

    if(abort === true){
      copiedData.abortFlag = 'ABORT';
      copiedData.abortReason = 'NOT_REVIEWED';
      copiedData.AdditionalScreeningPerformed = "NO";
    }

    else {
      copiedData.abortFlag = 'SUCCESS';
      copiedData.AdditionalScreeningPerformed = "YES";
      copiedData.AdditionalInspectionSelectionCriteria = "RANDOM";

      // TODO: Rewrite/modify this when we receive test files with multiple detections
      for(var i = 0; i<validations.length; i++){
        copiedData.ThreatSequence['ATDAssessmentSequence']['ThreatCategoryDescription'] = validations[i];
        copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAssessmentProbability'] = 1;

        if (validations[i] === "CONFIRM"){
          copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAssessmentFlag'] = "THREAT";
          copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAbilityAssessment'] = "NO_INTERFERENCE";
        }
        else if (validations[i] === "REJECT") {
          copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAssessmentFlag'] = "NO_THREAT";
          copiedData.ThreatSequence['ATDAssessmentSequence']['ATDAbilityAssessment'] = "NO_INTERFERENCE";
          numberAlarmObjs = numberAlarmObjs - 1;
          numberTotalObjs = numberTotalObjs - 1;
          copiedData.NumberOfAlarmObjects = numberAlarmObjs;
          copiedData.NumberOfTotalObjects = numberTotalObjs;
        }
      } //end for loop through validations
    } //end else abort

    dicomDict.dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(copiedData);
    let new_file_WriterBuffer = dicomDict.write();
    var file = new Blob([new_file_WriterBuffer], {type: "image/dcs"});
    return file;
  }

}
