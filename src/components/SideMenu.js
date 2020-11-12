import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tree from '../components/TreeView/Tree';
import '../App.css';
import * as constants from '../Constants';

class SideMenu extends Component {

    constructor(props){
        super(props);
        this.state ={
            treeStyles: {
                position: 'relative',
                top: '3.75rem',
                left: '1.25rem',
                color: 'white',
                fill: 'white',
                width: '100%',
            },
            typeStyles: {
                fontSize: '1em',
                verticalAlign: 'middle',
            }
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
                <Tree 
                    content={myDetections.length !== 0 ? "Algorithms" : "No Image"}
                    canHide={myDetections.length !== 0 ? true : false}
                    open={myDetections.length !== 0 ? true : false}
                    style={this.state.treeStyles}
                >
                    {/* How we create the trees and their nodes is using map */}
                    {myDetections.map((value, index) => {
                        return (
                            // Setting the Algorithm name, IE OTAP or Tiled 
                            <Tree key={index} content={value.algorithm} open canHide>
                                {/* We then need to map each detection as a child node to the tree, checking if data exists again first */}
                                {value.data.top !== undefined ? 
                                    value.data.top.map((value, index) => {
                                        let detectionColor = null;
                                        if (value.selected === true){
                                            detectionColor = constants.detectionStyle.SELECTED_COLOR;
                                        } else {
                                            if (value.validation === undefined) {
                                                detectionColor = constants.detectionStyle.NORMAL_COLOR;
                                            } else if (value.validation === false) {
                                                detectionColor = constants.detectionStyle.INVALID_COLOR;
                                            } else if (value.validation === true) {
                                                detectionColor = constants.detectionStyle.VALID_COLOR;
                                            }
                                        }
                                        return (
                                            <Tree
                                                content={`${value.class} - ${value.confidence}%`}
                                                canHide
                                                visible={value.visible}
                                                key={index}
                                                type={<div style={{
                                                    backgroundColor: detectionColor,
                                                    width: '1rem',
                                                    height: '1rem',
                                                    display: 'inline-block',
                                                    marginTop: '0.5rem',
                                                    border: '0.0625rem solid white'
                                                }}></div>}
                                            />
                                        )
                                    })
                                    : 
                                    // If no data
                                    <Tree
                                        content="Loading"
                                        canHide
                                        visible={false}
                                    />
                                }
                                {/* Repeating the process for the side stack if it exists */}
                                {value.data.side !== undefined ? 
                                    value.data.side.map((value, index) => {
                                        // Deciding what color to display next to the detection
                                        let detectionColor = null;
                                        if (value.selected === true){
                                            detectionColor = constants.detectionStyle.SELECTED_COLOR;
                                        } else {
                                            if (value.validation === undefined) {
                                                detectionColor = constants.detectionStyle.NORMAL_COLOR;
                                            } else if (value.validation === false) {
                                                detectionColor = constants.detectionStyle.INVALID_COLOR;
                                            } else if (value.validation === true) {
                                                detectionColor = constants.detectionStyle.VALID_COLOR;
                                            }
                                        }
                                        return (
                                            <Tree
                                                content={`${value.class} - ${value.confidence}%`}
                                                canHide
                                                visible={value.visible}
                                                key={index}
                                                type={<div style={{
                                                    backgroundColor: detectionColor,
                                                    width: '1rem',
                                                    height: '1rem',
                                                    display: 'inline-block',
                                                    marginTop: '0.5rem',
                                                    border: '0.0625rem solid white'                                                    
                                                }}></div>}
                                            />
                                        )
                                    })
                                    : 
                                    // No data
                                    <Tree
                                        content="Loading"
                                        canHide
                                        visible={false}
                                    />
                                }
                            </Tree>
                        )
                    })}
                </Tree>                
            </div>
        );
    }
}

export default SideMenu;