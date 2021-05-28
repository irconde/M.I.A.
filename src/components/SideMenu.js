import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import TreeAlgorithm from './TreeView/TreeAlgorithm';
import '../App.css';
import NextButton from './NextButton';
import * as constants from '../Constants';
import Utils from '../Utils';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import {
    getDetectionsByAlgorithm,
    getSelectedAlgorithm,
    selectDetectionSet,
} from '../redux/slices/detections/detectionsSlice';
import TreeDetection from './TreeView/TreeDetection';

const SideMenu = ({
    nextImageClick,
    configurationInfo,
    enableMenu,
    resetSelectedDetectionBoxes,
    resetCornerstoneTools,
}) => {
    const dispatch = useDispatch();
    const algorithms = useSelector(getDetectionsByAlgorithm);
    const selectedAlgorithm = useSelector(getSelectedAlgorithm);
    const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;
    const treeStyle = {
        top: '0',
        color: 'white',
        fill: 'white',
        width: '100%',
        height: 'inherit',
    };

    const containerStyle = {
        paddingBottom: '0.35rem',
        paddingTop: '0.35rem',
        paddingLeft: '1rem',
    };
    const algorithmTypeStyles = {
        fontSize: 14,
        verticalAlign: 'super',
        fontFamily: 'Noto Sans JP',
        display: 'block',
        margin: 'auto',
        cursor: 'default',
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
                        ? algorithms.map((detections, i) => {
                              return (
                                  <div
                                      style={
                                          selectedAlgorithm ===
                                          detections[0].algorithm
                                              ? {
                                                    ...containerStyle,
                                                    backgroundColor:
                                                        constants.detectionStyle
                                                            .SELECTED_COLOR,
                                                }
                                              : containerStyle
                                      }
                                      key={i}>
                                      <div
                                          onClick={() =>
                                              dispatch(
                                                  selectDetectionSet(
                                                      detections[0].algorithm
                                                  )
                                              )
                                          }
                                          style={algorithmTypeStyles}>
                                          {detections[0].algorithm}
                                      </div>
                                      {detections.map((detection, z) => {
                                          return (
                                              <TreeDetection
                                                  key={z}
                                                  detection={detection}
                                                  algorithmVisible={true}
                                                  resetSelectedDetectionBoxes={
                                                      resetSelectedDetectionBoxes
                                                  }
                                                  resetCornerstoneTools={
                                                      resetCornerstoneTools
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
    resetSelectedDetectionBoxes: PropTypes.func.isRequired,
    resetCornerstoneTools: PropTypes.func.isRequired,
};

export default SideMenu;
