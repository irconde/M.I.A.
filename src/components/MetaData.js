import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MetaData extends Component {
    constructor(props){
        super(props);
        this.state = {
            spanHeadStyle: {
                fontWeight: 'normal'
            },
            spanBodyStyle: {
                fontWeight: 'lighter'
            },
            paragraphStyle: {
                margin: '0.4rem 0.7rem 0.4rem 0.7rem'
            },
            hrStyle: {
                backgroundColor: '#979797',
                height: '0.01rem',
                border: '0',
                marginTop: '0.8rem',
                marginBottom: '0.8rem',
                width: '95%'
            },
            divStyle: {
                position: 'absolute',
                top: '4rem',
                left: '2rem',
                opacity: '75%',
                backgroundColor: '#282828',
                borderRadius: '0.3rem',
                justifyContent: 'center',
                textAlign: 'left',
                color: '#ffffff',
                padding: '0.2rem 0.5rem',
                width: 'auto'
            }
        }

    }

    static propTypes = {
        algorithmType: PropTypes.string,
        detectorType: PropTypes.string,
        detectorConfigType: PropTypes.string,
        seriesType: PropTypes.string,
        studyType: PropTypes.string
    }

    render() {
        return (
            <div style={this.state.divStyle}>
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Algorithm:</span> 
                    <span style={this.state.spanBodyStyle}> {this.props.algorithmType}</span>
                </p> 
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Detector Type:</span> 
                    <span style={this.state.spanBodyStyle}> {this.props.detectorType}</span>
                </p> 
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Detector Configuration:</span> 
                    <span style={this.state.spanBodyStyle}> {this.props.detectorConfigType}</span>
                </p> 
                <hr style={this.state.hrStyle} /> 
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Series:</span> 
                   <span style={this.state.spanBodyStyle}> {this.props.seriesType}</span>
                </p> 
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Study:</span> 
                   <span style={this.state.spanBodyStyle}> {this.props.studyType}</span>
                </p>
            </div>
        );
    }
}

export default MetaData;