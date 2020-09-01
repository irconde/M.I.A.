import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TopBar extends Component {
    constructor(props){
        super(props);
        this.state = {
            barStyle: {
                position: 'absolute',
                display: 'flex',
                height: '3.375rem',
                backgroundColor: '#2b2b2b',
                left: '0',
                top: '0',
                width: '100%',
                zIndex: '1',
                alignItems: 'center',
                justifyContent: 'flex-end',
                color: 'white'
            },
            imgStyle: {
                margin: '0.5rem'
            },
            imgLog: {
                margin: '0.5rem 1rem 0.5rem 0.5rem'
            },
            verticalLine: {
                borderLeft: '0.07rem solid #545454',
                height: '65%',
                margin: '0.25rem'
            }            
        }
    }

    static propTypes = {
        numberOfFiles: PropTypes.number,
        isUpload: PropTypes.bool,
        isDownload: PropTypes.bool,
        isConnected: PropTypes.bool
    }

    logClick(e) {
        // Todo
        // Build a log system and a collapsable menu
    }

    render() {
        if (this.props.isUpload === true && this.props.isDownload === true) {
            return (
                <div style={this.state.barStyle}>
                    <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <title>ic_file_queue</title>
                        <g id="ic_file_queue" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">                            
                            <rect fill="#000000" x="0" y="0" width="32" height="32"></rect>
                            <g id="recent_actors-24px" transform="translate(1.000000, 0.000000)">
                                <polygon id="Path" points="0 0 32 0 32 32 0 32"></polygon>
                                <path d="M27.2380952,6.66666667 L27.2380952,25.3333333 L30.6666667,25.3333333 L30.6666667,6.66666667 L27.2380952,6.66666667 Z M21.9047619,25.3333333 L25.3333333,25.3333333 L25.3333333,6.66666667 L21.9047619,6.66666667 L21.9047619,25.3333333 Z M18.6666667,6.66666667 L2.66666667,6.66666667 C1.93333333,6.66666667 1.33333333,7.26666667 1.33333333,8 L1.33333333,24 C1.33333333,24.7333333 1.93333333,25.3333333 2.66666667,25.3333333 L18.6666667,25.3333333 C19.4,25.3333333 20,24.7333333 20,24 L20,8 C20,7.26666667 19.4,6.66666667 18.6666667,6.66666667 Z" id="Shape" fill="#FFFFFF" fillRule="nonzero"></path>
                            </g>
                        </g>
                        <text x="35%" y="50%" fontSize="8.5pt"  fill="black" dominantBaseline="middle" textAnchor="middle">{this.props.numberOfFiles}</text>
                    </svg>
                    <img style={this.state.imgStyle} src='./img/ic_traffic_download_upload.svg' />
                    <img style={this.state.imgStyle} src={this.props.isConnected ? '/img/ic_connection.svg' : '/img/ic_no_connection.svg'} />
                    <div style={this.state.verticalLine} />
                    <img
                        style={this.state.imgLog}
                        src='./img/ic_log_list.svg'
                        onClick={this.logClick}
                    />
                </div>
            );
        } else if (this.props.isUpload === true && this.props.isDownload === false ){
            return (
                <div style={this.state.barStyle}>
                    <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <title>ic_file_queue</title>
                        <g id="ic_file_queue" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">                            
                            <rect fill="#000000" x="0" y="0" width="32" height="32"></rect>
                            <g id="recent_actors-24px" transform="translate(1.000000, 0.000000)">
                                <polygon id="Path" points="0 0 32 0 32 32 0 32"></polygon>
                                <path d="M27.2380952,6.66666667 L27.2380952,25.3333333 L30.6666667,25.3333333 L30.6666667,6.66666667 L27.2380952,6.66666667 Z M21.9047619,25.3333333 L25.3333333,25.3333333 L25.3333333,6.66666667 L21.9047619,6.66666667 L21.9047619,25.3333333 Z M18.6666667,6.66666667 L2.66666667,6.66666667 C1.93333333,6.66666667 1.33333333,7.26666667 1.33333333,8 L1.33333333,24 C1.33333333,24.7333333 1.93333333,25.3333333 2.66666667,25.3333333 L18.6666667,25.3333333 C19.4,25.3333333 20,24.7333333 20,24 L20,8 C20,7.26666667 19.4,6.66666667 18.6666667,6.66666667 Z" id="Shape" fill="#FFFFFF" fillRule="nonzero"></path>
                            </g>
                        </g>
                        <text x="35%" y="50%" fontSize="8.5pt"  fill="black" dominantBaseline="middle" textAnchor="middle">{this.props.numberOfFiles}</text>
                    </svg>
                    <img style={this.state.imgStyle} src='./img/ic_traffic_upload.svg' />
                    <img style={this.state.imgStyle} src={this.props.isConnected ? '/img/ic_connection.svg' : '/img/ic_no_connection.svg'} />
                    <div style={this.state.verticalLine} />
                    <img
                        style={this.state.imgLog}
                        src='./img/ic_log_list.svg'
                        onClick={this.logClick}
                    />
                </div>
            );
        } else if (this.props.isUpload === false && this.props.isDownload === true ){
            return (
                <div style={this.state.barStyle}>
                    <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <title>ic_file_queue</title>
                        <g id="ic_file_queue" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">                            
                            <rect fill="#000000" x="0" y="0" width="32" height="32"></rect>
                            <g id="recent_actors-24px" transform="translate(1.000000, 0.000000)">
                                <polygon id="Path" points="0 0 32 0 32 32 0 32"></polygon>
                                <path d="M27.2380952,6.66666667 L27.2380952,25.3333333 L30.6666667,25.3333333 L30.6666667,6.66666667 L27.2380952,6.66666667 Z M21.9047619,25.3333333 L25.3333333,25.3333333 L25.3333333,6.66666667 L21.9047619,6.66666667 L21.9047619,25.3333333 Z M18.6666667,6.66666667 L2.66666667,6.66666667 C1.93333333,6.66666667 1.33333333,7.26666667 1.33333333,8 L1.33333333,24 C1.33333333,24.7333333 1.93333333,25.3333333 2.66666667,25.3333333 L18.6666667,25.3333333 C19.4,25.3333333 20,24.7333333 20,24 L20,8 C20,7.26666667 19.4,6.66666667 18.6666667,6.66666667 Z" id="Shape" fill="#FFFFFF" fillRule="nonzero"></path>
                            </g>
                        </g>
                        <text x="35%" y="50%" fontSize="8.5pt"  fill="black" dominantBaseline="middle" textAnchor="middle">{this.props.numberOfFiles}</text>
                    </svg>
                    <img style={this.state.imgStyle} src='./img/ic_traffic_download.svg' />
                    <img style={this.state.imgStyle} src={this.props.isConnected ? '/img/ic_connection.svg' : '/img/ic_no_connection.svg'} />
                    <div style={this.state.verticalLine} />
                    <img
                        style={this.state.imgLog}
                        src='./img/ic_log_list.svg'
                        onClick={this.logClick}
                    />
                </div>
            );
        } else if (this.props.isUpload === false && this.props.isDownload === false){
            return (
                <div style={this.state.barStyle}>
                    <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <title>ic_file_queue</title>
                        <g id="ic_file_queue" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">                            
                            <rect fill="#000000" x="0" y="0" width="32" height="32"></rect>
                            <g id="recent_actors-24px" transform="translate(1.000000, 0.000000)">
                                <polygon id="Path" points="0 0 32 0 32 32 0 32"></polygon>
                                <path d="M27.2380952,6.66666667 L27.2380952,25.3333333 L30.6666667,25.3333333 L30.6666667,6.66666667 L27.2380952,6.66666667 Z M21.9047619,25.3333333 L25.3333333,25.3333333 L25.3333333,6.66666667 L21.9047619,6.66666667 L21.9047619,25.3333333 Z M18.6666667,6.66666667 L2.66666667,6.66666667 C1.93333333,6.66666667 1.33333333,7.26666667 1.33333333,8 L1.33333333,24 C1.33333333,24.7333333 1.93333333,25.3333333 2.66666667,25.3333333 L18.6666667,25.3333333 C19.4,25.3333333 20,24.7333333 20,24 L20,8 C20,7.26666667 19.4,6.66666667 18.6666667,6.66666667 Z" id="Shape" fill="#FFFFFF" fillRule="nonzero"></path>
                            </g>
                        </g>
                        <text x="35%" y="50%" fontSize="8.5pt"  fill="black" dominantBaseline="middle" textAnchor="middle">{this.props.numberOfFiles}</text>
                    </svg>
                    <img style={this.state.imgStyle} src='./img/ic_traffic_no_transmission.svg' />
                    <img style={this.state.imgStyle} src={this.props.isConnected ? '/img/ic_connection.svg' : '/img/ic_no_connection.svg'} />
                    <div style={this.state.verticalLine} />
                    <img
                        style={this.state.imgLog}
                        src='./img/ic_log_list.svg'
                        onClick={this.logClick}
                    />
                </div>
            );
        }
    }
}

export default TopBar;