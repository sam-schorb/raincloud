import React from 'react';
import { useSelector } from 'react-redux';
import { selectPatchNumber, selectPatchInfoData } from '../slices/patchInfoSlice';

function PatchTitle() {
    const allPatchInfo = useSelector(selectPatchInfoData);
    const patchNumber = useSelector(selectPatchNumber);

    if (!patchNumber) return null;

    const patchInfo = allPatchInfo.find(patch => patch._id === patchNumber) || {};

    // Check if the playbarvisible class is present in the body and set the variable accordingly
    const isPlaybarVisible = document.body.classList.contains('playbar-visible');
    return (
        <div className={`w-full h-16 bg-medium-gray shadow-md transition-transform transform translate-y-[-1.25rem] duration-500 ${isPlaybarVisible ? 'pb-5' : ''}`}>
            <div className="flex items-center justify-center h-full">
                {/* Center: Patch title and user */}
                <div className="text-center">
                    <div className="text-custom-gray text-xl">{patchInfo.name}</div>
                    <div className="text-custom-gray text-md">{patchInfo.username}</div>
                </div>
            </div>
        </div>
    );
    
}

export default PatchTitle;


