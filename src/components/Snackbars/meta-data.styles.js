import styled from 'styled-components';

export const InlineSlash = styled.p`
    font-family: Noto Sans JP Black;
    color: #367fff;
    display: inline-block;
`;
export const MetaDataText = styled.span`
    font-family: Noto Sans JP;
`;
export const MetaDataGroup = styled.p`
    margin: 0.6rem 0.6rem 0.6rem 0.6rem;
    display: inline-block;
    font-size: 14;
    color: white;
`;
export const StyledMetaData = styled.div`
    padding-inline: 1rem;
    position: fixed;
    top: 5rem;
    // Width of screen - side menu width / 2
    left: 50%;
    transform: ${(props) =>
        props.sideMenuCollapsed === true
            ? 'translate(-50%)'
            : 'translate(-68%)'};
    background-color: rgba(38, 38, 38, 0.5);
    border-radius: 2rem;
    text-align: left;
    color: #ffffff;
    width: max-content;
`;
