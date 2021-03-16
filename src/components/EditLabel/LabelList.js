import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as constants from '../../Constants';

const LabelListWrapper = styled.div`
    /* base container styles */
    height: 80px;
    width: ${(props) => props.width};
    padding: 0.5rem;
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

/**
 * Displays list of available detection labels.
 * Visible after selecting a detection and selecting `label` from context menu.
 * @param {string} width Width in px of label
 * @param {Array<String>} labels Available detection labels
 * @param {function} onLabelSelect Called when label is selected
 */
const LabelList = ({ width, labels, onLabelSelect }) => {
    /**
     * Passes selected label to callback from `App` component
     * @param {number} i index of selected label name
     */
    const handleClick = (i) => {
        onLabelSelect(labels[i]);
    };
    return (
        <LabelListWrapper width={width}>
            <ul className="labels">
                {labels &&
                    labels.map((label, i) => {
                        return (
                            <li key={i} onClick={() => handleClick(i)}>
                                <span>{label}</span>
                                {i !== labels.length - 1 && (
                                    <div className="divider" />
                                )}
                            </li>
                        );
                    })}
            </ul>
        </LabelListWrapper>
    );
};

LabelList.propTypes = {
    width: PropTypes.string,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    onLabelSelect: PropTypes.func.isRequired,
};

export default LabelList;
