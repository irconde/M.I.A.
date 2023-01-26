import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getAnnotations } from '../../redux/slices/annotation.slice';
import { getCollapsedSideMenu } from '../../redux/slices/ui.slice';
import {
    AlgorithmColor,
    AlgorithmContainer,
    AlgorithmWrapper,
    CollapsableArrowIconContainer,
    EyeIconWrapper,
    SideMenuAlgorithm,
    SideMenuAlgorithmName,
    SideMenuContainer,
    SideMenuList,
    SideMenuListWrapper,
} from './side-menu.styles';
import ArrowIcon from '../../icons/shared/arrow-icon/arrow.icon';
import VisibilityOnIcon from '../../icons/side-menu/visibility-on-icon/visibility-on.icon';

// <SideMenuContainer collapsedSideMenu={collapsedSideMenu}>
//     <SideMenuListWrapper
//         height={document.documentElement.clientHeight}>
//         {/* How we create the trees and their nodes is using map */}
//         <SideMenuList>
//             {annotations.map((annotation, index) => {
//                 return (
//                     <SideMenuAlgorithm key={index}>
//                         <SideMenuAlgorithmName>
//                             {annotation.categoryName.toUpperCase()}
//                         </SideMenuAlgorithmName>
//                     </SideMenuAlgorithm>
//                 );
//             })}
//         </SideMenuList>
//     </SideMenuListWrapper>
// </SideMenuContainer>

/**
 * Component menu that displays all detection objects, seperated by algorithm.
 *
 * @component
 *
 */
const SideMenuComponent = () => {
    const annotations = useSelector(getAnnotations);
    const collapsedSideMenu = useSelector(getCollapsedSideMenu);

    const annotationsByCategory = annotations.reduce((object, annotation) => {
        if (!object[annotation.categoryName]) {
            object[annotation.categoryName] = [];
        }
        object[annotation.categoryName].push(annotation);
        return object;
    }, {});

    const [expandedCategories, setExpandedCategories] = useState(() => {
        return Object.keys(annotationsByCategory).reduce((object, key) => {
            object[key] = true;
            return object;
        }, {});
    });

    if (annotations.length > 0) {
        return (
            <SideMenuContainer collapsedSideMenu={collapsedSideMenu}>
                <SideMenuListWrapper
                    height={document.documentElement.clientHeight}>
                    <SideMenuList id={'side-menu-list'}>
                        {Object.keys(annotationsByCategory).map(
                            (categoryName) => (
                                <div key={categoryName}>
                                    <AlgorithmContainer>
                                        <AlgorithmColor
                                            color={
                                                annotationsByCategory[
                                                    categoryName
                                                ][0].color
                                            }
                                        />
                                        <AlgorithmWrapper>
                                            <CollapsableArrowIconContainer
                                                onClick={() =>
                                                    setExpandedCategories(
                                                        (
                                                            prevExpandedCategories
                                                        ) => ({
                                                            ...prevExpandedCategories,
                                                            [categoryName]:
                                                                !prevExpandedCategories[
                                                                    categoryName
                                                                ],
                                                        })
                                                    )
                                                }>
                                                <ArrowIcon
                                                    direction={
                                                        expandedCategories[
                                                            categoryName
                                                        ]
                                                            ? 'down'
                                                            : 'right'
                                                    }
                                                    width="1.5rem"
                                                    height="1.5rem"
                                                    color="white"
                                                />
                                            </CollapsableArrowIconContainer>
                                            <SideMenuAlgorithmName>
                                                {categoryName.toUpperCase()}
                                            </SideMenuAlgorithmName>
                                        </AlgorithmWrapper>

                                        <EyeIconWrapper>
                                            <VisibilityOnIcon
                                                height="20px"
                                                width="20px"
                                                color="#b9b9b9"
                                            />
                                        </EyeIconWrapper>
                                    </AlgorithmContainer>
                                    {expandedCategories[categoryName] &&
                                        annotationsByCategory[categoryName].map(
                                            (annotation, index) => (
                                                <SideMenuAlgorithm key={index}>
                                                    <AlgorithmColor
                                                        color={annotation.color}
                                                        style={{ opacity: 0.6 }}
                                                    />
                                                    <SideMenuAlgorithmName
                                                        style={{
                                                            marginLeft:
                                                                '2.5rem',
                                                        }}>
                                                        {annotation.categoryName.toUpperCase()}{' '}
                                                        0{index + 1}
                                                    </SideMenuAlgorithmName>
                                                    <EyeIconWrapper>
                                                        <VisibilityOnIcon
                                                            height="20px"
                                                            width="20px"
                                                            color="#b9b9b9"
                                                        />
                                                    </EyeIconWrapper>
                                                </SideMenuAlgorithm>
                                            )
                                        )}
                                </div>
                            )
                        )}
                    </SideMenuList>
                </SideMenuListWrapper>
            </SideMenuContainer>
        );
    }
};

export default SideMenuComponent;
