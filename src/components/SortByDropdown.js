import React from 'react';

const SortByDropdown = ({ setSortMethod }) => {
  return (
    <div className="flex items-center">
      <label htmlFor="sortMethod" className="mr-2">Sort by: </label>
      <select 
        id="sortMethod"
        onChange={(e) => setSortMethod(e.target.value)}
        defaultValue="newest"
        className="py-2 px-4 border-2 border-medium-gray bg-light-gray hover:bg-true-gray hover:text-white rounded"
      >
        <option value="newest">Newest</option>
        <option value="highestRated">Highest rated</option>
        <option value="random">Random</option>
      </select>
    </div>
  );
};

export default SortByDropdown;
