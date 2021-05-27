import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import TreeAlgorithm from './TreeView/TreeAlgorithm';
import '../App.css';
import NextButton from './NextButton';
import * as constants from '../Constants';
import Utils from '../Utils';
import { useSelector } from 'react-redux';
import { getDetectionsByAlgorithm } from '../redux/slices/detections/detectionsSlice';
import TreeDetection from './TreeView/TreeDetection';

const SideMenu = ({
    nextImageClick,
    configurationInfo,
    enableMenu,
    appUpdateImage,
    resetSelectedDetectionBoxes,
}) => {
    const algorithms = useSelector(getDetectionsByAlgorithm);
    const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;
    const treeStyle = {
        top: '0',
        color: 'white',
        fill: 'white',
        width: '100%',
        height: 'inherit',
    };

    // Checking to see if there is any data in myDetections
    if (algorithms.length > 0 && enableMenu) {
        return (
            <div
                className="treeview-main"
                style={{
                    width: sideMenuWidth,
                    height: document.documentElement.clientHeight,
                }}>
                {/* How we create the trees and their nodes is using map */}
                <div
                    style={{
                        height:
                            constants.sideMenuPaddingTop +
                            constants.RESOLUTION_UNIT,
                    }}></div>
                <div style={treeStyle}>
                    {algorithms.length > 0
                        ? algorithms.map((det, i) => {
                              return (
                                  <div key={i}>
                                      {/* <TreeAlgorithm
                                          detections={det}
                                          configurationInfo={configurationInfo}
                                          updateImage={appUpdateImage}
                                          resetSelectedDetectionBoxes={
                                              resetSelectedDetectionBoxes
                                          }
                                      /> */}
                                      {det.map((d, z) => {
                                          return (
                                              <TreeDetection
                                                  key={z}
                                                  detection={d}
                                                  updateImage={appUpdateImage}
                                                  algorithmVisible={true}
                                                  resetSelectedDetectionBoxes={
                                                      resetSelectedDetectionBoxes
                                                  }
                                              />
                                          );
                                      })}
                                  </div>
                              );
                          })
                        : null}
                </div>
                <NextButton nextImageClick={nextImageClick} />
            </div>
        );
    } else {
        return <div />;
    }
};

SideMenu.propTypes = {
    nextImageClick: PropTypes.func.isRequired,
    // TODO: James B. - Remove this once refactored into uiSlice
    configurationInfo: PropTypes.object.isRequired,
    enableMenu: PropTypes.bool.isRequired,
    appUpdateImage: PropTypes.func.isRequired,
    resetSelectedDetectionBoxes: PropTypes.func.isRequired,
};

export default SideMenu;
