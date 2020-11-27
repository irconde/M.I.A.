import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Info } from '../TreeView/Icons';

/**
 * GUI widget that provides the user with information regarding a particular
 * object detection algorithm
 */
class MetaData extends Component {
    constructor(props){
        super(props);
        this.state = {
            slashLineStyle: {
                fontFamily: 'Noto Sans JP Black',
                color: '#367FFF',
                display: 'inline-block'
            },
            spanHeadStyle: {
                fontFamily: 'Noto Sans JP Medium'
            },
            spanBodyStyle: {
                fontFamily: 'Noto Sans JP Regular',
            },
            paragraphStyle: {
                margin: '0.6rem 0.6rem 0.6rem 0.6rem',
                display: 'inline-block',
                fontSize: '14',
                color: 'white'
            },
            divStyle: {
                paddingLeft: '1rem',
                paddingRight: '1rem',
                position: 'fixed',
                top: '5rem',
                left: '30%',
                backgroundColor: 'rgba(38, 38, 38, 0.5)',
                borderRadius: '1.375rem',
                justifyContent: 'center',
                textAlign: 'left',
                color: '#ffffff',
                width: 'max-content',
                height: '2.8125rem',
                
            },
        }
    }

    static propTypes = {
        isVisible: PropTypes.bool,
        detectorType: PropTypes.string,
        detectorConfigType: PropTypes.string,
        seriesType: PropTypes.string,
        studyType: PropTypes.string
    }

    render() {
        if (!this.props.isVisible) return (<div></div>);
        return (
            <div style={this.state.divStyle}>
                <Info style={{verticalAlign: 'text-top'}} />
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Detector Type:</span>
                    <span style={this.state.spanBodyStyle}> {this.props.detectorType}</span>
                </p>
                <p style={this.state.slashLineStyle}>/</p>
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Detector Configuration:</span>
                    <span style={this.state.spanBodyStyle}> {this.props.detectorConfigType}</span>
                </p>
                <p style={this.state.slashLineStyle}>/</p>
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Series:</span>
                   <span style={this.state.spanBodyStyle}> {this.props.seriesType}</span>
                </p>
                <p style={this.state.slashLineStyle}>/</p>
               <p style={this.state.paragraphStyle}>
                   <span style={this.state.spanHeadStyle}>Study:</span>
                   <span style={this.state.spanBodyStyle}> {this.props.studyType}</span>
                </p>
            </div>
        );
    }
}

export default MetaData;
