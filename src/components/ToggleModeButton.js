// ToggleModeButton.js
import React, { useEffect } from 'react';  // Import useEffect
import { useDispatch, useSelector } from 'react-redux';
import { toggleEditMode, selectEditMode } from '../slices/modeSlice';

const ToggleModeButton = () => {
  const dispatch = useDispatch();
  const editMode = useSelector(selectEditMode);

  useEffect(() => {
    console.log(editMode ? 'Edit Mode' : 'Interact Mode');
  }, [editMode]);

  return (
    <button className="py-2 px-4 m-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded" 
            onClick={() => dispatch(toggleEditMode())}>
      <span className="sm:hidden">{editMode ? 'Edit' : 'Interact'}</span>
      <span className="hidden sm:inline">{editMode ? 'Switch to Interact mode' : 'Switch to Edit Mode'}</span>
    </button>
  );
};

export default ToggleModeButton;

