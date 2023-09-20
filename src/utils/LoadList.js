import React from 'react';
import { useDispatch } from 'react-redux';
import { setPatchInfoData } from '../slices/patchInfoSlice';

const LoadList = () => {
    const dispatch = useDispatch();

    React.useEffect(() => {
        const loadPatchInfo = async () => {
            try {
                const response = await fetch('/getPatchInfo');
                if (!response.ok) {
                    throw new Error('Failed to fetch patch info.');
                }

                const patchInfo = await response.json();
                dispatch(setPatchInfoData(patchInfo));  // Dispatching the action to save patchInfo in Redux store
            } catch (error) {
                console.error('Error loading patch info:', error);
            }
        };
        
        loadPatchInfo();
    }, [dispatch]);  // Dependency array now contains dispatch
    
    return null; 
};

export default LoadList;
