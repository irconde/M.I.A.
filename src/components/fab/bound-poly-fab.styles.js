import styled from 'styled-components';

export const FABContainer = styled.div`
    position: absolute;
    left: ${(props) => props.leftPX};
    bottom: 5%;
    padding: 0.7rem 1.25rem;
    background-color: #313131;
    color: #fff;
    border: 1px solid #414141;
    border-radius: 60px;
    display: ${(props) => (props.show ? 'flex' : 'none')};
    box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);
    opacity: ${(props) => (props.fabOpacity ? '100%' : '28%')};
    animation: fadein ${(props) => (props.fabOpacity ? '2s' : '0.75s')}; /* fade component in so cornerstone can load */
    pointer-events: ${(props) => (props.fabOpacity ? 'auto' : 'none')};
    right: 0;
    width: max-content;
    margin-left: auto;
    margin-right: auto;
    -webkit-transition: all 0.3s ease-in;
    -moz-transition: all 0.3s ease-in;
    -o-transition: all 0.3s ease-in;
    -ms-transition: all 0.3s ease-in;
    transition: all 0.3s ease-in;
    font-family: Noto Sans JP;

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: ${(props) => (props.fabOpacity ? '1' : '0.28')};
        }
    }

    &:hover {
        cursor: pointer;
    }
`;

export const FABoption = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const FabIconWrapper = styled.div`
    margin-right: 0.5rem;
    display: flex;
    cursor: pointer;
`;

export const FABdivider = styled.div`
    height: 1.5rem;
    border-left: 1px solid #575757;
    margin-left: 1rem;
    margin-right: 1rem;
`;
