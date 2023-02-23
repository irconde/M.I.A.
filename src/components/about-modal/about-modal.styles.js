import styled from 'styled-components';
import { createTheme, Paper } from '@mui/material';

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
    width: 45vw;
    min-width: 32rem;
    max-width: 40rem;
    padding: 2rem;
`;

export const ModalRoot = styled.div`
    flex-grow: 1;
    height: 37rem;
`;

// export const Title = styled.p`
//     font-family: Noto Sans JP;
//     font-size: 1rem;
//     font-weight: normal;
//     font-stretch: normal;
//     font-style: normal;
//     line-height: normal;
//     letter-spacing: normal;
//     color: #fff;
//     margin-bottom: 0.25rem;
//     margin-top: 0.75rem;
// `;

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
    padding: 20px;
    margin-bottom: 10px;
    align-items: center;
    justify-content: space-between;
    height: 14%;
`;

// export const AboutHeaderInfo = styled.div`
//     flex-direction: column;
//     font-family: Noto Sans JP;
//     margin: 0 10px 10px;
// `;
//
// export const VersionInfo = styled.div`
//     font-size: 15px;
//     color: #7e7e7e;
// `;
//
// export const AboutTitle = styled.div`
//     object-fit: contain;
//     font-size: 42px;
//     font-weight: 400;
//     font-stretch: normal;
//     font-style: normal;
//     line-height: normal;
//     letter-spacing: normal;
//     color: #e1e1e1;
//     flex: auto;
//     align-self: center;
//     height: fit-content;
//
//     strong {
//         font-weight: 900;
//     }
// `;

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
    height: 19.5%;
    font-weight: normal;
    font-size: 14px;
    color: #a6a6a6;
    text-align: justify;
    margin: 0 10px;

    strong {
        font-weight: 600;
        color: #d5d5d5;
    }
`;

export const SummaryDivider = styled.div`
    height: 1rem;
    width: 100%;
`;

export const TeamAndLibrary = styled.div`
    height: 57%;
    display: flex;
    color: #e1e1e1;
    margin: 1rem;
    font-size: 20px;
`;

export const TeamLibraryHeader = styled.div`
    height: 14%;
    display: flex;
    align-items: center;
    justify-content: start;
    border-bottom: solid 1px #a6a6a6;
    padding: 0 15px 5px 10px;
`;

export const TeamLibraryTitle = styled.div`
    color: #e1e1e1;
    margin-left: 5px;
    font-size: 18px;
`;

export const TeamLibraryWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

export const TeamLibraryList = styled.div`
    display: flex;
    justify-content: start;
    align-items: center;
    color: #a6a6a6;
    font-size: 16px;
    width: 15rem;

    ul {
        list-style-position: inside;
        padding: 0;
    }

    a {
        color: #a6a6a6;

        :hover {
            color: #727272;
        }
    }
`;
