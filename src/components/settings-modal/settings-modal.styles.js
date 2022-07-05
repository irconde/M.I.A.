import styled from 'styled-components';
import { Divider, Paper } from '@mui/material';

const GREY_COLOR = '#9d9d9d';
const WHITE_COLOR = 'white';

export const StyledPaper = styled(Paper).attrs((props) => ({
    elevation: 3,
}))`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #1f1f1f;
    outline: none;
    font-family: Noto Sans JP;
    width: 30vw;
    min-width: 32rem;
    max-width: 40rem;
    padding: 2rem;
`;

export const ModalRoot = styled.div`
    flex-grow: 1;
    height: 37rem;
`;

export const SettingsHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 1rem 0;
`;
export const SettingsCogwheel = styled.div`
    margin-right: 1rem;
    margin-left: 0;
    width: 20px;
    height: 20px;
    align-self: center;
`;
export const SettingsTitle = styled.div`
    object-fit: contain;
    font-family: Noto Sans JP;
    font-size: 22px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #fff;
    flex: auto;
    align-self: center;
`;
export const CloseIconWrapper = styled.div`
    align-self: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
`;
export const StyledDivider = styled(Divider).attrs(() => ({
    variant: 'middle',
}))`
    margin: auto;
`;
export const ScrollableContainer = styled.div`
    overflow-y: auto;
    height: 80%;
    padding: 0rem 0.25rem;
`;
export const SettingOptionTitle = styled.p`
    font-family: Noto Sans JP;
    font-size: 1rem;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #fff;
    margin-bottom: 0.25rem;
    margin-top: 0.75rem;
`;
export const SettingDescription = styled.p`
    color: ${GREY_COLOR};
    font-size: 12px;
    margin: 0;
    margin-bottom: 2rem;
`;
export const VisualizationModeContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 3.5rem;
    margin-bottom: 1rem;
`;
export const VisualizationModeLabel = styled.p`
    margin: 0.2rem 0;
    text-align: center;
    color: ${(props) => (props.selected ? WHITE_COLOR : GREY_COLOR)};
    font-size: 0.7rem;
`;
