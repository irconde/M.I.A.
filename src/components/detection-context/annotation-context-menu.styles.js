import styled from 'styled-components';
import { detectionContextStyle } from '../../utils/enums/Constants';

export const Positioner = styled.div`
    position: absolute;
    top: ${(props) => `${props.position.top}px`};
    left: ${(props) => `${props.position.left}px`};
    z-index: 500;
`;

export const FlexContainer = styled.div`
    display: flex;
    align-items: center;
`;

export const MainWidget = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${detectionContextStyle.HEIGHT}px;
    border-radius: 40px;
    background-color: ${detectionContextStyle.WHITE};
    overflow: hidden;
    box-shadow: 5px 5px 15px 2px rgba(0, 0, 0, 0.41);
    /* make sure when either icon is selected, the color fills to the rounded corners */

    #firstIcon {
        border-top-left-radius: 40px;
        border-bottom-left-radius: 40px;
    }

    #lastIcon {
        border-top-right-radius: 40px;
        border-bottom-right-radius: 40px;
    }
`;

export const IconContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: ${detectionContextStyle.HEIGHT}px;
    cursor: pointer;
    background: ${(props) =>
        props.selected ? detectionContextStyle.SELECTED_COLOR : null};

    &:active {
        background: ${detectionContextStyle.SELECTED_COLOR};
    }

    &:hover {
        background: ${(props) =>
            props.selected
                ? detectionContextStyle.SELECTED_COLOR
                : detectionContextStyle.HOVER_COLOR};
    }
`;
export const DeleteWidget = styled.div`
    height: ${detectionContextStyle.HEIGHT}px;
    width: 30px;
    border-radius: 15px;
    display: flex;
    margin-left: 0.45rem;
    align-items: center;
    justify-content: center;
    background-color: ${detectionContextStyle.WHITE};
    align-self: center;
    cursor: pointer;

    &:hover {
        background: ${detectionContextStyle.HOVER_COLOR};
    }
`;

export const StyledSelectedDetection = styled.div`
    width: 16px;
    height: 16px;
    border: solid 2px #464646;
    background-color: ${(props) => props.selectedDetectionColor};
`;
