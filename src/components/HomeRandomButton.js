import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHome, FaDice } from 'react-icons/fa';
import { setPatchNumber, selectPatchInfoData } from '../slices/patchInfoSlice';

const HomeRandomButton = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const patchInfoData = useSelector(selectPatchInfoData);

    const selectRandomPatch = () => {
        if (patchInfoData.length > 0) {
            const randomPatch = patchInfoData[Math.floor(Math.random() * patchInfoData.length)];
            dispatch(setPatchNumber(randomPatch._id));
            console.log('Selected random patchId:', randomPatch._id);
        } else {
            console.error("No patches available for random selection.");
        }
    };

    return location.pathname === '/' ? (
        <button 
            className="text-medium-gray hover:text-white p-2 flex justify-center items-center transition-colors duration-300"
            onClick={selectRandomPatch}
        >
            <FaDice className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Random</span>
        </button>
    ) : (
        <Link to="/" className="text-medium-gray hover:text-white p-2 flex justify-center items-center transition-colors duration-300">
            <FaHome className="text-icon-lg sm:text-icon-lg md:text-base lg:text-base mr-3 md:mr-5" /><span className="hidden md:inline-block">Home</span>
        </Link>
    );
}

export default HomeRandomButton;
