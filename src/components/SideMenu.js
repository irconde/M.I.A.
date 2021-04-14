import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TreeAlgorithm from './TreeView/TreeAlgorithm';
import '../App.css';
import NextButton from './NextButton';
import * as constants from '../Constants';
import Utils from '../Utils';

class SideMenu extends Component {
    numberOfAlgorithms = 0;
    constructor(props) {
        super(props);

        this.state = {
            treeStyle: {
                top: '0',
                color: 'white',
                fill: 'white',
                width: '100%',
                height: 'inherit',
            },
            algorithmSelected: false,
            sideMenuWidth: constants.sideMenuWidth + constants.RESOLUTION_UNIT,
        };

        this.updateSelected = this.updateSelected.bind(this);
        this.updateSelectedDetection = this.updateSelectedDetection.bind(this);
        this.setVisibilityData = this.setVisibilityData.bind(this);
        this.updateImage = this.updateImage.bind(this);
    }

    static propTypes = {
        detections: PropTypes.object.isRequired,
        configurationInfo: PropTypes.object.isRequired,
        enableMenu: PropTypes.bool.isRequired,
        appUpdateImage: PropTypes.func.isRequired,
        onAlgorithmSelected: PropTypes.func.isRequired,
        onMenuDetectionSelected: PropTypes.func.isRequired,
        resetSelectedDetectionBoxes: PropTypes.func.isRequired,
        onDetectionSelected: PropTypes.func.isRequired,
        onDetectionSetSelected: PropTypes.func.isRequired,
        updateDetectionVisibility: PropTypes.func.isRequired,
        updateDetectionSetVisibility: PropTypes.func.isRequired,
    };

    /**
     * setVisibilityData - Receives updates from TreeAlgorithm, passing in it's algorithm and boolean value
     *
     * @param {Number} algorithmIndex
     * @param {Boolean} bool
     * @returns {type}   None
     */
    setVisibilityData(algorithm, bool) {
        this.props.updateDetectionSetVisibility(algorithm, !bool);
    }

    updateImage() {
        this.props.appUpdateImage();
    }

    /**
     * updateSelected - This function is how we control which algorithm is selected. We loop
     *                  through each detection set, controlling which algorithm/detection set is
     *                  selected. As well, with controlling the selection of those algorithm's detections.
     *
     * @param {type} index
     * @param {type} bool
     * @returns {type} none
     */
    updateSelected(bool, algorithm) {
        const prevState = this.state;
        this.setState({ ...prevState, algorithmSelected: bool });
        this.props.onDetectionSetSelected({ algorithm: algorithm });
    }

    /**
     * updateSelectedDetection - This function ensures that only one detection is selected at a time.
     *                           When called, each time turns all other values to false. At the end,
     *                           it updates the component and cornerstone image.
     *
     * @param {Detection} detection
     * @returns {type} none
     */
    updateSelectedDetection(detection, e) {
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
    }

    render() {
        this.numberOfAlgorithms = 0;
        // We can't use map on the this.props.detection in the return
        // Therefore, we will populate the array myDetections with this data before returning
        let myDetections = [];
        for (const [key, detectionSet] of Object.entries(
            this.props.detections
        )) {
            myDetections.push({
                algorithm: detectionSet.algorithm,
                data: detectionSet.data,
                selected: detectionSet.selected,
                visibility: detectionSet.visible,
            });
        }
        // Checking to see if there is any data in myDetections
        if (myDetections.length !== 0 && this.props.enableMenu) {
            return (
                <div
                    className="treeview-main"
                    style={{
                        width: this.state.sideMenuWidth,
                        height: document.documentElement.clientHeight,
                    }}>
                    {/* How we create the trees and their nodes is using map */}
                    <div
                        style={{
                            height:
                                constants.sideMenuPaddingTop +
                                constants.RESOLUTION_UNIT,
                        }}></div>
                    <div style={this.state.treeStyle}>
                        {myDetections.map((value, index) => {
                            this.numberOfAlgorithms++;
                            return (
                                // Setting the Algorithm name, IE OTAP or Tiled
                                <TreeAlgorithm
                                    key={index}
                                    myKey={index}
                                    algorithm={value}
                                    updateSelected={this.updateSelected}
                                    updateSelectedDetection={
                                        this.updateSelectedDetection
                                    }
                                    configurationInfo={
                                        this.props.configurationInfo
                                    }
                                    setVisibilityData={this.setVisibilityData}
                                    updateDetectionVisibility={
                                        this.props.updateDetectionVisibility
                                    }
                                    updateImage={this.updateImage}
                                    resetSelectedDetectionBoxes={
                                        this.props.resetSelectedDetectionBoxes
                                    }
                                />
                            );
                        })}
                    </div>
                    <NextButton
                        enableNextButton={this.props.enableNextButton}
                        nextImageClick={this.props.nextImageClick}
                    />
                </div>
            );
        } else {
            return <div />;
        }
    }
}

SideMenu.propTypes = {
    enableNextButton: PropTypes.bool.isRequired,
    nextImageClick: PropTypes.func.isRequired,
};

export default SideMenu;
