import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tree from '../components/TreeView/Tree';
import '../App.css';

class SideMenu extends Component {

    constructor(props){
        super(props);
        this.state ={
            treeStyles: {
                position: 'relative',
                top: '3.75rem',
                left: 20,
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
        let myDetections = [];
        for (const [key, detectionSet] of Object.entries(this.props.detections)) {
            myDetections.push({
                algorithm: detectionSet.algorithm,
                data: detectionSet.data
            });
        }
        return (
            <div className="treeview-main">
                <Tree 
                    content={myDetections.length !== 0 ? "Algorithms" : "No Image"}
                    canHide={myDetections.length !== 0 ? true : false}
                    open={myDetections.length !== 0 ? true : false}
                    style={this.state.treeStyles}
                >
                    {myDetections.map((value, index) => {
                        return (
                            <Tree key={index} content={value.algorithm} open canHide>
                                {value.data.top !== undefined ? 
                                    value.data.top.map((value, index) => {
                                        return (
                                            <Tree
                                                content={`${value.class} - ${value.confidence}%`}
                                                canHide
                                                visible={value.visible}
                                                key={index}
                                            />
                                        )
                                    })
                                    : 
                                    <Tree
                                        content="Loading"
                                        canHide
                                        visible={false}
                                    />
                                }
                                {value.data.side !== undefined ? 
                                    value.data.side.map((value, index) => {
                                        return (
                                            <Tree
                                                content={`${value.class} - ${value.confidence}%`}
                                                canHide
                                                visible={value.visible}
                                                key={index}
                                            />
                                        )
                                    })
                                    : 
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