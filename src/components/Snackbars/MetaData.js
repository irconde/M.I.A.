import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Info } from '../SideMenu/Icons';
import { useSelector } from 'react-redux';
import { getDetectorConfigType, getDetectorType, getSeriesType, getStudyType } from '../../redux/slices/ui/uiSlice';
// TODO: James B. - This needs the configurationInfo from the uiSlice.
//                  Refactor this into a Functional Component and useSelector to grab the config info.
//                  Examples of pulling from the uiSlice are in the src/components/EditLabel/index.js
/**
 * GUI widget that provides the user with information regarding a particular
 * object detection algorithm
 */
const MetaData = ({ isVisible }) => {

    const detectorType = useSelector(getDetectorType);
    const detectorConfigType = useSelector(getDetectorConfigType);
    const seriesType = useSelector(getSeriesType);
    const studyType = useSelector(getStudyType);
    console.log(isVisible);

    const slashLineStyle = {
        fontFamily: 'Noto Sans JP Black',
        color: '#367FFF',
        display: 'inline-block',
    };
    const spanHeadStyle = {
        fontFamily: 'Noto Sans JP ',
    };
    const spanBodyStyle = {
        fontFamily: 'Noto Sans JP ',
    };
    const paragraphStyle = {
        margin: '0.6rem 0.6rem 0.6rem 0.6rem',
        display: 'inline-block',
        fontSize: '14',
        color: 'white',
    };
    const divStyle = {
        paddingLeft: '1rem',
        paddingRight: '1rem',
        position: 'fixed',
        top: '5rem',
        left: '60%',
        backgroundColor: 'rgba(38, 38, 38, 0.5)',
        borderRadius: '2.0rem',
        textAlign: 'left',
        color: '#ffffff',
        width: 'max-content',
        transform: 'translateX(-100%)',
    };

    if (!isVisible) {
        return <div></div>;
    }
    else {
        return (
            <div style={divStyle}>
                <Info style={{ verticalAlign: 'text-top' }} />
                <p style={paragraphStyle}>
                    <span style={spanHeadStyle}>Detector Type:</span>
                    <span style={spanBodyStyle}>
                        {' '}
                        {detectorType}
                    </span>
                </p>
                <p style={slashLineStyle}>/</p>
                <p style={paragraphStyle}>
                    <span style={spanHeadStyle}>
                        Detector Configuration:
                    </span>
                    <span style={spanBodyStyle}>
                        {' '}
                        {detectorConfigType}
                    </span>
                </p>
                <p style={slashLineStyle}>/</p>
                <p style={paragraphStyle}>
                    <span style={spanHeadStyle}>Series:</span>
                    <span style={spanBodyStyle}>
                        {' '}
                        {seriesType}
                    </span>
                </p>
                <p style={slashLineStyle}>/</p>
                <p style={paragraphStyle}>
                    <span style={spanHeadStyle}>Study:</span>
                    <span style={spanBodyStyle}>
                        {' '}
                        {studyType}
                    </span>
                </p>
            </div>
        );
    }
}


MetaData.PropTypes = {
    isVisible: PropTypes.bool,
}

export default MetaData;
