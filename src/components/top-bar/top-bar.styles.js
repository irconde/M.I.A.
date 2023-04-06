import styled from 'styled-components';
import { LAZY_SIDE_MENU_WIDTH } from '../lazy-image/lazy-image-menu.styles';

export const TopBarContainer = styled.div`
    position: absolute;
    display: flex;
    height: 3.375rem;
    background-color: #3a3a3a;
    top: 0;
    width: 100%;
    z-index: 2;
    align-items: center;
    justify-content: flex-end;
    color: white;
    box-shadow: 0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5);
    font-family: 'Noto Sans JP', sans-serif;
    white-space: nowrap;
`;

export const TitleLabelContainer = styled.div`
    position: absolute;
    display: flex;
    height: 3.375rem;
    background-color: #3a3a3a;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 1;
    align-items: center;
    color: white;
    justify-content: center;
    font-weight: 50;
    font-size: 10pt;
    box-shadow: 0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5);
`;

export const ConnectionStatusIconsContainer = styled.div`
    position: absolute;
    display: flex;
    height: 3.375rem;
    left: 0;
    top: 0;
    width: 35%;
    z-index: 1;
    margin-left: 65%;
    align-items: center;
    justify-content: flex-end;
    color: white;
    gap: 1rem;
    cursor: pointer;
`;

export const ConnectionTypeInfo = styled.div`
    color: #c3c3c3;
`;

export const InfoDivider = styled.div`
    color: #6a6a6a;
    font-weight: bold;
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
    float: left;
    left: 0;
    background-color: #484848;
    width: ${LAZY_SIDE_MENU_WIDTH};
`;

export const ImportDataText = styled.div`
    margin-right: 0.75rem;
    margin-left: 1rem;
    font-weight: 500;
    font-size: medium;
`;

export const FragmentWrapper = styled.div`
    display: flex;
    align-items: end;
    gap: 32px;
`;

export const TopBarIconWrapper = styled(FragmentWrapper)``;
export const ImportIconWrapper = styled.div`
    margin-right: 1rem;
    margin-left: 0;
    display: inherit;
`;

export const MenuIconWrapper = styled.div`
    margin: 0.5rem 1.5rem 0.5rem -0.5rem;
    cursor: pointer;
`;

export const TopBarCogIconWrapper = styled.div`
    width: fit-content;
    height: fit-content;
    display: flex;
    margin: auto 0.75rem;
    cursor: pointer;
`;

export const InfoWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
`;
