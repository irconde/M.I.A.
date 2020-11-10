import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tree from '../components/TreeView/Tree';
import '../App.css';

class SideMenu extends Component {

    constructor(props){
        super(props);
        this.state ={
            treeStyles: {
                position: 'absolute',
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

    }

    render() {
        return (
            <div className="treeview-main">
                <Tree content="Algorithms" canHide open style={this.state.treeStyles}>
                    <Tree content="Algorithm - Tiled 1.0" canHide>
                        <Tree content="Apple 85%" canHide />
                        <Tree content="ACOPS - 88%" canHide />
                    </Tree>
                    <Tree content="Algorithm - RCNN" canHide>
                        <Tree content="Apple 25%" canHide />
                        <Tree content="ACOPS - 78%" canHide />
                    </Tree>
                </Tree>
                
            </div>
        );
    }
}

export default SideMenu;