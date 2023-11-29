import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // Make sure you have imported the icon

const SearchBar = ({ setSearchTerm }) => {
    const [tempSearch, setTempSearch] = useState('');

    const handleSearch = () => {
        setSearchTerm(tempSearch);
    };

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-4 pr-10 py-2 border-2 border-medium-gray text-medium-gray bg-light-gray rounded-xl placeholder-true-gray"
            />
            <button 
                onClick={handleSearch}
                className="absolute right-0 mt-3.5 mr-4"
            >
            <FaSearch className="text-true-gray" />
            </button>
        </div>
    );
};

export default SearchBar;
