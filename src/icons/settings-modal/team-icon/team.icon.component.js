import React from 'react';
import PropTypes from 'prop-types';
import { StyledTeamIcon } from './team.icon.styles';

const TeamIcon = (props) => {
    return (
        <StyledTeamIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

TeamIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default TeamIcon;
