// ToggleLabelButton.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setShowLabel, selectShowLabel } from '../slices/layoutSlice';

const ToggleLabelButton = () => {
  const dispatch = useDispatch();
  const showLabel = useSelector(selectShowLabel);

  const toggleLabel = () => {
    dispatch(setShowLabel(!showLabel));
  };

  return (
    <button className="py-2 px-4 m-4 border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded" 
            onClick={toggleLabel}>
      {showLabel ? 'Hide Labels' : 'Show Labels'}
    </button>
  );
};

export default ToggleLabelButton;
