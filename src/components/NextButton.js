import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';

class NextButton extends Component {
    constructor(props){
        super(props)
        this.state = {
            hover: false
        }
        this.toggleHoverNext = this.toggleHoverNext.bind(this);
    }
    static propTypes = {
        nextImageClick: PropTypes.func.isRequired,
        displayNext: PropTypes.bool.isRequired
    }
    toggleHoverNext(){
        this.setState({hover: !this.state.hover});
    }
    render() {
        if (this.props.displayNext === true){
            var nextStyle;
            if (this.state.hover){
                nextStyle = {
                    width: '10vw',
                    height: '100vh',
                    opacity: '85%',
                    backgroundColor: '#282828',
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    display: 'block'
                }
            } else {
                nextStyle = {
                    width: '10vw',
                    height: '100vh',
                    opacity: '70%',
                    backgroundColor: '#282828',
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    display: 'block'
                }
            }
            return (
                <div className="overlay" 
                onClick={this.props.nextImageClick}
                onMouseEnter={this.toggleHoverNext}
                onMouseLeave={this.toggleHoverNext}
                style={nextStyle}
                >
                    <ReactSVG
                        onClick={this.props.nextImageClick}
                        src="./img/next-arrow.svg"
                        style={{
                        position: 'absolute',
                        top: '45vh',
                        right: '1rem',
                        }}
                    />
                </div>
            );
        } else {
            return (
                <div className="next-place-holder"></div>
            );
        }
    }
}

export default NextButton;