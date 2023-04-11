import styled from 'styled-components';
import {
    annotationStyle,
    sideMenuPaddingTop,
    sideMenuWidth,
} from '../../utils/enums/Constants';

export const SideMenuContainer = styled.div`
    transition: ${({ isSideMenuVisible }) =>
        isSideMenuVisible ? 'all 0.3s ease-in' : 'none'};
    transform: translate(
        ${(props) => (props.isSideMenuVisible ? 0 : sideMenuWidth)}px
    );
    position: fixed;
    right: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
`;

export const SideMenuList = styled.div`
    top: 0;
    color: white;
    fill: white;
    width: 100%;
    height: inherit;
    padding-top: ${sideMenuPaddingTop}px;
`;

export const SideMenuListWrapper = styled.div`
    position: absolute;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #1f1f1f;
    overflow: hidden;
    font-size: 11.5px;
    right: 0;
    width: ${sideMenuWidth}px;
`;

export const SideMenuAnnotation = styled.div`
    display: flex;
    align-items: center;
    background-color: ${({ selected, categorySelected }) =>
        categorySelected
            ? '#49526b'
            : selected && annotationStyle.SELECTED_COLOR};
    cursor: pointer;
    transition: background-color 100ms;
    :hover {
        background-color: #313339;
    }
    height: 32px;
`;

export const AnnotationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    margin-top: 0.5rem;
    background-color: ${({ selected }) =>
        selected ? annotationStyle.SELECTED_COLOR : ''};
`;

export const AnnotationColor = styled.div`
    background: ${({ color }) => color};
    width: 4px;
    height: 32px;
`;

export const AnnotationWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32px;
`;

export const EyeIconWrapper = styled.span`
    width: 20px;
    margin-right: 1rem;
    margin-left: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 2.5rem;
`;

export const CollapsableArrowIconContainer = styled.span`
    height: 1.5rem;
    width: 1.5rem;
    margin-inline: 11px;
    cursor: pointer;
`;

export const SideMenuAnnotationName = styled.div`
    vertical-align: top;
    font-family: 'Noto Sans JP', sans-serif;
    cursor: default;
    color: ${({ color }) => color};
    user-select: none;
`;
