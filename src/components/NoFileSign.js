import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NoFileSign extends Component {
  constructor(props){
      super(props);
      this.state = {
          paragraphStyle: {
              fontWeight: '500',
              marginTop: '0.0rem',
              textAlign: 'center',
              width: '100%',
              fontSize: '34pt',
              textTransform: 'uppercase',
              color: '#367FFF'
          },
          divStyle: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: 'auto',
            opacity: '1.0'
          },
          imgStyle: {
            opacity: '0.9',
            width: '90%',
            height: '90%'
          }
      }

  }

  static propTypes = {
      isVisible: PropTypes.bool
  }

  render() {
      if (!this.props.isVisible) return (<div></div>);
      return (
          <div style={this.state.divStyle}>
            <img style={this.state.imgStyle} src='./img/ic_no_files.svg' alt=""/>
            <p style={this.state.paragraphStyle}> · No file available ·</p>
          </div>
      );
  }

}

export default NoFileSign;
