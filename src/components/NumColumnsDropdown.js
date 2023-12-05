import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNumColumns, setDropdownNumColumns, selectDropdownNumColumns } from '../slices/layoutSlice';

const NumColumnsDropdown = () => {
  const dispatch = useDispatch();
  const numColumns = useSelector(selectNumColumns);
  const dropdownValue = useSelector(selectDropdownNumColumns);
  const [localDropdownValue, setLocalDropdownValue] = useState(dropdownValue || numColumns);

  useEffect(() => {
    setLocalDropdownValue(dropdownValue || numColumns);
  }, [numColumns, dropdownValue]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setLocalDropdownValue(newValue);
    dispatch(setDropdownNumColumns(newValue));
  };

  return (
    <div className="flex items-center">
      <label htmlFor="numColumns" className="mr-2 text-lg hidden sm:inline text-white">Columns:</label>
      <div className="relative">
        <select
          id="numColumns"
          onChange={handleChange}
          value={localDropdownValue}
          className="py-2 px-2 m-2 overflow-y-scroll border-2 border-medium-gray bg-true-gray hover:bg-light-gray text-dark-gray rounded"
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
