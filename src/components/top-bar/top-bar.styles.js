import styled from 'styled-components';

export const TopBarContainer = styled.div`
    position: absolute;
    display: flex;
    height: 3.375rem;
    background-color: #3a3a3a;
    top: 0;
    width: 100%;
    z-index: 1;
    align-items: center;
    justify-content: flex-end;
    color: white;
    box-shadow: 0.1rem 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5);
`;

export const LazyMenuToggleContainer = styled.div`
    position: absolute;
    z-index: 2;
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
    height: 50%;
`;

export const OpenFileContainer = styled.div`
    cursor: pointer;
    display: flex;
    height: inherit;
    align-items: center;
    position: fixed;
    float: left;
    left: 0;
`;

export const OpenFileText = styled.div`
    margin-right: 1.5rem;
    font-weight: 400;
    font-size: medium;
`;

export const FragmentWrapper = styled.div`
    display: flex;
`;

export const TopBarIconWrapper = styled(FragmentWrapper)`
    margin: 0.75rem;
`;
