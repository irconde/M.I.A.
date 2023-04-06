import styled from 'styled-components';
import { LAZY_SIDE_MENU_WIDTH } from '../lazy-image/lazy-image-menu.styles';

export const TopBarContainer = styled.div`
    position: absolute;
    display: flex;
    height: 3.375rem;
    background-color: #3a3a3a;
    top: 0;
    width: 100vw;
    z-index: 2;
    align-items: center;
    color: white;
    box-shadow: 0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5);
    font-family: 'Noto Sans JP', sans-serif;
    white-space: nowrap;
`;

export const IconsContainer = styled.div`
    display: flex;
    height: 3.375rem;
    align-items: center;
    color: white;
    cursor: pointer;
    position: absolute;
    right: 0;
    margin-right: 16px;
`;

export const FragmentWrapper = styled.div`
    position: absolute;
    left: calc(${LAZY_SIDE_MENU_WIDTH} + 221px);
    display: flex;
    align-items: end;
    gap: 32px;
    font-size: 15px;
`;

export const ContactIconsContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
    padding: 0 19px;
`;

export const ConnectionTypeInfo = styled.div`
    color: #c3c3c3;
    line-height: 20px;
`;

export const VerticalDivider = styled.div`
    border: 1px solid #5b5b5b;
    height: 17px;
`;

export const ImportDataContainer = styled.div`
    cursor: pointer;
    display: flex;
    height: inherit;
    align-items: center;
    justify-content: center;
    position: fixed;
    background-color: #484848;
    width: ${LAZY_SIDE_MENU_WIDTH};
`;

export const ImportDataText = styled.div`
    margin-right: 0.75rem;
    margin-left: 1rem;
    font-weight: 500;
    font-size: medium;
`;

export const TopBarIconWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;
export const ImportIconWrapper = styled.div`
    margin-right: 1rem;
    margin-left: 0;
    display: inherit;
`;

export const InfoWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
`;
