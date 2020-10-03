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
                margin: '0.6rem 1.5rem 0.6rem 1.5rem'
            },
            hrStyle: {
                backgroundColor: '#979797',
                height: '0.01rem',
                border: '0',
                textAlign: 'center',
                marginTop: '1.0rem',
                marginBottom: '1.0rem',
                width: '85%'
            },
            divStyle: {
                paddingTop: '0.8rem',
                position: 'absolute',
                top: '5rem',
                left: '2rem',
                backgroundColor: 'rgba(38, 38, 38, 0.75)',
                borderRadius: '0.5rem',
                justifyContent: 'center',
                textAlign: 'left',
                color: '#ffffff',
                width: 'auto',
            },
            btnStyle: {
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '12pt',
              border: 'none',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              width: '20%',
              backgroundColor: '#367FFF',
              padding: '0.8rem',
              borderRadius: '0.2rem',
              color: 'white',
            },
            btnContainerStyle: {
              cursor: 'pointer',
              backgroundColor: '#367FFF',
              width: '100%',
              marginTop: '1.5rem',
              borderBottomLeftRadius: '0.5rem',
              borderBottomRightRadius: '0.5rem'
            },
            algorithmLabelStyle: {
              display: 'inline-block',
              width: '60%',
              textAlign: 'center',
              fontWeight: '800'
            }
        }
        this.onPrevAlgBtnClicked = this.onPrevAlgBtnClicked.bind(this);
        this.onNextAlgBtnClicked = this.onNextAlgBtnClicked.bind(this);
    }

    static propTypes = {
        isVisible: PropTypes.bool,
        algorithmType: PropTypes.string,
        detectorType: PropTypes.string,
        detectorConfigType: PropTypes.string,
        seriesType: PropTypes.string,
        studyType: PropTypes.string
    }

    onPrevAlgBtnClicked(){
      if (this.props.prevAlgBtnEnabled){
        this.props.navigationBtnClick(-1);
      }
    }

    onNextAlgBtnClicked(){
      if (this.props.nextAlgBtnEnabled){
        this.props.navigationBtnClick(1);
      }
    }

    render() {
        const nextBtnClassname = this.props.nextAlgBtnEnabled ? "btn-enabled" : "btn-disabled";
        const prevBtnClassname = this.props.prevAlgBtnEnabled ? "btn-enabled" : "btn-disabled";
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
                <div style={this.state.btnContainerStyle}>
                <button className={prevBtnClassname} style={this.state.btnStyle} id="prevAlg" type="button" onClick={this.onPrevAlgBtnClicked}>&lt;</button>
                <span style={this.state.algorithmLabelStyle}>{this.props.algorithmType}</span>
                <button className={nextBtnClassname} style={this.state.btnStyle} id="nextAlg" type="button" onClick={this.onNextAlgBtnClicked}>&gt;</button>
                </div>
            </div>
        );
    }
}

export default MetaData;
