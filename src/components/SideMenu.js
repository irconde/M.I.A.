import React from 'react';
import PropTypes from 'prop-types';
import TreeAlgorithm from './TreeView/TreeAlgorithm';
import '../App.css';
import NextButton from './NextButton';
import * as constants from '../Constants';
import Utils from '../Utils';
import { connect, useSelector } from 'react-redux';
import { getDetectionsByAlgorithm } from '../redux/slices/detections/detectionsSlice';

const SideMenu = ({
    nextImageClick,
    configurationInfo,
    enableMenu,
    appUpdateImage,
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

    /**
     * setVisibilityData - Receives updates from TreeAlgorithm, passing in it's algorithm and boolean value
     *
     * @param {Number} algorithmIndex
     * @param {Boolean} bool
     * @returns {type}   None
     */
    const setVisibilityData = (algorithm, bool) => {
        this.props.updateDetectionSetVisibility(algorithm, !bool);
    };

    const updateImage = () => {
        appUpdateImage();
    };

    /**
     * updateSelected - This function is how we control which algorithm is selected. We loop
     *                  through each detection set, controlling which algorithm/detection set is
     *                  selected. As well, with controlling the selection of those algorithm's detections.
     *
     * @param {type} index
     * @param {type} bool
     * @returns {type} none
     */
    const updateSelected = (bool, algorithm) => {
        const prevState = this.state;
        this.setState({ ...prevState, algorithmSelected: bool });
        this.props.onDetectionSetSelected({ algorithm: algorithm });
    };

    /**
     * updateSelectedDetection - This function ensures that only one detection is selected at a time.
     *                           When called, each time turns all other values to false. At the end,
     *                           it updates the component and cornerstone image.
     *
     * @param {Detection} detection
     * @returns {type} none
     */
    const updateSelectedDetection = (detection, e) => {
        e.persist();
        if (detection.selected === false) {
            this.props.resetSelectedDetectionBoxes(e);
        }
        const newEvent = Utils.mockCornerstoneEvent(
            e,
            detection.view === constants.viewport.TOP
                ? document.getElementById('dicomImageLeft')
                : document.getElementById('dicomImageRight')
        );
        this.props.onMenuDetectionSelected(detection, newEvent);
    };

    // Checking to see if there is any data in myDetections
    if (algorithms !== undefined && enableMenu) {
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
                        ? algorithms.map((algorithm, index) => {
                              return (
                                  // Setting the Algorithm name, IE OTAP or Tiled
                                  <TreeAlgorithm
                                      key={index}
                                      myKey={index}
                                      algorithm={algorithm}
                                      // TODO: James B. - Remove this once refactored into uiSlice
                                      configurationInfo={configurationInfo}
                                      updateImage={updateImage}
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
    // TODO: James B. - Remove this once refactored into uiSlice
    configurationInfo: PropTypes.object.isRequired,
    enableMenu: PropTypes.bool.isRequired,
    appUpdateImage: PropTypes.func.isRequired,
};

export default connect()(SideMenu);
