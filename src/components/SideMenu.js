import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TreeAlgorithm from './TreeView/TreeAlgorithm';
import '../App.css';

class SideMenu extends Component {
    numberOfAlgorithms = 0;
    constructor(props){
        super(props);
        this.state = {
            treeStyle: {
                top: '0',
                color: 'white',
                fill: 'white',
                width: '100%'
            },
            enabledAlgorithm: [],
            algorithmSelected: false
        }            
        this.updateSelected = this.updateSelected.bind(this);
        this.updateSelectedDetection = this.updateSelectedDetection.bind(this);
        this.setVisibilityData = this.setVisibilityData.bind(this);
    }

    static propTypes = {
        detections: PropTypes.object.isRequired,
        configurationInfo: PropTypes.object.isRequired,
        updateAlgorithmDetectionVisibility: PropTypes.func.isRequired,
        appForceUpdate: PropTypes.func.isRequired
    }

    /**
     * setVisibilityData - Receives updates from TreeAlgorithm, passing in it's index and visibility 
     *                  boolean value.
     * 
     * @param {type} algorithmIndex 
     * @param {type} bool 
     * @returns {type}   None
     */
    setVisibilityData(algorithm, bool) {
        for (const [key, detectionSet] of Object.entries(this.props.detections)) {
            if (key === algorithm) {
                detectionSet.visibility = !bool;
                if (detectionSet.visibility === false) {
                    detectionSet.selected = false;
                    detectionSet.anotherSelected = false;
                    detectionSet.selectAlgorithm(false);
                } else {
                    //detectionSet.setDetectionVisibility(true);
                }
            } else if (key !== algorithm && bool === true) {
                detectionSet.anotherSelected = false;
            }
        } 
        this.forceUpdate(() => {
            this.props.appForceUpdate();
        });
    }

    /**
     * updateSelected - Is a function that controls which algorithm is currently selected.
     *                  How it works is we have an array called selectedAlgorithm, which holds
     *                  Boolean values. We always set the entire array to be false, so that only
     *                  one value is ever true. Which we set right afterwards based on the algorithm
     *                  index clicked in the TreeAlgorithm component. We use forceUpdate here, as
     *                  manipulating state arrays is not so straight forward when using setState.
     * 
     * @param {type} index 
     * @param {type} bool 
     * @returns {type} none 
     */
    updateSelected(bool, algorithm) {
        this.state.algorithmSelected = bool;
        for (const [key, detectionSet] of Object.entries(this.props.detections)) {
            if (bool === true) {
                if (key === algorithm) {
                    detectionSet.selected = true;
                    detectionSet.selectAlgorithm(true);
                    detectionSet.anotherSelected = false;
                } else {
                    detectionSet.selectAlgorithm(false);
                    detectionSet.anotherSelected = true;
                    detectionSet.selected = false;
                }
            } else {
                detectionSet.selected = false;
                detectionSet.selectAlgorithm(false);
                detectionSet.anotherSelected = false;
            }
        }      
        this.forceUpdate(() => {
            this.props.appForceUpdate();
        });
    }

    /**
     * updateSelectedDetection - 
     * 
     * @param {Detection} detection 
     * @returns {type} none 
     */
    updateSelectedDetection(detection) {
        if (this.state.algorithmSelected) {
            detection.selected = true;
        }
        if (detection.selected === true) {
            for (const [key, detectionSet] of Object.entries(this.props.detections)) {
                detectionSet.anotherSelected = false;
                detectionSet.selectAlgorithm(false);
                detectionSet.selected = false;
            }
            detection.selected = true;
        }        
        if (this.state.algorithmSelected) {
            this.state.algorithmSelected = false;
        }
        this.forceUpdate(() => {
            this.props.appForceUpdate();
        });      
    }

    render() {
        this.numberOfAlgorithms = 0;
        // We can't use map on the this.props.detection in the return
        // Therefore, we will populate the array myDetections with this data before returning
        let myDetections = [];
        for (const [key, detectionSet] of Object.entries(this.props.detections)) {
            myDetections.push({
                algorithm: detectionSet.algorithm,
                data: detectionSet.data,
                selected: detectionSet.selected,
                visibility: detectionSet.visibility
            });   
        }
        // Checking to see if there is any data in myDetections
        if (myDetections.length !== 0 && this.props.enableMenu){
            return (
                <div className="treeview-main">                    
                        {/* How we create the trees and their nodes is using map */}
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
                                        updateSelectedDetection={this.updateSelectedDetection}
                                        configurationInfo={this.props.configurationInfo} 
                                        setVisibilityData={this.setVisibilityData}
                                    />
                                )
                            })} 
                        </div>              
                </div>
            );
        } else {
            return <div/>;
        }
    }
}

export default SideMenu;