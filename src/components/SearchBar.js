import React, { useCallback } from 'react';

const SearchBar = ({ setSearchTerm }) => {
    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, [setSearchTerm]);

    return (
        <input
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
            className="w-50 p-2 border-2 border-gray-300 text-white bg-medium-gray rounded-xl"
        />
    );
};

export default SearchBar;

