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
            selectedAlgorithm: []
        }            
        this.updateSelected = this.updateSelected.bind(this);
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
     * @param {bool} bool 
     * @returns {type} none 
     */
    updateSelected(index, bool) {
        if (bool){
            this.state.selectedAlgorithm.fill(false);
        }
        this.state.selectedAlgorithm[index] = bool;        
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
        if (myDetections.length !== 0 && this.props.enableMenu){
            return (
                <div className="treeview-main">
                    {/* Checking to see if there is any data in myDetections */}
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
                                        selectionControl={this.state.selectedAlgorithm[index]}
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