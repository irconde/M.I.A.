import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectConnectionInfo,
    selectNumFilesInQueue,
    setConnected,
    commandServer,
    connectCommandServer,
    disconnectCommandServer,
    fileServer,
    setNumFilesInQueue,
    connectFileServer,
    disconnectFileServer,
} from '../redux/slices/serverSlice';

const ReduxTest = () => {
    const connectionInfo = useSelector(selectConnectionInfo);
    const numFilesInQueue = useSelector(selectNumFilesInQueue);
    const dispatch = useDispatch();

    // Component mount / unmount
    useEffect(() => {
        dispatch(connectCommandServer());
        dispatch(connectFileServer());

        // return function for cleanup after unmount
        return () => {
            dispatch(disconnectCommandServer());
            dispatch(disconnectFileServer());
        };
    }, []);

    useEffect(() => {
        commandServer.on('img', () => {
            console.log('img received');
        });
        fileServer.on('numberOfFiles', (num) => {
            dispatch(setNumFilesInQueue(num));
        });
    });
    return (
        <>
            <h1>{connectionInfo.isConnected ? 'CONNECTED' : 'DISCONNECTED'}</h1>
            <h1>{numFilesInQueue} files in Queue</h1>
            <button onClick={() => dispatch(disconnectCommandServer())}>
                disconnect
            </button>
        </>
    );
};

export default ReduxTest;
