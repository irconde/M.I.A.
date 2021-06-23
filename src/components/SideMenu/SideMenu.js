import React from 'react';
import PropTypes from 'prop-types';
import '../../App.css';
import NextButton from './NextButton';
import * as constants from '../../utils/Constants';
import { useSelector } from 'react-redux';
import { getDetectionsByAlgorithm } from '../../redux/slices/detections/detectionsSlice';
import SideMenuAlgorithm from './SideMenuAlgorithm';
import { getNumFilesInQueue } from '../../redux/slices/server/serverSlice';

const SideMenu = ({ nextImageClick, resetCornerstoneTools }) => {
    const algorithms = useSelector(getDetectionsByAlgorithm);
    const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;
    const treeStyle = {
        top: '0',
        color: 'white',
        fill: 'white',
        width: '100%',
        height: 'inherit',
    };
    const numOfFiles = useSelector(getNumFilesInQueue);
    const enableMenu = numOfFiles > 0;
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
                        ? algorithms.map((detections, i) => {
                              return (
                                  <SideMenuAlgorithm
                                      key={i}
                                      detections={detections}
                                      resetCornerstoneTools={
                                          resetCornerstoneTools
                                      }
                                  />
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
    resetCornerstoneTools: PropTypes.func.isRequired,
};

export default SideMenu;
