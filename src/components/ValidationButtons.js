import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ValidationButtons extends Component {

    static propTypes = {
        displayButtons: PropTypes.bool.isRequired,
        onMouseClicked: PropTypes.func.isRequired,
        buttonStyles: PropTypes.object
    }

    render() {
        if ( this.props.displayButtons === false){
            return (
                <div/>
            );
        } else {
            return (
                <div>
                    <button className='feedback-buttons' id="confirm" onClick={this.props.onMouseClicked} style={this.props.buttonStyles.confirm} >CONFIRM</button>
                    <button className='feedback-buttons' id="reject" onClick={this.props.onMouseClicked} style={this.props.buttonStyles.reject}>REJECT</button>
                </div>
            );
        }
    }
}



export default ValidationButtons;
