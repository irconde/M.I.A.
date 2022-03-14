import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../../App.css';
import NextButton from './NextButton';
import * as constants from '../../utils/Constants';
import { useSelector } from 'react-redux';
import { getDetectionsByAlgorithm } from '../../redux/slices/detections/detectionsSlice';
import SideMenuAlgorithm from './SideMenuAlgorithm';
import {
    getCollapsedSideMenu,
    getReceivedTime,
} from '../../redux/slices/ui/uiSlice';
import {
    getHasFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import SaveButton from './SaveButton';
import Utils from '../../utils/Utils';

/**
 * Component menu that displays all detection objects, seperated by algorithm.
 *
 * @component
 *
 * @param {function} nextImageClick Callback for loading next image
 * @param {function} resetCornerstoneTools Callback to reset cornerstone tools to initial values
 * @param {function} renderDetectionContextMenu Callback to render specific detection context menus
 *
 *
 */

const SideMenu = ({
    nextImageClick,
    resetCornerstoneTools,
    renderDetectionContextMenu,
}) => {
    const enableMenu = useSelector(getReceivedTime);
    const algorithms = useSelector(getDetectionsByAlgorithm);
    const collapsedSideMenu = useSelector(getCollapsedSideMenu);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const hasFileOutput = useSelector(getHasFileOutput);
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
    const prevIsMenuCollapsed = Utils.usePrevious(collapsedSideMenu);
    useEffect(() => {
        // If we didn't check to make sure the value changed with the previous value
        // The component would re-render infinitely and crash, as the useEffect runs every time
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
    // Checking to see if the app has a file received via local or remote using the received time from the uiSlice
    if (enableMenu !== null) {
        // iif already collapsed, render the sidemenu, but inverted
        if (collapsedSideMenu) {
            return (
                <div
                    style={{ ...translateStyle, transition: 'none' }}
                    className="side-menu-container">
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
                                              renderDetectionContextMenu={
                                                  renderDetectionContextMenu
                                              }
                                          />
                                      );
                                  })
                                : null}
                        </div>
                        {remoteOrLocal === true ||
                        (!remoteOrLocal && hasFileOutput) ? (
                            <NextButton nextImageClick={nextImageClick} />
                        ) : (
                            <SaveButton nextImageClick={nextImageClick} />
                        )}
                    </div>
                </div>
            );
        } else {
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
                                              renderDetectionContextMenu={
                                                  renderDetectionContextMenu
                                              }
                                          />
                                      );
                                  })
                                : null}
                        </div>
                        {remoteOrLocal === true ||
                        (!remoteOrLocal && hasFileOutput) ? (
                            <NextButton nextImageClick={nextImageClick} />
                        ) : (
                            <SaveButton nextImageClick={nextImageClick} />
                        )}
                    </div>
                </div>
            );
        }
    } else {
        return <div />;
    }
};

SideMenu.propTypes = {
    nextImageClick: PropTypes.func.isRequired,
    resetCornerstoneTools: PropTypes.func.isRequired,
    renderDetectionContextMenu: PropTypes.func.isRequired,
};

export default SideMenu;
