import styled from 'styled-components';
import * as constants from '../../utils/Constants';

export const EditLabelWrapper = styled.div`
    position: absolute;
    width: ${(props) => `${props.width}px`};
    min-width: 120px;
    z-index: 500;
    left: ${(props) => `${props.left - props.positionDiff}px`};
    top: ${(props) => `${props.top}px`};
    background: ${constants.colors.BLUE};

    .inputContainer {
        display: flex;
        justify-content: space-between;

        .newLabelInput {
            background-color: transparent;
            font-family: 'Arial';
            font-weight: '600px';
            font-size: ${(props) => `${props.fontSize}px`};
            height: ${(props) => `${props.heightDiff}px`};
            color: ${constants.colors.WHITE};
            border: none;
            border-radius: 4px;
            user-select: none;
            width: 100%;
            &:disabled {
                background-color: rgba(0, 0, 0, 0.35);
            }
            &:focus {
                border-color: ${constants.colors.BLUE};
                outline: 0;
                box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
                    0 0 8px rgba(102, 175, 233, 0.6);
            }
            &::placeholder {
                color: ${constants.colors.WHITE};
            }
        }
    }
`;