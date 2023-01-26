import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getAnnotations } from '../../redux/slices/annotation.slice';
import { getCollapsedSideMenu } from '../../redux/slices/ui.slice';
import {
    AnnotationColor,
    AnnotationContainer,
    AnnotationWrapper,
    CollapsableArrowIconContainer,
    EyeIconWrapper,
    SideMenuAnnotation,
    SideMenuAnnotationName,
    SideMenuContainer,
    SideMenuList,
    SideMenuListWrapper,
} from './side-menu.styles';
import ArrowIcon from '../../icons/shared/arrow-icon/arrow.icon';
import VisibilityOnIcon from '../../icons/side-menu/visibility-on-icon/visibility-on.icon';

const iconProps = {
    width: '20px',
    height: '20px',
    color: '#b9b9b9',
};

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

    const handleCollapse = (categoryName) =>
        setExpandedCategories((prevExpandedCategories) => ({
            ...prevExpandedCategories,
            [categoryName]: !prevExpandedCategories[categoryName],
        }));

    if (annotations.length > 0) {
        return (
            <SideMenuContainer collapsedSideMenu={collapsedSideMenu}>
                <SideMenuListWrapper
                    height={document.documentElement.clientHeight}>
                    <SideMenuList id={'side-menu-list'}>
                        {Object.keys(annotationsByCategory).map(
                            (categoryName) => (
                                <div key={categoryName}>
                                    <AnnotationContainer>
                                        <AnnotationColor
                                            color={
                                                annotationsByCategory[
                                                    categoryName
                                                ][0].color
                                            }
                                        />
                                        <AnnotationWrapper>
                                            <CollapsableArrowIconContainer
                                                onClick={() =>
                                                    handleCollapse(categoryName)
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
                                            <SideMenuAnnotationName>
                                                {categoryName.toUpperCase()}
                                            </SideMenuAnnotationName>
                                        </AnnotationWrapper>
                                        <EyeIconWrapper>
                                            <VisibilityOnIcon {...iconProps} />
                                        </EyeIconWrapper>
                                    </AnnotationContainer>
                                    {expandedCategories[categoryName] &&
                                        annotationsByCategory[categoryName].map(
                                            (annotation, index) => (
                                                <SideMenuAnnotation key={index}>
                                                    <AnnotationColor
                                                        color={annotation.color}
                                                        style={{ opacity: 0.6 }}
                                                    />
                                                    <SideMenuAnnotationName
                                                        style={{
                                                            marginLeft:
                                                                '2.5rem',
                                                        }}>
                                                        {annotation.categoryName.toUpperCase()}{' '}
                                                        0{index + 1}
                                                    </SideMenuAnnotationName>
                                                    <EyeIconWrapper>
                                                        <VisibilityOnIcon
                                                            {...iconProps}
                                                        />
                                                    </EyeIconWrapper>
                                                </SideMenuAnnotation>
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
