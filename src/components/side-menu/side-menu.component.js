import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAnnotations,
    toggleCategoryVisibility,
    toggleVisibility,
} from '../../redux/slices/annotation.slice';
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
import VisibilityOnIcon from '../../icons/side-menu/visibility-on-icon/visibility-on.icon';
import ExpandIcon from '../../icons/side-menu/expand-icon/expand.icon';
import VisibilityOffIcon from '../../icons/side-menu/visibility-off-icon/visibility-off.icon';
import { cornerstone } from '../image-display/image-display.component';

const iconProps = {
    width: '20px',
    height: '20px',
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
    const dispatch = useDispatch();

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

    const visibilityToggleHandler = (id) => {
        const element = document.getElementById('imageContainer');
        if (element !== null) {
            dispatch(toggleVisibility(id));
            cornerstone.updateImage(element, true);
        }
    };

    const visibilityCategoryToggleHandler = (categoryName) => {
        const element = document.getElementById('imageContainer');
        if (element !== null) {
            dispatch(toggleCategoryVisibility(categoryName));
            cornerstone.updateImage(element, true);
        }
    };

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
                                                ][0].categoryVisible
                                                    ? annotationsByCategory[
                                                          categoryName
                                                      ][0].color
                                                    : 'gray'
                                            }
                                        />
                                        <AnnotationWrapper>
                                            <CollapsableArrowIconContainer
                                                onClick={() =>
                                                    handleCollapse(categoryName)
                                                }>
                                                <ExpandIcon
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
                                            <SideMenuAnnotationName
                                                color={
                                                    annotationsByCategory[
                                                        categoryName
                                                    ][0].categoryVisible
                                                        ? 'white'
                                                        : 'gray'
                                                }>
                                                {categoryName.toUpperCase()}
                                            </SideMenuAnnotationName>
                                        </AnnotationWrapper>
                                        <EyeIconWrapper
                                            onClick={() =>
                                                visibilityCategoryToggleHandler(
                                                    categoryName
                                                )
                                            }>
                                            {annotationsByCategory[
                                                categoryName
                                            ][0].categoryVisible ? (
                                                <VisibilityOnIcon
                                                    color={'#b9b9b9'}
                                                    {...iconProps}
                                                />
                                            ) : (
                                                <VisibilityOffIcon
                                                    color={'#808080'}
                                                    {...iconProps}
                                                />
                                            )}
                                        </EyeIconWrapper>
                                    </AnnotationContainer>
                                    {expandedCategories[categoryName] &&
                                        annotationsByCategory[categoryName].map(
                                            (annotation, index) => (
                                                <SideMenuAnnotation
                                                    color={annotation.color}
                                                    selected={
                                                        annotation.selected
                                                    }
                                                    key={index}>
                                                    <AnnotationColor
                                                        color={
                                                            annotation.categoryVisible
                                                                ? annotation.color
                                                                : 'gray'
                                                        }
                                                        style={{ opacity: 0.6 }}
                                                    />
                                                    <SideMenuAnnotationName
                                                        color={
                                                            annotation.visible
                                                                ? 'white'
                                                                : 'gray'
                                                        }
                                                        style={{
                                                            marginLeft:
                                                                '2.5rem',
                                                        }}>
                                                        {annotation.categoryName.toUpperCase()}{' '}
                                                        0{index + 1}
                                                    </SideMenuAnnotationName>
                                                    <EyeIconWrapper
                                                        onClick={() =>
                                                            visibilityToggleHandler(
                                                                annotation.id
                                                            )
                                                        }>
                                                        {annotation.visible ? (
                                                            <VisibilityOnIcon
                                                                color={
                                                                    '#b9b9b9'
                                                                }
                                                                {...iconProps}
                                                            />
                                                        ) : (
                                                            <VisibilityOffIcon
                                                                color={
                                                                    '#808080'
                                                                }
                                                                {...iconProps}
                                                            />
                                                        )}
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
