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
                width: '100%',
                marginTop: '1rem'
            },
        }
    }

    static propTypes = {
        detections: PropTypes.object.isRequired
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
        return (
            <div className="treeview-main">
                {/* Checking to see if there is any data in myDetections */}
                {/* <Tree 
                    content={myDetections.length !== 0 ? "Algorithms" : "No Image"}
                    canHide={myDetections.length !== 0 ? true : false}
                    open={myDetections.length !== 0 ? true : false}
                    style={this.state.treeStyles}
                > */}
                    {/* How we create the trees and their nodes is using map */}
                    <div style={this.state.treeStyle}>
                        {myDetections.map((value, index) => {
                            return (
                                // Setting the Algorithm name, IE OTAP or Tiled 
                                <TreeAlgorithm key={index} algorithm={value} />
                            )
                        })} 
                    </div>              
            </div>
        );
    }
}

export default SideMenu;