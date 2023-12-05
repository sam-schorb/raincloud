import React from 'react';
import { useSelector } from 'react-redux';
import { selectPatchNumber } from '../slices/patchInfoSlice';
import { selectEditMode } from '../slices/modeSlice';
import ToggleModeButton from './ToggleModeButton';
import NumColumnsDropdown from './NumColumnsDropdown';

function EditPatchTitleButtons({ onSave, onCancel }) {
    const patchNumber = useSelector(selectPatchNumber);
    const isEditMode = useSelector(selectEditMode);

    if (!patchNumber) return null;

    const bgColor = isEditMode ? 'bg-medium-gray' : 'bg-dark-gray';

    return (
        <div className={`w-full h-16 ${bgColor} shadow-md transition-transform transform duration-500 z-10`}>
            {/* Responsive layout: default for medium and larger screens, evenly spaced on small screens */}
            <div className="flex items-center justify-between h-full px-2 sm:px-4 sm:justify-start sm:relative md:ml-5">
                {/* Evenly spaced for small screens, original layout for medium and larger screens */}
                <div className="flex items-center justify-between w-full sm:space-x-4 sm:w-auto">
                    <NumColumnsDropdown />
                    <ToggleModeButton />
                    <button 
                        className="py-2 px-2 sm:px-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded" 
                        onClick={onSave}>Save</button>
                    <button 
                        className="py-2 px-2 sm:px-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded" 
                        onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default EditPatchTitleButtons;
