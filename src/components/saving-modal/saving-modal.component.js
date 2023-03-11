import {
    GrainIconContainer,
    LinearProgressMUI,
    LoaderContainer,
    ModalContent,
    Processing,
    ProcessingContainer,
    RightPolygon,
    SavingModalBG,
    SavingModalContainer,
    SplitBGContainer,
    Title,
    TitleContent,
} from './saving-modal.styles';
import React from 'react';
import GrainIcon from '../../icons/grain-icon/grain.icon';

function SavingModal() {
    return (
        <SavingModalBG>
            <SavingModalContainer>
                <SplitBGContainer>
                    <ModalContent>
                        <TitleContent>
                            <GrainIconContainer>
                                <GrainIcon
                                    width={'44px'}
                                    height={'44px'}
                                    color={'#d8d8d8'}
                                />
                            </GrainIconContainer>
                            <Title>SAVING ANNOTATIONS TO NEW FILE</Title>
                        </TitleContent>
                        <ProcessingContainer>
                            <Processing>Processing</Processing>
                        </ProcessingContainer>
                    </ModalContent>
                    <RightPolygon />
                </SplitBGContainer>
                <LoaderContainer>
                    <LinearProgressMUI />
                </LoaderContainer>
            </SavingModalContainer>
        </SavingModalBG>
    );
}

export default SavingModal;
