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
import { getCurrFileName } from '../../redux/slices/ui.slice';
import { useSelector } from 'react-redux';

function SavingModal() {
    // TODO: Refactor to save all changed files to new annotation file, not just currentFile.
    const currentFile = useSelector(getCurrFileName);

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
                            <div>{currentFile}</div>
                            {/*    26 character limit    */}
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
