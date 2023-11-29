// NumColumnsDropdown.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNumColumns, setDropdownNumColumns, selectDropdownNumColumns } from '../slices/layoutSlice';

const NumColumnsDropdown = () => {
  const dispatch = useDispatch();
  const numColumns = useSelector(selectNumColumns); // The value from the server
  const dropdownValue = useSelector(selectDropdownNumColumns); // The value from the dropdown
  const [localDropdownValue, setLocalDropdownValue] = useState(dropdownValue || numColumns);

  useEffect(() => {
    // Only update the local state to match Redux state on initial mount
    setLocalDropdownValue(dropdownValue || numColumns);
  }, [numColumns, dropdownValue]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setLocalDropdownValue(newValue); // Update local state
    dispatch(setDropdownNumColumns(newValue)); // Update Redux state
  };

  return (
    <div className="flex items-center">
      <label htmlFor="numColumns" className="mr-2">Number of Columns: </label>
      <div className="relative">
        <select
          id="numColumns"
          onChange={handleChange}
          value={localDropdownValue} // Use local state for the select value
          className="py-2 px-4 m-4 overflow-y-scroll border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded"
          size="1"
        >
          {[...Array(30).keys()].map((number) => (
            <option key={number + 1} value={number + 1}>{number + 1}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NumColumnsDropdown;
