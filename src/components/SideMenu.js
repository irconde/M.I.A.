import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TreeAlgorithm from './TreeView/TreeAlgorithm';
import '../App.css';

class SideMenu extends Component {
    constructor(props){
        super(props);
        this.state = {
            treeStyle: {
                top: '0',
                color: 'white',
                fill: 'white',
                width: '100%'
            },
            selectedAlgorithm: [],
            selectedDetection: [],
            lastSelection: false,
            lastCoords: [],
            algorithmSelected: false
        }            
        this.updateSelected = this.updateSelected.bind(this);
        this.updateSelectedDetection = this.updateSelectedDetection.bind(this);
    }

    static propTypes = {
        detections: PropTypes.object.isRequired,
        configurationInfo: PropTypes.object.isRequired
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
    updateSelected(index, bool) {
        if (bool){
            this.state.selectedAlgorithm.fill(false);
            this.state.algorithmSelected = true;
        } else {
            this.state.algorithmSelected = false;
        }
        this.state.selectedAlgorithm[index] = bool;
        if (this.state.lastSelection) {
            this.state.lastSelection = false;
        }
        for (let i = 0; i < this.state.selectedDetection.length; i++) {
            this.state.selectedDetection[i] = new Array();
            this.state.selectedDetection[i].fill(false);
        }
        this.forceUpdate();
    }

    /**
     * updateSelectedDetection - Is a function that controls which detection is currently selected.
     *                          How it works is we have an array called selectedDetection, which is an array
     *                          that contains an array at each element. This is representing each algorithm
     *                          as an element, with its subsequent detections as the array of booleans in that
     *                          element. We always set the entire array to be false, so that only
     *                          one value is ever true. Which we set right afterwards based on the detection
     *                          index clicked in the TreeDetection component. We use forceUpdate here, as
     *                          manipulating state arrays is not so straight forward when using setState.
     * 
     * @param {type} algorithmIndex 
     * @param {type} detectionIndex 
     * @param {type} numDetections 
     * @returns {type} none 
     */
    updateSelectedDetection(algorithmIndex, detectionIndex, numDetections) {
        if (this.state.algorithmSelected) {
            this.state.algorithmSelected = false;
            this.state.selectedAlgorithm.fill(false);
        }
        if (this.state.lastCoords[0] === algorithmIndex && this.state.lastCoords[1] === detectionIndex) {
            // Clicked same detection
            this.state.lastSelection = !this.state.lastSelection;
        } else {
            if (this.state.lastSelection === false) {
                this.state.lastSelection = true;
            }
        }
        this.state.lastCoords[0] = algorithmIndex;
        this.state.lastCoords[1] = detectionIndex;
        if (this.state.selectedDetection.length >= 0) {
            for (let i = 0; i < this.state.selectedDetection.length; i++) {
                this.state.selectedDetection[i] = new Array();
                this.state.selectedDetection[i].fill(false);
            }
        }
        this.state.selectedDetection[algorithmIndex] = new Array(numDetections+1);
        this.state.selectedDetection[algorithmIndex][detectionIndex] = this.state.lastSelection;
        this.forceUpdate();
    }

    render() {
        // We can't use map on the this.props.detection in the return
        // Therefore, we will populate the array myDetections with this data before returning
        let myDetections = [];
        for (const [key, detectionSet] of Object.entries(this.props.detections)) {
            myDetections.push({
                algorithm: detectionSet.algorithm,
                data: detectionSet.data
            });   
        }
        // Checking to see if there is any data in myDetections
        if (myDetections.length !== 0 && this.props.enableMenu){
            return (
                <div className="treeview-main">                    
                        {/* How we create the trees and their nodes is using map */}
                        <div style={this.state.treeStyle}>
                            {myDetections.map((value, index) => {      
                                return (
                                    // Setting the Algorithm name, IE OTAP or Tiled 
                                    <TreeAlgorithm 
                                        key={index} 
                                        myKey={index}
                                        algorithm={value} 
                                        updateSelected={this.updateSelected} 
                                        updateSelectedDetection={this.updateSelectedDetection}
                                        selectionControl={this.state.selectedAlgorithm[index]}
                                        selectionDetectionControl={this.state.selectedDetection[index]}
                                        configurationInfo={this.props.configurationInfo} 
                                        
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