import styled from 'styled-components';
import { createTheme, Paper } from '@mui/material';
import { colors } from '../../utils/enums/Constants';

const GREY_COLOR = '#9d9d9d';

export const modalTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#5e97ff',
            main: '#367eff',
            dark: '#2558b2',
            contrastText: '#9d9d9d',
        },
        secondary: {
            light: '#ffffff',
            main: '#fafafa',
            dark: '#9d9d9d',
            contrastText: '#000000',
        },
        error: {
            main: colors.RED,
        },
    },
    zIndex: {
        modal: 3,
    },
    transitions: {
        duration: {
            shortest: 150,
            shorter: 200,
            // most basic recommended timing
            standard: 300,
            // this is to be used in complex animations
            complex: 375,
            // recommended when something is entering screen
            enteringScreen: 225,
            // recommended when something is leaving screen
            leavingScreen: 195,
        },
    },
});

export const StyledPaper = styled(Paper).attrs(() => ({
    elevation: 3,
}))`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #1f1f1f;
    outline: none;
    font-family: Noto Sans JP;
    width: 534px;
    height: 560px;
`;

export const ModalRoot = styled.div`
    flex-grow: 1;
    height: fit-content;
`;

export const Description = styled.p`
    color: ${GREY_COLOR};
    font-size: 12px;
    margin: 0;
    margin-bottom: 2rem;
`;

// ---------------- ABOUT TAB -----------------

export const AboutHeader = styled.div`
    display: flex;
    flex-direction: row;
    padding: 40px 40px 0;
    margin-bottom: 10px;
    align-items: center;
    justify-content: space-between;
    height: 14%;
`;

export const CloseIconWrapper = styled.div`
    align-self: flex-start;
    display: flex;
    align-items: center;
    justify-content: center;

    :hover {
        cursor: pointer;
    }
`;

export const AppSummary = styled.div`
    width: 454px;
    height: 194px;
    margin: 0 40px;
    font-family: NotoSansJP, sans-serif;
    font-size: 13px;
    font-weight: 300;
    font-stretch: normal;
    font-style: normal;
    line-height: 2.15;
    letter-spacing: normal;
    color: #d5d5d5;

    :nth-child(2) {
        margin-top: 33px;
    }

    strong {
        font-weight: bold;
        color: #ffffff;
    }
`;

export const TeamAndLibrary = styled.div`
    display: flex;
    justify-content: space-between;
    color: #e1e1e1;
    margin: calc(32px - 1em) 40px;
    font-size: 14px;
`;

export const TeamLibraryHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: start;
    border-bottom: solid 1px #4e4e4e;
    padding-bottom: 9px;
`;

export const TeamLibraryTitle = styled.div`
    color: #e1e1e1;
    margin-left: 5px;
    padding-left: 0.5rem;
`;

export const TeamLibraryWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

export const TeamLibraryList = styled.div`
    width: 182px;
    height: 118px;
    margin: 13px 18px 1px 0;
    font-family: NotoSansJP, sans-serif;
    font-size: 13px;
    font-weight: 300;
    font-stretch: normal;
    font-style: normal;
    line-height: 2;
    letter-spacing: normal;
    color: #a6a6a6;

    ul {
        padding-inline-start: 20px;
    }

    a {
        color: #a6a6a6;

        :hover {
            color: #727272;
        }
    }
`;
