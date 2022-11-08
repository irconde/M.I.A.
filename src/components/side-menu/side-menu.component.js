import React from 'react';
import { useSelector } from 'react-redux';
import {
    SideMenuContainer,
    SideMenuList,
    SideMenuListWrapper,
} from './side-menu.styles';
import {
    getAnnotations,
    getCategories,
} from '../../redux/slices/annotation.slice';
import {
    SideMenuAlgorithm,
    SideMenuAlgorithmName,
} from './algorithm-detection/side-menu-algorithm.styles';

/**
 * Component menu that displays all detection objects, seperated by algorithm.
 *
 * @component
 *
 */

const SideMenuComponent = () => {
    const annotations = useSelector(getAnnotations);
    const categories = useSelector(getCategories);
    /*const enableMenu = useSelector(getReceivedTime);
    const algorithms = useSelector(getDetectionsByAlgorithm);
    const collapsedSideMenu = useSelector(getCollapsedSideMenu);*/

    if (categories.length > 0) {
        return (
            <SideMenuContainer collapsedSideMenu={false}>
                <SideMenuListWrapper
                    height={document.documentElement.clientHeight}>
                    {/* How we create the trees and their nodes is using map */}
                    <SideMenuList>
                        {categories.map((category, index) => {
                            return (
                                <SideMenuAlgorithm key={index}>
                                    <SideMenuAlgorithmName>
                                        {category.name.toUpperCase()}
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
