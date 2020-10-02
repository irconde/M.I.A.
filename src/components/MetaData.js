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
                width: 'auto',
            },
            btnStyle: {
              cursor: 'pointer',
              fontWeight: '800',
              width:'94%',
              border: 'none',
              margin: '0.5rem',
              marginTop: '1rem',
              backgroundColor: '#367FFF',
              paddingTop: '0.8rem',
              paddingBottom: '0.8rem',
              borderRadius: '0.2rem',
              color: 'white'
            }
        }

    }

    static propTypes = {
        isVisible: PropTypes.bool,
        algorithmType: PropTypes.string,
        detectorType: PropTypes.string,
        detectorConfigType: PropTypes.string,
        seriesType: PropTypes.string,
        studyType: PropTypes.string
    }

    render() {
        if (!this.props.isVisible) return (<div></div>);
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
                <button style={this.state.btnStyle} id="nextAlg" type="button">NEXT ALGORITHM &gt;</button>
                <button style={this.state.btnStyle} id="prevAlg" type="button"> &lt; PREV ALGORITHM</button>
            </div>
        );
    }
}

export default MetaData;
