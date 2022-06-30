import React from 'react';
import PropTypes from 'prop-types';
import { LabelListWrapper } from './label-list.styles';

/**
 * Component for displaying list of available detection labels.
 * Visible after selecting a detection and selecting `label` from context menu.
 *
 * @component
 */
const LabelList = ({ labels, onLabelSelect }) => {
    /**
     * Passes selected label to callback from `App` component
     * @param {number} i index of selected label name
     */
    const handleClick = (i) => {
        onLabelSelect(labels[i]);
    };
    return (
        <LabelListWrapper>
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
    /**
     * Available detection labels
     */
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    /**
     * Called when label is selected
     */
    onLabelSelect: PropTypes.func.isRequired,
};

export default LabelList;
