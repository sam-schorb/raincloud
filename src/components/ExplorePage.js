import SearchBar from "./SearchBar";
import ListOfTables from "./ListOfTables";
import SortByDropdown from "./SortByDropdown";
import TagButtons from "./TagButtons";
import React, { useState, useEffect } from 'react';

function ExplorePage({ searchTerm, setSearchTerm, patchInfo }) {
  const [sortMethod, setSortMethod] = useState('newest');
  const [searchTag, setSearchTag] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);

useEffect(() => {
    setCurrentPage(1);
}, [searchTerm, sortMethod, searchTag]);

  return (
<div className="w-5/6 xs:w-5/6 sm:w-5/6 md:w-2/3 lg:w-2/3">
  <div className="text-2xl mb-5 -mt-6"><br />Patch Library</div>
  <div className="flex justify-left items-center mb-4 space-x-4">
    <SearchBar setSearchTerm={setSearchTerm} />
    <SortByDropdown setSortMethod={setSortMethod} />
  </div>
      <TagButtons setSelectedTag={setSearchTag} />
      <ListOfTables
          searchTerm={searchTerm}
          sortMethod={sortMethod}
          patchInfo={patchInfo}
          searchTag={searchTag}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

export default ExplorePage;
