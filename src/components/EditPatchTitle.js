// EditPatchTitle.js
import React from 'react';
import { useSelector } from 'react-redux';
import { selectPatchNumber, selectPatchInfoData } from '../slices/patchInfoSlice';
import { selectEditMode } from '../slices/modeSlice'; // Importing the mode selector
import ToggleModeButton from './ToggleModeButton';
import ToggleLabelButton from './ToggleLabelButton'; // Import the new component
import NumColumnsDropdown from './NumColumnsDropdown'; // Import the new component

function EditPatchTitle({ onSave, onCancel }) {
    const allPatchInfo = useSelector(selectPatchInfoData);
    const patchNumber = useSelector(selectPatchNumber);
    const isEditMode = useSelector(selectEditMode); // Get the current mode

    if (!patchNumber) return null;

    const patchInfo = allPatchInfo.find(patch => patch._id === patchNumber) || {};
    const isPlaybarVisible = document.body.classList.contains('playbar-visible');
    const bgColor = isEditMode ? 'bg-medium-gray' : 'bg-dark-gray'; // Determine background color based on mode

    return (
        <div className={`w-full h-16 ${bgColor} shadow-md transition-transform transform translate-y-[-1.25rem] duration-500 ${isPlaybarVisible ? 'pb-5' : ''}`}>
            <div className="relative flex items-center justify-between h-full px-4">
                {/* Mode Label */}
                <div style={{ width: 'max-content' }}>
                    <span className="text-custom-gray ml-5 text-2xl">{isEditMode ? 'Edit Mode' : 'Interact Mode'}</span>
                </div>
                {/* Center: Patch title and user - Absolutely centered */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                    <div className="text-center">
                        <div className="text-custom-gray text-xl">{patchInfo.name}</div>
                        <div className="text-custom-gray text-md">{patchInfo.username}</div>
                    </div>
                </div>
                {/* Buttons and Dropdowns */}

                <div className="flex items-center space-x-4">
                <NumColumnsDropdown />
                <ToggleLabelButton />
                    <ToggleModeButton />
                    <button 
                        className="py-2 px-4 m-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded" 
                        onClick={onSave}>Save</button>
                    <button 
                        className="py-2 px-4 m-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded" 
                        onClick={onCancel}>Cancel</button>
                    {/* Inserted components */}

                </div>
            </div>
        </div>
    );
}

export default EditPatchTitle;
