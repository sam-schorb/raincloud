import React from 'react';
import { useDispatch, useSelector } from 'react-redux';  // We also import useSelector
import { setPatchNumber, selectPatchInfoData } from '../slices/patchInfoSlice';

const RandomButton = () => {
    const dispatch = useDispatch();
    const patchInfoData = useSelector(selectPatchInfoData);  // Use the selector to get all patch data

    const selectRandomPatchId = () => {
        // Ensure that we have data and select a random patch from it
        if (patchInfoData.length > 0) {
            const randomPatch = patchInfoData[Math.floor(Math.random() * patchInfoData.length)];
            dispatch(setPatchNumber(randomPatch._id));
            console.log('Selected random patchId:', randomPatch._id);
        } else {
            console.error("No patches available for random selection.");
        }
    }

    return (
        <button 
            className="py-2 px-4 m-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded" 
            onClick={selectRandomPatchId}>Random
        </button>
    );
};

export default RandomButton;
