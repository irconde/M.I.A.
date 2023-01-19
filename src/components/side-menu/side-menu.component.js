import React from 'react';
import { useSelector } from 'react-redux';
import {
    SideMenuContainer,
    SideMenuList,
    SideMenuListWrapper,
} from './side-menu.styles';
import { getAnnotations } from '../../redux/slices/annotation.slice';
import {
    SideMenuAlgorithm,
    SideMenuAlgorithmName,
} from './algorithm-detection/side-menu-algorithm.styles';
import { getCollapsedSideMenu } from '../../redux/slices/ui.slice';

/**
 * Component menu that displays all detection objects, seperated by algorithm.
 *
 * @component
 *
 */

const SideMenuComponent = () => {
    const annotations = useSelector(getAnnotations);
    /*const enableMenu = useSelector(getReceivedTime);
	 const algorithms = useSelector(getDetectionsByAlgorithm);*/
    const collapsedSideMenu = useSelector(getCollapsedSideMenu);

    console.log(collapsedSideMenu);

    if (annotations.length > 0) {
        return (
            <SideMenuContainer collapsedSideMenu={collapsedSideMenu}>
                <SideMenuListWrapper
                    height={document.documentElement.clientHeight}>
                    {/* How we create the trees and their nodes is using map */}
                    <SideMenuList>
                        {annotations.map((annotation, index) => {
                            return (
                                <SideMenuAlgorithm key={index}>
                                    <SideMenuAlgorithmName>
                                        {annotation.categoryName.toUpperCase()}
                                    </SideMenuAlgorithmName>
                                </SideMenuAlgorithm>
                            );
                        })}
                    </SideMenuList>
                </SideMenuListWrapper>
            </SideMenuContainer>
        );
    } else return null;
};

export default SideMenuComponent;
