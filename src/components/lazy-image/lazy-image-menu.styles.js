// import styled from 'styled-components';
// import React, { useEffect, useState } from 'react';
// import * as constants from '../../utils/Constants';
// import Utils from '../../utils/Utils';
// import {
//     getCollapsedLazyMenu,
//     getLocalFileOpen,
//     setGeneratingThumbnails,
// } from '../../redux/slices/ui/uiSlice';
// import { useDispatch, useSelector } from 'react-redux';








// const collapsedLazyMenu = useSelector(getCollapsedLazyMenu);

// const sideMenuWidth = 256 + constants.RESOLUTION_UNIT;
// const [translateStyle, setTranslateStyle] = useState({
//     transform: `translate(0)`,
// });
// const svgContainerStyle = {
//     float: 'left',
//     display: 'flex',
//     alignItems: 'center',
//     marginRight: '10px',
// };
// const svgStyle = {
//     height: '24px',
//     width: '24px',
//     color: '#ffffff',
// };
// const prevIsMenuCollapsed = Utils.usePrevious(collapsedLazyMenu);
// useEffect(() => {
//     if (prevIsMenuCollapsed !== collapsedLazyMenu) {
//         if (collapsedLazyMenu === true) {
//             setTranslateStyle({
//                 transform: `translate(${-Math.abs(256 + 10)}px)`,
//             });
//         } else {
//             setTranslateStyle({
//                 transform: `translate(0)`,
//             });
//         }
//     }
// });

// export const LazyImgMenuContainer = styled.div`
//     translate: ${translateStyle},
// `;

//export
