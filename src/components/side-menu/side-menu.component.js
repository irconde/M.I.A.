import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAnnotations,
    getHasAllAnnotationsDeleted,
    getSelectedAnnotation,
    getSelectedCategory,
    selectAnnotation,
    selectAnnotationCategory,
    toggleCategoryVisibility,
    toggleVisibility,
} from '../../redux/slices/annotation.slice';
import {
    getSideMenuVisible,
    setSideMenu,
    updateAnnotationContextVisibility,
    updateCornerstoneMode,
} from '../../redux/slices/ui.slice';
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
import ExpandIcon from '../../icons/shared/expand-icon/expand.icon';
import VisibilityOffIcon from '../../icons/side-menu/visibility-off-icon/visibility-off.icon';
import Utils from '../../utils/general/Utils';
import { cornerstoneMode } from '../../utils/enums/Constants';
import SaveButtonComponent from './buttons/save-button.component';

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
    const dispatch = useDispatch();
    const annotations = useSelector(getAnnotations);
    const isSideMenuVisible = useSelector(getSideMenuVisible);
    const selectedAnnotation = useSelector(getSelectedAnnotation);
    const selectedCategory = useSelector(getSelectedCategory);
    const allAnnotationsDeleted = useSelector(getHasAllAnnotationsDeleted);
    const allAnnotationsDeletedRef = useRef(allAnnotationsDeleted);

    useEffect(() => {
        if (
            allAnnotationsDeleted !== allAnnotationsDeletedRef.current &&
            allAnnotationsDeleted === true
        ) {
            dispatch(setSideMenu(false));
        }
        allAnnotationsDeletedRef.current = allAnnotationsDeleted;
    }, [allAnnotationsDeleted]);

    const annotationsByCategory = annotations.reduce((object, annotation) => {
        if (!object[annotation.categoryName]) {
            object[annotation.categoryName] = [];
        }
        object[annotation.categoryName].push(annotation);
        return object;
    }, {});

    const [expandedCategories, setExpandedCategories] = useState(() => {
        return Object.keys(annotationsByCategory).reduce((object, key) => {
            object[key] = false;
            return object;
        }, {});
    });

    const handleCollapse = (categoryName) =>
        setExpandedCategories((prevExpandedCategories) => ({
            ...prevExpandedCategories,
            [categoryName]: !prevExpandedCategories[categoryName],
        }));

    const handleAnnotationContainerClick = (event, categoryName) => {
        if (event.target.id.includes('category')) {
            if (selectedAnnotation !== null) {
                dispatch(updateAnnotationContextVisibility(false));
            }
            if (
                JSON.stringify(expandedCategories) === '{}' ||
                expandedCategories[categoryName] === undefined ||
                expandedCategories[categoryName] === false
            ) {
                handleCollapse(categoryName);
            }
            dispatch(updateCornerstoneMode(cornerstoneMode.SELECTION));
            Utils.dispatchAndUpdateImage(
                dispatch,
                selectAnnotationCategory,
                categoryName
            );
        }
    };

    const handleAnnotationNameClick = (annotation) => {
        dispatch(updateCornerstoneMode(cornerstoneMode.EDITION));
        Utils.dispatchAndUpdateImage(dispatch, selectAnnotation, annotation.id);
        dispatch(updateAnnotationContextVisibility(true));
    };

    return (
        <SideMenuContainer isSideMenuVisible={isSideMenuVisible}>
            <SideMenuListWrapper>
                <SideMenuList id={'side-menu-list'}>
                    {Object.keys(annotationsByCategory).map(
                        (categoryName, index) => (
                            <div key={index}>
                                <AnnotationContainer
                                    selected={selectedCategory === categoryName}
                                    onClick={(e) =>
                                        handleAnnotationContainerClick(
                                            e,
                                            categoryName
                                        )
                                    }
                                    id={'category-container'}>
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
                                            }
                                            id={'category-text'}>
                                            {categoryName.toUpperCase()}
                                        </SideMenuAnnotationName>
                                    </AnnotationWrapper>
                                    <EyeIconWrapper
                                        onClick={() =>
                                            Utils.dispatchAndUpdateImage(
                                                dispatch,
                                                toggleCategoryVisibility,
                                                categoryName
                                            )
                                        }
                                        id={`${categoryName}-visible-icon-${index}`}>
                                        {annotationsByCategory[categoryName][0]
                                            .categoryVisible ? (
                                            <VisibilityOnIcon
                                                color={'#b9b9b9'}
                                                id={`${categoryName}-visible-on-icon-${index}`}
                                                {...iconProps}
                                            />
                                        ) : (
                                            <VisibilityOffIcon
                                                color={'#808080'}
                                                id={`${categoryName}-visible-off-icon-${index}`}
                                                {...iconProps}
                                            />
                                        )}
                                    </EyeIconWrapper>
                                </AnnotationContainer>
                                {expandedCategories[categoryName] &&
                                    annotationsByCategory[categoryName].map(
                                        (annotation, index) => (
                                            <SideMenuAnnotation
                                                selected={annotation.selected}
                                                categorySelected={
                                                    selectedCategory ===
                                                    categoryName
                                                }
                                                onClick={() =>
                                                    handleAnnotationNameClick(
                                                        annotation
                                                    )
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
                                                            'calc(1.5rem + 22px)',
                                                    }}
                                                    id={`annotation.categoryName-${index}`}>
                                                    {annotation.categoryName.toUpperCase()}{' '}
                                                    0{index + 1}
                                                </SideMenuAnnotationName>
                                                <EyeIconWrapper
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        Utils.dispatchAndUpdateImage(
                                                            dispatch,
                                                            toggleVisibility,
                                                            annotation.id
                                                        );
                                                    }}
                                                    id={`${annotation.categoryName}-visible-icon-${index}`}>
                                                    {annotation.visible ? (
                                                        <VisibilityOnIcon
                                                            color={'#b9b9b9'}
                                                            id={`${annotation.categoryName}-visible-on-icon-${index}`}
                                                            {...iconProps}
                                                        />
                                                    ) : (
                                                        <VisibilityOffIcon
                                                            color={'#808080'}
                                                            id={`${annotation.categoryName}-visible-off-icon-${index}`}
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
            <SaveButtonComponent />
        </SideMenuContainer>
    );
};

export default SideMenuComponent;
