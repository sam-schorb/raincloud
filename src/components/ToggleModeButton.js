// ToggleModeButton.js
import React, { useEffect } from 'react';  // Import useEffect
import { useDispatch, useSelector } from 'react-redux';
import { toggleEditMode, selectEditMode } from '../slices/modeSlice';

const ToggleModeButton = () => {
  const dispatch = useDispatch();
  const editMode = useSelector(selectEditMode);

  // Use the useEffect hook to watch for changes in editMode
  useEffect(() => {
    // Log the new mode to the console whenever editMode changes
    console.log(editMode ? 'Edit Mode' : 'Interact Mode');
  }, [editMode]);  // List editMode as a dependency, so the effect runs whenever editMode changes

  return (
    <button className="py-2 px-4 m-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded" 
            onClick={() => dispatch(toggleEditMode())}>
      {editMode ? 'Switch to Interact mode' : 'Switch to Edit Mode'}
    </button>
  );
};

export default ToggleModeButton;
