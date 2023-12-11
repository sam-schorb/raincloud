import React from 'react';
import { useSelector } from 'react-redux';
import { selectPatchNumber } from '../slices/patchInfoSlice';
import { selectEditMode } from '../slices/modeSlice';
import ToggleModeButton from './ToggleModeButton';
import NumColumnsDropdown from './NumColumnsDropdown';

// EditPatchTitleButtons: Provides UI for editing patch title and related settings.
function EditPatchTitleButtons({ onSave, onCancel }) {
    // Retrieving the current patch number and edit mode status from Redux store.
    const patchNumber = useSelector(selectPatchNumber);
    const isEditMode = useSelector(selectEditMode);

    // Return null if no patch number is selected.
    if (!patchNumber) return null;

    // Determine background color based on the edit mode status.
    const bgColor = isEditMode ? 'bg-medium-gray' : 'bg-dark-gray';

    return (
        <div className={`w-full h-16 ${bgColor} shadow-md transition-transform transform duration-500 z-10`}>
            <div className="flex items-center justify-between h-full px-2 sm:px-4 sm:justify-start sm:relative md:ml-5">
                <div className="flex items-center justify-between w-full sm:space-x-4 sm:w-auto">
                    {/* Dropdown for selecting the number of columns in the UI */}
                    <NumColumnsDropdown />

                    {/* Button to toggle between edit and view modes */}
                    <ToggleModeButton />

                    {/* Buttons for saving and canceling the edit operation */}
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
