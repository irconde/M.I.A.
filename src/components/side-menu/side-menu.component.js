import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getAnnotations } from '../../redux/slices/annotation.slice';
import { getCollapsedSideMenu } from '../../redux/slices/ui.slice';
import {
    CollapsableArrowIconContainer,
    SideMenuAlgorithm,
    SideMenuAlgorithmName,
    SideMenuContainer,
    SideMenuList,
    SideMenuListWrapper,
} from './side-menu.styles';
import ArrowIcon from '../../icons/shared/arrow-icon/arrow.icon';

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

// const SideMenuComponent = () => {
//     const annotations = useSelector(getAnnotations);
//     const [isExpanded, setIsExpanded] = useState(true);
//     /*const enableMenu = useSelector(getReceivedTime);
// 	 const algorithms = useSelector(getDetectionsByAlgorithm);*/
//     const collapsedSideMenu = useSelector(getCollapsedSideMenu);
//
//     const annotationsByCategory = annotations.reduce((acc, annotation) => {
//         if (!acc[annotation.categoryName]) {
//             acc[annotation.categoryName] = [];
//         }
//         acc[annotation.categoryName].push(annotation);
//         return acc;
//     }, {});
//
//     if (annotations.length > 0) {
//         return (
//             <SideMenuContainer collapsedSideMenu={collapsedSideMenu}>
//                 <SideMenuListWrapper
//                     height={document.documentElement.clientHeight}>
//                     {/* How we create the trees and their nodes is using map */}
//                     <SideMenuList id={'side-menu-list'}>
//                         {Object.keys(annotationsByCategory).map(
//                             (categoryName) => (
//                                 <div key={categoryName}>
//                                     <div className={'algorithm-title'}>
//                                         <SideMenuAlgorithmName>
//                                             {categoryName.toUpperCase()}
//                                         </SideMenuAlgorithmName>
//                                         <CollapsableArrowIconContainer
//                                             onClick={() =>
//                                                 setIsExpanded(!isExpanded)
//                                             }>
//                                             <ArrowIcon
//                                                 direction={
//                                                     isExpanded
//                                                         ? 'down'
//                                                         : 'right'
//                                                 }
//                                                 width="1.5rem"
//                                                 height="1.5rem"
//                                                 color="white"
//                                             />
//                                         </CollapsableArrowIconContainer>
//                                     </div>
//                                     <div className={'dropdown-container'}>
//                                         {annotationsByCategory[
//                                             categoryName
//                                         ].map((annotation, index) => (
//                                             <SideMenuAlgorithm key={index}>
//                                                 <SideMenuAlgorithmName>
//                                                     {annotation.categoryName.toUpperCase()}
//                                                 </SideMenuAlgorithmName>
//                                             </SideMenuAlgorithm>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )
//                         )}
//                     </SideMenuList>
//                 </SideMenuListWrapper>
//             </SideMenuContainer>
//         );
//     } else return null;
// };

const SideMenuComponent = () => {
    const annotations = useSelector(getAnnotations);
    const collapsedSideMenu = useSelector(getCollapsedSideMenu);

    const annotationsByCategory = annotations.reduce((acc, annotation) => {
        if (!acc[annotation.categoryName]) {
            acc[annotation.categoryName] = [];
        }
        acc[annotation.categoryName].push(annotation);
        return acc;
    }, {});

    const [expandedCategories, setExpandedCategories] = useState(() => {
        return Object.keys(annotationsByCategory).reduce((acc, key) => {
            acc[key] = true;
            return acc;
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
                                    <div className={'algorithm-title'}>
                                        <SideMenuAlgorithmName>
                                            {categoryName.toUpperCase()}
                                        </SideMenuAlgorithmName>
                                        <CollapsableArrowIconContainer
                                            onClick={() =>
                                                setExpandedCategories(
                                                    (
                                                        prevExpandedCategories
                                                    ) => {
                                                        return {
                                                            ...prevExpandedCategories,
                                                            [categoryName]:
                                                                !prevExpandedCategories[
                                                                    categoryName
                                                                ],
                                                        };
                                                    }
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
                                    </div>
                                    <div className={'dropdown-container'}>
                                        {expandedCategories[categoryName] &&
                                            annotationsByCategory[
                                                categoryName
                                            ].map((annotation, index) => (
                                                <SideMenuAlgorithm key={index}>
                                                    <SideMenuAlgorithmName>
                                                        {annotation.categoryName.toUpperCase()}
                                                    </SideMenuAlgorithmName>
                                                </SideMenuAlgorithm>
                                            ))}
                                    </div>
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
