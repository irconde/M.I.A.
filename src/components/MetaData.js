import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MetaData extends Component {
    constructor(props){
        super(props);
        this.state = {
            spanHeadStyle: {
                fontWeight: '500'
            },
            spanBodyStyle: {
                fontWeight: '300'
            },
            paragraphStyle: {
                margin: '0.4rem 0.7rem 0.4rem 0.7rem'
            },
            hrStyle: {
                backgroundColor: '#979797',
                height: '0.01rem',
                border: '0',
                marginTop: '0.9rem',
                marginBottom: '0.8rem',
                width: '95%'
            },
            divStyle: {
                position: 'absolute',
                top: '5rem',
                left: '2rem',
                backgroundColor: 'rgba(38, 38, 38, 0.75)',
                borderRadius: '0.5rem',
                justifyContent: 'center',
                textAlign: 'left',
                color: '#ffffff',
                padding: '0.8rem 0.8rem',
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
