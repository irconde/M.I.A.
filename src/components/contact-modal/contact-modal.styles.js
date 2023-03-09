import styled from 'styled-components';
import { Button, FormControl } from '@mui/material';
import { colors } from '../../utils/enums/Constants';
import Box from '@mui/material/Box';

export const ContactHeader = styled.div`
    display: flex;
    flex-direction: row;
    padding-block: 3%;
    margin-bottom: 10px;
    align-items: center;
    height: 8%;
    width: 100%;
    position: relative;
`;

export const ContactHeaderInfo = styled.div`
    flex-direction: column;
    font-family: Noto Sans JP;
    margin: 0 10px 10px;
`;

export const ContactHeaderParagraph = styled.div`
    height: 19.5%;
    font-weight: normal;
    font-size: 14px;
    color: ${({ error }) => (error ? 'red' : '#a6a6a6')};
    text-align: justify;
`;

export const ContactTitle = styled.div`
    object-fit: contain;
    font-size: 34px;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #e1e1e1;
    flex: auto;
    align-self: center;
    height: fit-content;

    strong {
        font-weight: 900;
    }
`;

export const SubmitButton = styled(Button)`
    &.MuiButton-root {
        margin: 1%;
        margin-top: 2%;
        width: 10rem;
        height: 3rem;
        background: ${({ $success, $submitting }) =>
            $submitting || $success === null
                ? colors.BLUE
                : $success
                ? colors.GREEN
                : colors.RED};
        color: ${colors.WHITE};

        transition: filter 200ms;
        pointer-events: ${({ $success }) => ($success ? 'none' : 'unset')};

        :hover {
            background: ${({ $success, $submitting }) =>
                $submitting || $success === null
                    ? colors.BLUE
                    : $success
                    ? colors.GREEN
                    : colors.RED};
            filter: brightness(85%);
        }
    }
`;

export const FormContainer = styled(Box)`
    &.MuiBox-root {
        display: flex;
        flex-wrap: wrap;
        justify-content: end;
    }
`;

export const FormFieldShort = styled(FormControl)`
    &.MuiFormControl-root {
        width: 48%;
        padding: 1%;
    }
`;

export const FormFieldFull = styled(FormControl)`
    &.MuiFormControl-root {
        width: 100%;
        padding: 1%;
    }
`;

export const RequiredLabel = styled.p`
    text-align: end;
    padding: 0;
    margin: 0;
    margin-inline: 1%;
    color: #a6a6a6;
    width: 100%;
    font-size: 0.8rem;
`;
