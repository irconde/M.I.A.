import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TreeAlgorithm from './TreeView/TreeAlgorithm';
import '../App.css';
import { withTheme } from 'styled-components';

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
            algSelected: new Array()
        }            
        this.updateSelected = this.updateSelected.bind(this);
    }

    updateSelected(index, bool) {
        if (bool){
            this.state.algSelected.fill(false);
        }
        this.state.algSelected[index] = bool;        
        this.forceUpdate();
    }

    static propTypes = {
        detections: PropTypes.object.isRequired,
        configurationInfo: PropTypes.object.isRequired
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
        // this.state.algSelected = new Array();
        if (myDetections.length !== 0 && this.props.enableMenu){
            return (
                <div className="treeview-main">
                    {/* Checking to see if there is any data in myDetections */}
                        {/* How we create the trees and their nodes is using map */}
                        <div style={this.state.treeStyle}>
                            {myDetections.map((value, index) => {
                                // this.state.algSelected.push(false);
                                return (
                                    // Setting the Algorithm name, IE OTAP or Tiled 
                                    <TreeAlgorithm 
                                        key={index} 
                                        myKey={index}
                                        algorithm={value} 
                                        updateSelected={this.updateSelected} 
                                        selectionControl={this.state.algSelected[index]}
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