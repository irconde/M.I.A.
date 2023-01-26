import React from 'react';
import PropTypes from 'prop-types';
import { StyledChatIcon } from './chat.icon.styles';

const ChatIcon = (props) => {
    return (
        <StyledChatIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};
ChatIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
export default ChatIcon;
