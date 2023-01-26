import styled from 'styled-components';

export const ContactHeader = styled.div`
    display: flex;
    flex-direction: row;
    padding-block: 3%;
    margin-bottom: 10px;
    align-items: center;
    height: 8%;
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
    color: #a6a6a6;
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
