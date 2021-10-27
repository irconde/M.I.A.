import React from 'react';
import PropTypes from 'prop-types';
import { Info } from '../SideMenu/Icons';
import { useSelector } from 'react-redux';
import { getConfigInfo } from '../../redux/slices/ui/uiSlice';
import { getSelectedAlgorithm } from '../../redux/slices/detections/detectionsSlice';
import { getDeviceType } from '../../redux/slices/settings/settingsSlice';
import * as constants from '../../utils/Constants';

/**
 * GUI widget that provides the user with information regarding a particular
 * object detection algorithm
 */
const MetaData = () => {
    // TODO: Change isVisible to getSelectedAlgorithmInformation that simply returns the information
    const selectedAlgorithm = useSelector(getSelectedAlgorithm);
    const isVisible = selectedAlgorithm !== '' ? true : false;
    const configInfo = useSelector(getConfigInfo);
    const deviceType = useSelector(getDeviceType);
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
        // Width of screen - side menu width / 2
        left: '45%',
        backgroundColor: 'rgba(38, 38, 38, 0.5)',
        borderRadius: '2.0rem',
        textAlign: 'left',
        color: '#ffffff',
        width: 'max-content',
    };

    if (!isVisible) {
        return <div></div>;
    } else {
        return (
            <div style={divStyle}>
                <Info style={{ verticalAlign: 'text-top' }} />
                <p style={paragraphStyle}>
                    <span style={spanHeadStyle}>Detector Type:</span>
                    <span style={spanBodyStyle}>
                        {' '}
                        {configInfo.detectorType}
                    </span>
                </p>
                <p style={slashLineStyle}>/</p>
                <p style={paragraphStyle}>
                    <span style={spanHeadStyle}>Detector Configuration:</span>
                    <span style={spanBodyStyle}>
                        {' '}
                        {configInfo.detectorConfigType}
                    </span>
                </p>
                <p style={slashLineStyle}>/</p>
                <p style={paragraphStyle}>
                    <span style={spanHeadStyle}>Series:</span>
                    <span style={spanBodyStyle}> {configInfo.seriesType}</span>
                </p>
                <p style={slashLineStyle}>/</p>
                <p style={paragraphStyle}>
                    <span style={spanHeadStyle}>Study:</span>
                    <span style={spanBodyStyle}> {configInfo.studyType}</span>
                </p>
            </div>
        );
    }
};

MetaData.propTypes = {
    isVisible: PropTypes.bool,
};

export default MetaData;
