import styled from 'styled-components';
import * as constants from '../../utils/Constants';

export const LabelListWrapper = styled.div`
    /* base container styles */
    padding: 0.5rem;
    max-height: 50px;
    overflow-x: hidden;
    overflow-y: scroll;
    background: ${constants.colors.WHITE};
    border-radius: 4px;
    box-shadow: 5px 5px 15px 2px rgba(0, 0, 0, 0.41);

    /* container scrollbar styles */
    ::-webkit-scrollbar {
        width: 15px;
        height: 18px;
    }
    ::-webkit-scrollbar-thumb {
        height: 45px;
        border: 4px solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
        border-radius: 7px;
        background-color: rgba(0, 0, 0, 0.15);
        box-shadow: inset -1px -1px 0px rgba(0, 0, 0, 0.05),
            inset 1px 1px 0px rgba(0, 0, 0, 0.05);
    }
    ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.25);
    }
    ::-webkit-scrollbar-button {
        width: 0;
        height: 0;
        display: none;
    }

    /* label list */
    .labels {
        list-style: none;
        padding: 0;
        margin: 0;
        text-transform: uppercase;
        color: ${constants.colors.BLUE};

        li {
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
        }
        .divider {
            border-bottom: 1px solid #e8e8e8;
        }

        & > *:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
    }
`;