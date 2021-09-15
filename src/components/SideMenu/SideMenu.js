import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '../../App.css';
import NextButton from './NextButton';
import * as constants from '../../utils/Constants';
import { useSelector } from 'react-redux';
import { getDetectionsByAlgorithm } from '../../redux/slices/detections/detectionsSlice';
import SideMenuAlgorithm from './SideMenuAlgorithm';
import { getNumFilesInQueue } from '../../redux/slices/server/serverSlice';
import { getCollapsedSideMenu } from '../../redux/slices/ui/uiSlice';

const SideMenu = ({ nextImageClick, resetCornerstoneTools }) => {
    const algorithms = useSelector(getDetectionsByAlgorithm);
    const collapsedSideMenu = useSelector(getCollapsedSideMenu);
    const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;
    const [translateStyle, setTranslateStyle] = useState({
        transform: `translate(${sideMenuWidth})`,
    });
    const treeStyle = {
        top: '0',
        color: 'white',
        fill: 'white',
        width: '100%',
        height: 'inherit',
    };

    // This will create a ref to the previous value passed in, it how in
    // functional components you can get the prior state to see if a change occurred
    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    };
    const prevIsMenuCollapsed = usePrevious(collapsedSideMenu);
    useEffect(() => {
        // If we didn't check to make sure the value changed with the previous value
        // The component would re-render infinitely and crash, as the useEffect runs everytime
        // the component is rendered
        if (prevIsMenuCollapsed !== collapsedSideMenu) {
            if (collapsedSideMenu === true) {
                setTranslateStyle({
                    transform: `translate(${sideMenuWidth})`,
                });
            } else {
                setTranslateStyle({
                    transform: `translate(0)`,
                });
            }
        }
    });

    const numOfFiles = useSelector(getNumFilesInQueue);
    const enableMenu = numOfFiles > 0;
    // Checking to see if there is any data in myDetections
    if (algorithms.length > 0 && enableMenu) {
        return (
            <div style={translateStyle} className="side-menu-container">
                <div
                    className="treeview-main"
                    style={{
                        width: sideMenuWidth,
                        height: document.documentElement.clientHeight,
                    }}>
                    {/* How we create the trees and their nodes is using map */}
                    <div
                        style={{
                            height:
                                constants.sideMenuPaddingTop +
                                constants.RESOLUTION_UNIT,
                        }}></div>
                    <div style={treeStyle}>
                        {algorithms.length > 0
                            ? algorithms.map((detections, i) => {
                                  return (
                                      <SideMenuAlgorithm
                                          key={i}
                                          detections={detections}
                                          resetCornerstoneTools={
                                              resetCornerstoneTools
                                          }
                                      />
                                  );
                              })
                            : null}
                    </div>
                    <NextButton nextImageClick={nextImageClick} />
                </div>
            </div>
        );
    } else {
        return <div />;
    }
};

SideMenu.propTypes = {
    nextImageClick: PropTypes.func.isRequired,
    resetCornerstoneTools: PropTypes.func.isRequired,
};

export default SideMenu;
