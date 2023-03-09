import {
    TitleContent,
    GrainIconContainer,
    LinearProgressMUI,
    LoaderContainer,
    ModalContent,
    Processing,
    RightPolygon,
    SavingModalBG,
    SavingModalContainer,
    SplitBGContainer,
    Title,
    ProcessingContainer,
} from '../saving-modal/saving-modal.styles';
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
                            {'INSERT_FILE_NAME_HERE'}
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
