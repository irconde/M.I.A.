import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getDetectionsByAlgorithm } from '../../redux/slices-old/detections/detectionsSlice';
import SideMenuAlgorithmComponent from './algorithm-detection/side-menu-algorithm.component';
import {
    getCollapsedSideMenu,
    getReceivedTime,
} from '../../redux/slices-old/ui/uiSlice';
import SaveButtonComponent from './buttons/save-button.component';
import {
    SideMenuContainer,
    SideMenuList,
    SideMenuListWrapper,
} from './side-menu.styles';

/**
 * Component menu that displays all detection objects, seperated by algorithm.
 *
 * @component
 *
 */

const SideMenuComponent = ({
    nextImageClick,
    resetCornerstoneTools,
    renderDetectionContextMenu,
}) => {
    const enableMenu = useSelector(getReceivedTime);
    const algorithms = useSelector(getDetectionsByAlgorithm);
    const collapsedSideMenu = useSelector(getCollapsedSideMenu);

    // Checking to see if the app has a file received via local or remote using the received time from the uiSlice
    if (enableMenu === null) {
        return <></>;
    } else {
        return (
            <SideMenuContainer collapsedSideMenu={collapsedSideMenu}>
                <SideMenuListWrapper
                    height={document.documentElement.clientHeight}>
                    {/* How we create the trees and their nodes is using map */}
                    <SideMenuList>
                        {algorithms.length > 0
                            ? algorithms.map((detections, i) => {
                                  return (
                                      <SideMenuAlgorithmComponent
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
                    </SideMenuList>

                    <SaveButtonComponent nextImageClick={nextImageClick} />
                </SideMenuListWrapper>
            </SideMenuContainer>
        );
    }
};

SideMenuComponent.propTypes = {
    /**
     * Callback for loading next image
     */
    nextImageClick: PropTypes.func.isRequired,
    /**
     * Callback to reset cornerstone tools to initial values
     */
    resetCornerstoneTools: PropTypes.func.isRequired,
    /**
     * Callback to render specific detection context menus
     */
    renderDetectionContextMenu: PropTypes.func.isRequired,
};

export default SideMenuComponent;
