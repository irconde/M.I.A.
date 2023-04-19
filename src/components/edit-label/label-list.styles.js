import styled from 'styled-components';
import * as constants from '../../utils/enums/Constants';

export const LabelListWrapper = styled.div`
    /* base container styles */
    max-height: 120px;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
    background: ${constants.colors.WHITE};
    box-shadow: 5px 5px 15px 2px rgba(0, 0, 0, 0.41);
    width: 100%;
    position: absolute;
    top: 100%;

    /* container scrollbar styles */

    ::-webkit-scrollbar {
        background-color: white;
        width: 9px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #909090;
        width: 9px;
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(144, 144, 144, 0.95);
    }

    ::-webkit-scrollbar-button {
        width: 0;
        height: 0;
        display: none;
    }
`;

export const LabelList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    color: #464646;

    /* styles for list elements */

    li {
        padding-left: 10px;
        height: 24px;
        display: flex;
        align-items: center;
        font-family: Noto Sans JP, sans-serif;
        font-size: 13px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        text-align: justify;
        color: #464646;
        margin-right: 3px;
    }

    & > *:hover {
        background-color: #dedede;
    }
`;

export const LabelListItem = styled.li`
    cursor: pointer;
`;
