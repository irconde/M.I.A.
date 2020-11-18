import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';

class TreeDetection extends Component {
    constructor(props){
        super(props);
        this.state = {
            detectionBGStyle: {
                width: '0.75rem',
                height: '0.75rem',
                display: 'inline-block',
                marginBottom: '0.15rem',
                border: '0.0625rem solid white',
                marginLeft: '2rem',
                marginRight: '0.5rem'
            },
            typeStyle: {
                verticalAlign: 'top',
                textTransform: 'uppercase',
                fontFamily: 'Noto Sans JP Regular',
            },
            containerStyle: {
                height: '2.375rem',
                paddingTop: '0.45rem'
            },
            eyeStyle: {
                height: '1.5rem',
                width: '1.5rem',
                display: 'inline-block',
                float: 'right',
                marginRight: '0.5rem',
                marginBottom: '0.25rem'
            },
            isVisible: true
        }
        this.setVisiblity = this.setVisiblity.bind(this);
    }
    static propTypes = {
        detection: PropTypes.object.isRequired,
        detectionColor: PropTypes.string,
        enabled: PropTypes.bool.isRequired,
        selected: PropTypes.bool.isRequired
    }

    setVisiblity(){
        this.setState({ isVisible: !this.state.isVisible });
    }

    render() {
        return (
            <div style={this.props.selected ? {
                ...this.state.containerStyle,
                backgroundColor: 'rgba(54, 126, 255, 0.2)',
            } : this.state.containerStyle}>
                <div style={{
                    ...this.state.detectionBGStyle,
                    backgroundColor: this.props.detectionColor,                                                 
                }}></div>
                <span style={this.state.typeStyle}>{`${this.props.detection.class} - ${this.props.detection.confidence}%`}</span>
                {this.props.enabled && this.state.isVisible ? <Icons.EyeO onClick={this.setVisiblity} style={this.state.eyeStyle} /> : <Icons.EyeC onClick={this.setVisiblity} style={this.state.eyeStyle} />}
            </div>
        );
    }
}

export default TreeDetection;